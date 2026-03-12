'use server';

import {
  ExpenseRecord,
  ExpenseSuggestion,
  getAIBlockState,
  generateExpenseDigest,
  getAIModelName,
  isAIRateLimitError,
  isAIConfigured,
} from '@/lib/ai';
import { db } from '@/lib/db';
import { getSession } from '@/lib/server';

type DigestStatus = 'ready' | 'missing-key' | 'fallback' | 'empty' | 'error';
const DIGEST_CACHE_TTL_MS = 15 * 60 * 1000;

interface CachedDigestEntry {
  expiresAt: number;
  fingerprint: string;
  value: ExpenseDigestView;
}

declare global {
  var __expenseDigestCache: Map<string, CachedDigestEntry> | undefined;
}

export interface ExpenseDigestView {
  averageExpense: number;
  model: string | null;
  note: string;
  recordCount: number;
  status: DigestStatus;
  suggestions: ExpenseSuggestion[];
  summary: string;
  topCategory: string;
  totalSpent: number;
}

interface ExpenseSnapshot {
  averageExpense: number;
  biggestExpense: ExpenseRecord | null;
  last7DaysTotal: number;
  previous7DaysTotal: number;
  recordCount: number;
  topCategory: string;
  topCategoryTotal: number;
  totalSpent: number;
}

function formatCurrency(value: number) {
  return `Rs ${value.toFixed(2)}`;
}

function formatRetryTime(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function getDigestCache() {
  if (!globalThis.__expenseDigestCache) {
    globalThis.__expenseDigestCache = new Map();
  }

  return globalThis.__expenseDigestCache;
}

function buildExpenseFingerprint(expenses: ExpenseRecord[]) {
  return JSON.stringify(
    expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
    }))
  );
}

function getCachedDigest(userId: string, fingerprint: string) {
  const cache = getDigestCache();
  const entry = cache.get(userId);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt || entry.fingerprint !== fingerprint) {
    cache.delete(userId);
    return null;
  }

  return entry.value;
}

function setCachedDigest(
  userId: string,
  fingerprint: string,
  value: ExpenseDigestView
) {
  getDigestCache().set(userId, {
    expiresAt: Date.now() + DIGEST_CACHE_TTL_MS,
    fingerprint,
    value,
  });
}

function buildExpenseSnapshot(expenses: ExpenseRecord[]): ExpenseSnapshot {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const categoryTotals = new Map<string, number>();

  for (const expense of expenses) {
    const categoryTotal = categoryTotals.get(expense.category) || 0;
    categoryTotals.set(expense.category, categoryTotal + expense.amount);
  }

  const [topCategory = 'Other', topCategoryTotal = 0] =
    [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0] || [];

  const biggestExpense =
    [...expenses].sort((a, b) => b.amount - a.amount)[0] || null;

  const now = new Date();
  const last7DaysStart = new Date(now);
  last7DaysStart.setDate(last7DaysStart.getDate() - 7);

  const previous7DaysStart = new Date(now);
  previous7DaysStart.setDate(previous7DaysStart.getDate() - 14);

  const last7DaysTotal = expenses
    .filter((expense) => new Date(expense.date) >= last7DaysStart)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const previous7DaysTotal = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= previous7DaysStart && expenseDate < last7DaysStart;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  return {
    averageExpense,
    biggestExpense,
    last7DaysTotal,
    previous7DaysTotal,
    recordCount: expenses.length,
    topCategory,
    topCategoryTotal,
    totalSpent,
  };
}

function buildFallbackSummary(snapshot: ExpenseSnapshot) {
  const parts = [
    `You logged ${snapshot.recordCount} expenses totaling ${formatCurrency(snapshot.totalSpent)} in the last 30 days.`,
  ];

  if (snapshot.topCategoryTotal > 0) {
    parts.push(
      `${snapshot.topCategory} led your spending at ${formatCurrency(snapshot.topCategoryTotal)}.`
    );
  }

  if (snapshot.previous7DaysTotal > 0) {
    const change =
      ((snapshot.last7DaysTotal - snapshot.previous7DaysTotal) /
        snapshot.previous7DaysTotal) *
      100;

    if (change > 0) {
      parts.push(
        `Your last 7 days ran ${Math.round(change)}% above the previous week.`
      );
    } else {
      parts.push(
        `Your last 7 days ran ${Math.round(Math.abs(change))}% below the previous week.`
      );
    }
  } else {
    parts.push(
      `Recent activity is ${formatCurrency(snapshot.last7DaysTotal)} over the last 7 days.`
    );
  }

  return parts.join(' ');
}

