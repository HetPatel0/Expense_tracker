import OpenAI from 'openai';

interface RawInsight {
  type?: string;
  title?: string;
  message?: string;
  action?: string;
  confidence?: number;
}

interface RawExpenseDigest {
  summary?: string;
  suggestions?: RawExpenseSuggestion[];
}

interface RawExpenseSuggestion {
  title?: string;
  detail?: string;
  priority?: string;
}

const DEFAULT_OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_FREE_ROUTER_MODEL = 'openrouter/free';
const DEFAULT_OPENROUTER_MODEL =
  'mistralai/mistral-small-3.1-24b-instruct:free';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-nano';
const DEFAULT_AI_TIMEOUT_MS = 8000;
const DEFAULT_AI_COOLDOWN_MS = 10 * 60 * 1000;

type AICircuitState = {
  nextRetryAt: number;
  reason: string;
};

declare global {
  var __expenseTrackerAICircuit: AICircuitState | undefined;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  action?: string;
  confidence: number;
}

export interface ExpenseSuggestion {
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ExpenseDigest {
  summary: string;
  suggestions: ExpenseSuggestion[];
}

function resolveAIConfig() {
  const apiKey =
    process.env.AI_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENAI_API_KEY;

  const explicitBaseURL = process.env.AI_BASE_URL;
  const useOpenRouter =
    explicitBaseURL?.includes('openrouter.ai') ??
    Boolean(
      process.env.OPENROUTER_API_KEY ||
        process.env.AI_API_KEY?.startsWith('sk-or-v1-')
    );

  const configuredModel = process.env.AI_MODEL;
  const normalizedModel =
    !configuredModel || configuredModel === OPENROUTER_FREE_ROUTER_MODEL
      ? useOpenRouter
        ? DEFAULT_OPENROUTER_MODEL
        : DEFAULT_OPENAI_MODEL
      : configuredModel;

  return {
    apiKey,
    baseURL:
      explicitBaseURL || (useOpenRouter ? DEFAULT_OPENROUTER_BASE_URL : undefined),
    model: normalizedModel,
    cooldownMs: Number(process.env.AI_RATE_LIMIT_COOLDOWN_MS || DEFAULT_AI_COOLDOWN_MS),
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || DEFAULT_AI_TIMEOUT_MS),
    useOpenRouter,
  };
}

function getAIClient() {
  const { apiKey, baseURL, timeoutMs, useOpenRouter } = resolveAIConfig();

  if (!apiKey) {
    throw new Error(
      'AI API key not configured. Set AI_API_KEY in your .env file.'
    );
  }

  return new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: timeoutMs,
    ...(baseURL ? { baseURL } : {}),
    ...(useOpenRouter
      ? {
          defaultHeaders: {
            'HTTP-Referer':
              process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'ExpenseTracker AI',
          },
        }
      : {}),
  });
}

function getAICircuitState() {
  return globalThis.__expenseTrackerAICircuit;
}

function setAICircuitState(state: AICircuitState | undefined) {
  globalThis.__expenseTrackerAICircuit = state;
}

export function getAIBlockState() {
  const state = getAICircuitState();

  if (!state) {
    return null;
  }

  if (Date.now() >= state.nextRetryAt) {
    setAICircuitState(undefined);
    return null;
  }

  return state;
}

export function isAIRateLimitError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as {
    code?: number | string;
    message?: string;
    status?: number;
  };

  return (
    maybeError.status === 429 ||
    maybeError.code === 429 ||
    maybeError.code === '429' ||
    maybeError.message?.includes('429') === true ||
    maybeError.message?.toLowerCase().includes('rate limit') === true
  );
}

function ensureAIRequestAllowed() {
  const state = getAIBlockState();

  if (!state) {
    return;
  }

  throw new Error(
    `AI temporarily unavailable until ${new Date(state.nextRetryAt).toISOString()} (${state.reason}).`
  );
}

async function runAIRequest<T>(operation: () => Promise<T>) {
  ensureAIRequestAllowed();

  try {
    return await operation();
  } catch (error) {
    if (isAIRateLimitError(error)) {
      const { cooldownMs } = resolveAIConfig();
      setAICircuitState({
        nextRetryAt: Date.now() + cooldownMs,
        reason: 'provider rate limit',
      });
    }

    throw error;
  }
}

