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
  'rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none sm:p-6';

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
    <div className={cardClass}>
      <div className='mb-5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-slate-800 to-slate-700 text-white shadow-lg dark:from-sky-600 dark:to-blue-600'>
            <FileChartColumn className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl'>
              Expense Stats
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Spending insights and ranges
            </p>
          </div>
        </div>
        <span className='inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'>
          <Sparkles className='h-3.5 w-3.5' />
          Insight
        </span>
      </div>

      {hasError && (
        <p className='mb-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-300'>
          Some stats may be unavailable right now.
        </p>
      )}

      <div className='relative mb-4 overflow-hidden rounded-2xl border border-slate-300/70 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-900'>
        <InfiniteSlider speed={30} speedOnHover={16} gap={8}>
          {statHighlights.map((item) => (
            <span
              key={item}
              className='inline-flex items-center rounded-full border border-slate-300/70 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
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
        <div className='rounded-2xl border border-slate-300/70 bg-slate-50/85 p-4 text-center dark:border-slate-700 dark:bg-slate-900'>
          <p className='mb-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300'>
            Average Daily Spending
          </p>
          <div className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
            Rs {averageExpense.toFixed(2)}
          </div>
          <p className='mt-2 text-xs text-slate-600 dark:text-slate-300'>
            Based on {validDays} day{validDays > 1 ? 's' : ''} with records
          </p>
        </div>

        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3'>
          <div className='rounded-xl border border-red-200/80 bg-red-50/80 p-3 dark:border-red-900/70 dark:bg-red-950/25 sm:p-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900/55 dark:text-red-300'>
                <ArrowUpRight className='h-4 w-4' />
              </div>
              <div>
                <h4 className='text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400'>
                  Highest
                </h4>
                <p className='text-lg font-bold text-red-700 dark:text-red-300'>
                  {bestExpense !== undefined ? `Rs ${bestExpense}` : 'No data'}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3 dark:border-emerald-900/70 dark:bg-emerald-950/25 sm:p-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/55 dark:text-emerald-300'>
                <ArrowDownRight className='h-4 w-4' />
              </div>
              <div>
                <h4 className='text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400'>
                  Lowest
                </h4>
                <p className='text-lg font-bold text-emerald-700 dark:text-emerald-300'>
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