function buildFallbackSuggestions(snapshot: ExpenseSnapshot): ExpenseSuggestion[] {
  const suggestions: ExpenseSuggestion[] = [];
  const topCategoryShare =
    snapshot.totalSpent > 0 ? snapshot.topCategoryTotal / snapshot.totalSpent : 0;

  if (snapshot.topCategoryTotal > 0) {
    suggestions.push({
      title: `Cap ${snapshot.topCategory} spend`,
      detail: `${snapshot.topCategory} makes up ${Math.round(topCategoryShare * 100)}% of your recent spending. Set a weekly limit before it expands further.`,
      priority: topCategoryShare >= 0.4 ? 'high' : 'medium',
    });
  }

  if (snapshot.biggestExpense) {
    suggestions.push({
      title: 'Review the largest charge',
      detail: `${snapshot.biggestExpense.description} cost ${formatCurrency(snapshot.biggestExpense.amount)}. Decide whether it was a one-off or something that needs a planned budget line.`,
      priority: 'medium',
    });
  }

  if (snapshot.last7DaysTotal > snapshot.previous7DaysTotal) {
    suggestions.push({
      title: 'Slow this week early',
      detail: `You spent ${formatCurrency(snapshot.last7DaysTotal)} in the last 7 days versus ${formatCurrency(snapshot.previous7DaysTotal)} the week before. A mid-week review would catch the spike sooner.`,
      priority: 'high',
    });
  } else {
    suggestions.push({
      title: 'Keep the weekly review habit',
      detail: `Your average expense is ${formatCurrency(snapshot.averageExpense)}. A quick weekly check-in should keep the current pace stable.`,
      priority: 'low',
    });
  }

  while (suggestions.length < 3) {
    suggestions.push({
      title: 'Group small discretionary spends',
      detail: 'Bundle low-priority purchases into one planned spend window so they stop leaking across the week.',
      priority: 'low',
    });
  }

  return suggestions.slice(0, 3);
}

function mergeSuggestions(
  primary: ExpenseSuggestion[],
  fallback: ExpenseSuggestion[]
) {
  const merged: ExpenseSuggestion[] = [];
  const seen = new Set<string>();

  for (const suggestion of [...primary, ...fallback]) {
    const key = suggestion.title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(suggestion);

    if (merged.length === 3) {
      break;
    }
  }

  return merged;
}

