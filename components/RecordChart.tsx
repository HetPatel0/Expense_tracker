import getRecords from '@/actions/getRecords';
import BarChart from './BarChart';
import { ChartNoAxesColumn, Sparkles } from 'lucide-react';
import { InfiniteSlider } from './ui/infinite-slider';
import { ProgressiveBlur } from './ui/progressive-blur';

const chartHighlights = [
  'Daily trend mapping',
  'Category-aware tooltips',
  'Adaptive color intensity',
  'Designed for quick scanning',
];

const cardClass =
  'rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none sm:p-6';

const RecordChart = async () => {
  const { records, error } = await getRecords();

  if (error) {
    return (
      <div className={cardClass}>
        <div className='mb-5 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-slate-800 to-slate-700 text-white shadow-lg dark:from-sky-600 dark:to-blue-600'>
            <ChartNoAxesColumn className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl'>
              Expense Chart
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Visual representation of your spending
            </p>
          </div>
        </div>
        <div className='rounded-xl border border-red-200 bg-red-50/80 p-3 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300 sm:p-4'>
          <p className='text-sm font-semibold'>Error loading chart data</p>
          <p className='mt-1 text-xs'>{error}</p>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className={cardClass}>
        <div className='mb-5 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-slate-800 to-slate-700 text-white shadow-lg dark:from-sky-600 dark:to-blue-600'>
            <ChartNoAxesColumn className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl'>
              Expense Chart
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Visual representation of your spending
            </p>
          </div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-slate-50/80 p-6 text-center dark:border-slate-700 dark:bg-slate-900 sm:p-8'>
          <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-md dark:bg-slate-800'>
            📈
          </div>
          <h4 className='text-base font-bold text-slate-800 dark:text-slate-100 sm:text-lg'>
            No Data to Display
          </h4>
          <p className='mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400'>
            Add some records and this chart will start showing your spending
            trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className='mb-5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-slate-800 to-slate-700 text-white shadow-lg dark:from-sky-600 dark:to-blue-600'>
            <ChartNoAxesColumn className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl'>
              Expense Chart
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Visual representation of your spending
            </p>
          </div>
        </div>
        <span className='inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'>
          <Sparkles className='h-3.5 w-3.5' />
          Live
        </span>
      </div>

      <div className='relative mb-4 overflow-hidden rounded-2xl border border-slate-300/70 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-900'>
        <InfiniteSlider speed={30} speedOnHover={16} gap={8}>
          {chartHighlights.map((item) => (
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

      <div className='overflow-x-auto rounded-2xl border border-slate-300/70 bg-white/85 p-2 shadow-inner dark:border-slate-700 dark:bg-slate-950/40 sm:p-3'>
        <BarChart
          records={records.map((record) => ({
            ...record,
            date: String(record.date),
          }))}
        />
      </div>
    </div>
  );
};

export default RecordChart;