function extractMessageText(content: unknown) {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part;
      }

      if (part && typeof part === 'object' && 'text' in part) {
        const text = (part as { text?: unknown }).text;
        return typeof text === 'string' ? text : '';
      }

      return '';
    })
    .join('\n')
    .trim();
}

function getCompletionText(completion: OpenAI.Chat.Completions.ChatCompletion) {
  const choice = completion.choices[0];
  const message = choice?.message;
  const content = extractMessageText(message?.content);

  if (content) {
    return content;
  }

  const refusal =
    message && 'refusal' in message && typeof message.refusal === 'string'
      ? message.refusal.trim()
      : '';

  if (refusal) {
    throw new Error(`Model refused the request: ${refusal}`);
  }

  throw new Error(
    `No text response from AI (finish_reason: ${choice?.finish_reason || 'unknown'}).`
  );
}

function extractJSONPayload(response: string) {
  let cleanedResponse = response.trim();

  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '');
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');
  }

  const objectStart = cleanedResponse.indexOf('{');
  const objectEnd = cleanedResponse.lastIndexOf('}');
  const arrayStart = cleanedResponse.indexOf('[');
  const arrayEnd = cleanedResponse.lastIndexOf(']');

  if (
    objectStart !== -1 &&
    objectEnd !== -1 &&
    (arrayStart === -1 || objectStart < arrayStart)
  ) {
    return cleanedResponse.slice(objectStart, objectEnd + 1);
  }

  if (arrayStart !== -1 && arrayEnd !== -1) {
    return cleanedResponse.slice(arrayStart, arrayEnd + 1);
  }

  return cleanedResponse;
}

function normalizeInsightType(type?: string): AIInsight['type'] {
  if (type === 'warning' || type === 'success' || type === 'tip') {
    return type;
  }

  return 'info';
}

function normalizePriority(priority?: string): ExpenseSuggestion['priority'] {
  if (priority === 'high' || priority === 'medium' || priority === 'low') {
    return priority;
  }

  return 'medium';
}

function buildExpenseAnalytics(expenses: ExpenseRecord[]) {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const categoryTotals = new Map<string, number>();

  for (const expense of expenses) {
    const currentTotal = categoryTotals.get(expense.category) || 0;
    categoryTotals.set(expense.category, currentTotal + expense.amount);
  }

  const topCategories = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
    }));

  const latestExpenses = expenses.slice(0, 12).map((expense) => ({
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    date: expense.date,
  }));

  const largestExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((expense) => ({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    }));

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
    totalSpent: Number(totalSpent.toFixed(2)),
    averageExpense: Number(averageExpense.toFixed(2)),
    topCategories,
    latestExpenses,
    largestExpenses,
    last7DaysTotal: Number(last7DaysTotal.toFixed(2)),
    previous7DaysTotal: Number(previous7DaysTotal.toFixed(2)),
    recordCount: expenses.length,
  };
}

export function isAIConfigured() {
  return Boolean(resolveAIConfig().apiKey);
}

export function getAIModelName() {
  return resolveAIConfig().model;
}