export async function getExpenseDigest(): Promise<ExpenseDigestView> {
  let snapshot: ExpenseSnapshot | null = null;
  let userId: string | null = null;
  let fingerprint = '';

  try {
    const user = await getSession().then((session) => session?.user);

    if (!user) {
      return {
        averageExpense: 0,
        model: null,
        note: 'Sign in to load your expense summary.',
        recordCount: 0,
        status: 'error',
        suggestions: [],
        summary: 'Your AI expense summary will appear here after you sign in.',
        topCategory: 'Other',
        totalSpent: 0,
      };
    }

    userId = user.id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await db.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 40,
    });

    const expenseData: ExpenseRecord[] = expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category || 'Other',
      description: expense.text,
      date: expense.date.toISOString(),
    }));

    if (expenseData.length === 0) {
      return {
        averageExpense: 0,
        model: null,
        note: 'Add a few expenses to unlock the AI summary and suggestions panel.',
        recordCount: 0,
        status: 'empty',
        suggestions: [
          {
            title: 'Log recent purchases',
            detail: 'Add at least a few expenses from the last month so the assistant has enough data to analyze patterns.',
            priority: 'medium',
          },
          {
            title: 'Use clear descriptions',
            detail: 'Descriptions like groceries, rent, fuel, or coffee make category advice and summaries much more accurate.',
            priority: 'low',
          },
          {
            title: 'Track the actual expense date',
            detail: 'Using the real spend date helps the summary spot weekly spikes instead of just recent entries.',
            priority: 'low',
          },
        ],
        summary:
          'No expense data is available for the last 30 days yet. Start logging records to generate an AI summary and practical suggestions.',
        topCategory: 'Other',
        totalSpent: 0,
      };
    }

    snapshot = buildExpenseSnapshot(expenseData);
    fingerprint = buildExpenseFingerprint(expenseData);
    const fallbackSuggestions = buildFallbackSuggestions(snapshot);
    const fallbackSummary = buildFallbackSummary(snapshot);
    const cachedDigest = getCachedDigest(user.id, fingerprint);

    if (!isAIConfigured()) {
      return {
        averageExpense: snapshot.averageExpense,
        model: null,
        note: 'Add AI_API_KEY to your .env file to replace this local fallback with an LLM-generated summary.',
        recordCount: snapshot.recordCount,
        status: 'missing-key',
        suggestions: fallbackSuggestions,
        summary: fallbackSummary,
        topCategory: snapshot.topCategory,
        totalSpent: snapshot.totalSpent,
      };
    }

    const aiBlockState = getAIBlockState();

    if (aiBlockState) {
      if (cachedDigest) {
        return {
          ...cachedDigest,
          note: `Using cached AI summary while the free provider is rate-limited until ${formatRetryTime(aiBlockState.nextRetryAt)}.`,
        };
      }

      return {
        averageExpense: snapshot.averageExpense,
        model: getAIModelName(),
        note: `Free AI provider is rate-limited until ${formatRetryTime(aiBlockState.nextRetryAt)}. Showing local fallback summary.`,
        recordCount: snapshot.recordCount,
        status: 'fallback',
        suggestions: fallbackSuggestions,
        summary: fallbackSummary,
        topCategory: snapshot.topCategory,
        totalSpent: snapshot.totalSpent,
      };
    }

    if (cachedDigest) {
      return {
        ...cachedDigest,
        note: `Using cached AI summary from ${getAIModelName()} to avoid unnecessary provider calls.`,
      };
    }

    const digest = await generateExpenseDigest(expenseData);

    const readyDigest: ExpenseDigestView = {
      averageExpense: snapshot.averageExpense,
      model: getAIModelName(),
      note: `Generated with ${getAIModelName()}.`,
      recordCount: snapshot.recordCount,
      status: 'ready',
      suggestions: mergeSuggestions(digest.suggestions, fallbackSuggestions),
      summary: digest.summary,
      topCategory: snapshot.topCategory,
      totalSpent: snapshot.totalSpent,
    };

    setCachedDigest(user.id, fingerprint, readyDigest);

    return readyDigest;
  } catch (error) {
    const rateLimited = isAIRateLimitError(error);

    if (rateLimited) {
      console.warn('AI provider rate-limited expense digest requests; using fallback.');
    } else {
      console.error('Error building expense digest:', error);
    }

    if (snapshot) {
      if (userId && fingerprint) {
        const cachedDigest = getCachedDigest(userId, fingerprint);
        if (cachedDigest) {
          return {
            ...cachedDigest,
            note: 'Using cached AI summary because the provider is temporarily unavailable.',
          };
        }
      }

      return {
        averageExpense: snapshot.averageExpense,
        model: null,
        note: rateLimited
          ? 'Free AI provider is rate-limited, so a local fallback summary is being shown.'
          : 'AI summary temporarily unavailable, so a local fallback summary is being shown.',
        recordCount: snapshot.recordCount,
        status: 'fallback',
        suggestions: buildFallbackSuggestions(snapshot),
        summary: buildFallbackSummary(snapshot),
        topCategory: snapshot.topCategory,
        totalSpent: snapshot.totalSpent,
      };
    }

    return {
      averageExpense: 0,
      model: null,
      note: rateLimited
        ? 'Free AI provider is rate-limited.'
        : 'AI summary temporarily unavailable.',
      recordCount: 0,
      status: 'fallback',
      suggestions: [
        {
          title: 'Retry after saving a record',
          detail: 'The summary request failed, so refresh the dashboard after your next expense entry.',
          priority: 'medium',
        },
        {
          title: 'Verify your AI key',
          detail: 'Check that AI_API_KEY is set correctly in your local .env file.',
          priority: 'high',
        },
        {
          title: 'Keep descriptions specific',
          detail: 'Specific record text improves the quality of the next generated summary.',
          priority: 'low',
        },
      ],
      summary:
        'The expense digest could not be generated right now. Review your AI configuration or try again after refreshing the dashboard.',
      topCategory: 'Other',
      totalSpent: 0,
    };
  }
}
