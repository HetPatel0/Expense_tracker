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
  'rounded-3xl border border-border/70 bg-card/75 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl sm:p-6';

const RecordChart = async () => {
  const { records, error } = await getRecords();

  if (error) {
    return (
      <div className={cardClass}>
        <div className='mb-5 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
            <ChartNoAxesColumn className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-foreground sm:text-xl'>
              Expense Chart
            </h3>
            <p className='text-xs text-muted-foreground'>
              Visual representation of your spending
            </p>
          </div>
        </div>
        <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-destructive sm:p-4'>
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
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
            <ChartNoAxesColumn className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-foreground sm:text-xl'>
              Expense Chart
            </h3>
            <p className='text-xs text-muted-foreground'>
              Visual representation of your spending
            </p>
          </div>
        </div>
        <div className='rounded-xl border border-border bg-muted/60 p-6 text-center sm:p-8'>
          <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-background text-2xl shadow-md'>
            📈
          </div>
          <h4 className='text-base font-bold text-foreground sm:text-lg'>
            No Data to Display
          </h4>
          <p className='mx-auto mt-2 max-w-md text-sm text-muted-foreground'>
            Add some records and this chart will start showing your spending
            trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id='trends' className={`${cardClass} scroll-mt-28`}>
      <div className='mb-5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
            <ChartNoAxesColumn className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-foreground sm:text-xl'>
              Expense Chart
            </h3>
            <p className='text-xs text-muted-foreground'>
              Visual representation of your spending
            </p>
          </div>
        </div>
        <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
          <Sparkles className='h-3.5 w-3.5' />
          Live
        </span>
      </div>

      <div className='relative mb-4 overflow-hidden rounded-2xl border border-border/70 bg-muted/60 p-2'>
        <InfiniteSlider speed={30} speedOnHover={16} gap={8}>
          {chartHighlights.map((item) => (
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

      <div className='overflow-x-auto rounded-2xl border border-border/70 bg-background/85 p-2 shadow-inner sm:p-3'>
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