export async function generateExpenseInsights(
  expenses: ExpenseRecord[]
): Promise<AIInsight[]> {
  try {
    const openai = getAIClient();
    const prompt = `Analyze the following expense data and provide 3-4 actionable financial insights.
Return a JSON array of insights with this structure:
{
  "type": "warning|info|success|tip",
  "title": "Brief title",
  "message": "Detailed insight message with specific numbers when possible",
  "action": "Actionable suggestion",
  "confidence": 0.8
}

Expense Data:
${JSON.stringify(
  expenses.map((expense) => ({
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    date: expense.date,
  })),
  null,
  2
)}

Focus on:
1. Spending patterns
2. Budget alerts
3. Money-saving opportunities
4. Positive reinforcement for good habits

Return only valid JSON array, no additional text.`;

    const completion = await runAIRequest(() =>
      openai.chat.completions.create({
        model: getAIModelName(),
        messages: [
          {
            role: 'system',
            content:
              'You are a financial advisor AI that analyzes spending patterns and provides actionable insights. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 900,
      })
    );

    const response = getCompletionText(completion);
    const parsedInsights = JSON.parse(extractJSONPayload(response));
    if (!Array.isArray(parsedInsights)) {
      throw new Error('Invalid insight format');
    }

    return parsedInsights.map((insight: RawInsight, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      type: normalizeInsightType(insight.type),
      title: insight.title || 'AI Insight',
      message: insight.message || 'Analysis complete',
      action: insight.action,
      confidence: insight.confidence || 0.8,
    }));
  } catch (error) {
    console.error('Error generating AI insights:', error);

    return [
      {
        id: 'fallback-1',
        type: 'info',
        title: 'AI Analysis Unavailable',
        message:
          'Unable to generate personalized insights at this time. Please try again later.',
        action: 'Refresh insights',
        confidence: 0.5,
      },
    ];
  }
}

export async function generateExpenseDigest(
  expenses: ExpenseRecord[]
): Promise<ExpenseDigest> {
  const openai = getAIClient();
  const analytics = buildExpenseAnalytics(expenses);

  const prompt = `Use the analytics below to write a short expense summary and 3 specific suggestions.
Return valid JSON only in this shape:
{
  "summary": "2-3 sentences, under 70 words, concrete and useful",
  "suggestions": [
    {
      "title": "Short action title",
      "detail": "One sentence with a specific recommendation tied to the data",
      "priority": "high|medium|low"
    }
  ]
}

Expense analytics:
${JSON.stringify(analytics, null, 2)}

Rules:
- Be specific with categories, totals, and recent changes when available.
- Keep the tone practical.
- Avoid generic budgeting advice unless the data supports it.
- Return exactly 3 suggestions.
- Do not wrap the JSON in markdown.`;

  const completion = await runAIRequest(() =>
    openai.chat.completions.create({
      model: getAIModelName(),
      messages: [
        {
          role: 'system',
          content:
            'You are an expense coach. Respond with valid JSON only. Keep the output concise, specific, and actionable.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 700,
    })
  );

  const response = getCompletionText(completion);
  const parsedDigest = JSON.parse(
    extractJSONPayload(response)
  ) as RawExpenseDigest;

  if (!parsedDigest.summary?.trim()) {
    throw new Error('Invalid digest summary');
  }

  const suggestions = Array.isArray(parsedDigest.suggestions)
    ? parsedDigest.suggestions
        .map((suggestion) => ({
          title: suggestion.title?.trim() || 'Review your spending',
          detail:
            suggestion.detail?.trim() ||
            'Look at your recent transactions and tighten the category with the biggest share.',
          priority: normalizePriority(suggestion.priority),
        }))
        .slice(0, 3)
    : [];

  return {
    summary: parsedDigest.summary.trim(),
    suggestions,
  };
}

export async function categorizeExpense(description: string): Promise<string> {
  try {
    const openai = getAIClient();
    const completion = await runAIRequest(() =>
      openai.chat.completions.create({
        model: getAIModelName(),
        messages: [
          {
            role: 'system',
            content:
              'You are an expense categorization AI. Categorize expenses into one of these categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other. Respond with only the category name.',
          },
          {
            role: 'user',
            content: `Categorize this expense: "${description}"`,
          },
        ],
        temperature: 0.1,
        max_tokens: 20,
      })
    );

    const category = getCompletionText(completion);

    const validCategories = [
      'Food',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Bills',
      'Healthcare',
      'Other',
    ];

    return validCategories.includes(category || '') ? category! : 'Other';
  } catch (error) {
    console.error('Error categorizing expense:', error);
    return 'Other';
  }
}

export async function generateAIAnswer(
  question: string,
  context: ExpenseRecord[]
): Promise<string> {
  try {
    const openai = getAIClient();
    const prompt = `Based on the following expense data, provide a detailed and actionable answer to this question: "${question}"

Expense Data:
${JSON.stringify(
  context.map((expense) => ({
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    date: expense.date,
  })),
  null,
  2
)}

Provide a concise answer that:
1. Addresses the question directly
2. Uses concrete data from the expenses when possible
3. Offers actionable advice
4. Stays within 2-3 sentences

Return only the answer text, no additional formatting.`;

    const completion = await runAIRequest(() =>
      openai.chat.completions.create({
        model: getAIModelName(),
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful financial advisor AI that provides specific, actionable answers based on expense data. Be concise and direct.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 220,
      })
    );

    const response = getCompletionText(completion);
    return response.trim();
  } catch (error) {
    console.error('Error generating AI answer:', error);
    return "I'm unable to provide a detailed answer at the moment. Please try refreshing the insights or check your connection.";
  }
}
