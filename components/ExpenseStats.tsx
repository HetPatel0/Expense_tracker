import getBestWorstExpense from '@/actions/getBestWorstExpense';
import getUserRecord from '@/actions/getUserRecord';
import {
  ArrowDownRight,
  ArrowUpRight,
  FileChartColumn,
  Sparkles,
} from 'lucide-react';
import { InfiniteSlider } from './ui/infinite-slider';
import { ProgressiveBlur } from './ui/progressive-blur';

const statHighlights = [
  'Average daily burn rate',
  'Highest and lowest entries',
  'Range visibility for planning',
  'Snapshot for quick decisions',
];

const cardClass =
  'rounded-3xl border border-border/70 bg-card/75 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl sm:p-6';

const ExpenseStats = async () => {
  const [userRecordResult, rangeResult] = await Promise.all([
    getUserRecord(),
    getBestWorstExpense(),
  ]);

  const { record, daysWithRecords } = userRecordResult;
  const { bestExpense, worstExpense } = rangeResult;

  const validRecord = record || 0;
  const validDays = daysWithRecords && daysWithRecords > 0 ? daysWithRecords : 1;
  const averageExpense = validRecord / validDays;
  const hasError = Boolean(userRecordResult.error || rangeResult.error);

  return (
    <div id='insights' className={`${cardClass} scroll-mt-28`}>
      <div className='mb-5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
            <FileChartColumn className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-foreground sm:text-xl'>
              Expense Stats
            </h3>
            <p className='text-xs text-muted-foreground'>
              Spending insights and ranges
            </p>
          </div>
        </div>
        <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
          <Sparkles className='h-3.5 w-3.5' />
          Insight
        </span>
      </div>

      {hasError && (
        <p className='mb-3 rounded-lg border border-accent bg-accent/50 px-3 py-2 text-xs text-accent-foreground'>
          Some stats may be unavailable right now.
        </p>
      )}

      <div className='relative mb-4 overflow-hidden rounded-2xl border border-border/70 bg-muted/60 p-2'>
        <InfiniteSlider speed={30} speedOnHover={16} gap={8}>
          {statHighlights.map((item) => (
            <span
              key={item}
              className='inline-flex items-center rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-foreground'
            >
              {item}
            </span>
          ))}
        </InfiniteSlider>
        <ProgressiveBlur
          className='pointer-events-none absolute inset-y-0 left-0 w-10'
          direction='left'
          blurIntensity={0.9}
        />
        <ProgressiveBlur
          className='pointer-events-none absolute inset-y-0 right-0 w-10'
          direction='right'
          blurIntensity={0.9}
        />
      </div>

      <div className='space-y-3 sm:space-y-4'>
        <div className='rounded-2xl border border-border/70 bg-muted/60 p-4 text-center'>
          <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Average Daily Spending
          </p>
          <div className='text-3xl font-bold text-foreground'>
            Rs {averageExpense.toFixed(2)}
          </div>
          <p className='mt-2 text-xs text-muted-foreground'>
            Based on {validDays} day{validDays > 1 ? 's' : ''} with records
          </p>
        </div>

        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3'>
          <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-3 sm:p-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/15 text-destructive'>
                <ArrowUpRight className='h-4 w-4' />
              </div>
              <div>
                <h4 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Highest
                </h4>
                <p className='text-lg font-bold text-destructive'>
                  {bestExpense !== undefined ? `Rs ${bestExpense}` : 'No data'}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-primary/20 bg-primary/10 p-3 sm:p-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary'>
                <ArrowDownRight className='h-4 w-4' />
              </div>
              <div>
                <h4 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Lowest
                </h4>
                <p className='text-lg font-bold text-primary'>
                  {worstExpense !== undefined ? `Rs ${worstExpense}` : 'No data'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;
