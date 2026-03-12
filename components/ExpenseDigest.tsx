import { getExpenseDigest } from '@/actions/getExpenseDigest';
import { Bot, CircleAlert, Lightbulb, Sparkles, Wallet } from 'lucide-react';

const cardClass =
  'rounded-3xl border border-border/70 bg-card/75 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl sm:p-6';

const priorityClasses = {
  high: 'border-destructive/20 bg-destructive/10 text-destructive',
  medium: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  low: 'border-primary/20 bg-primary/10 text-primary',
} as const;

const statusClasses = {
  ready: 'border-primary/20 bg-primary/10 text-primary',
  'missing-key':
    'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  fallback:
    'border-destructive/20 bg-destructive/10 text-destructive',
  empty: 'border-border/70 bg-muted/60 text-muted-foreground',
  error: 'border-destructive/20 bg-destructive/10 text-destructive',
} as const;

function formatCurrency(value: number) {
  return `Rs ${value.toFixed(2)}`;
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-2xl border border-border/70 bg-muted/60 p-4'>
      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <p className='mt-2 text-lg font-bold text-foreground sm:text-xl'>
        {value}
      </p>
    </div>
  );
}

export function ExpenseDigestFallback() {
  return (
    <section className={cardClass}>
      <div className='mb-5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary'>
            <Bot className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-foreground sm:text-xl'>
              AI Expense Summary
            </h3>
            <p className='text-xs text-muted-foreground'>
              Preparing summary and suggestions
            </p>
          </div>
        </div>
        <div className='h-6 w-24 animate-pulse rounded-full bg-muted' />
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='h-24 animate-pulse rounded-2xl border border-border/70 bg-muted/60'
          />
        ))}
      </div>

      <div className='mt-4 h-28 animate-pulse rounded-2xl border border-border/70 bg-muted/60' />

      <div className='mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='h-36 animate-pulse rounded-2xl border border-border/70 bg-muted/60'
          />
        ))}
      </div>
    </section>
  );
}

const ExpenseDigest = async () => {
  const digest = await getExpenseDigest();

  return (
    <section id='ai-digest' className={`${cardClass} scroll-mt-28`}>
      <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
            <Bot className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-foreground sm:text-xl'>
              AI Expense Summary
            </h3>
            <p className='text-xs text-muted-foreground'>
              Last 30 days of spending, condensed into actions
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 self-start rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[digest.status]}`}
        >
          {digest.status === 'ready' ? (
            <Sparkles className='h-3.5 w-3.5' />
          ) : (
            <CircleAlert className='h-3.5 w-3.5' />
          )}
          {digest.status === 'ready'
            ? 'LLM Summary'
            : digest.status === 'missing-key'
              ? 'Config Needed'
              : digest.status === 'empty'
                ? 'Awaiting Data'
                : 'Fallback'}
        </span>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        <Metric label='Spent' value={formatCurrency(digest.totalSpent)} />
        <Metric label='Records' value={digest.recordCount.toString()} />
        <Metric
          label='Top Category'
          value={digest.topCategory || 'Other'}
        />
      </div>

      <div className='mt-4 rounded-2xl border border-border/70 bg-background/80 p-4'>
        <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          <Wallet className='h-4 w-4' />
          Summary
        </div>
        <p className='mt-3 text-sm leading-6 text-foreground sm:text-[15px]'>
          {digest.summary}
        </p>
        <p className='mt-3 text-xs text-muted-foreground'>
          Average expense: {formatCurrency(digest.averageExpense)}
          {digest.model ? ` • Model: ${digest.model}` : ''}
        </p>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3'>
        {digest.suggestions.map((suggestion) => (
          <article
            key={suggestion.title}
            className='rounded-2xl border border-border/70 bg-muted/60 p-4'
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary'>
                  <Lightbulb className='h-4 w-4' />
                </div>
                <h4 className='text-sm font-semibold text-foreground'>
                  {suggestion.title}
                </h4>
              </div>

              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${priorityClasses[suggestion.priority]}`}
              >
                {suggestion.priority}
              </span>
            </div>

            <p className='mt-4 text-sm leading-6 text-muted-foreground'>
              {suggestion.detail}
            </p>
          </article>
        ))}
      </div>

      <div
        className={`mt-4 rounded-xl border px-3 py-2 text-xs ${statusClasses[digest.status]}`}
      >
        {digest.note}
      </div>
    </section>
  );
};

export default ExpenseDigest;
