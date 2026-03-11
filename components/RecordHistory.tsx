import getRecords from '@/actions/getRecords';
import RecordItem from './RecordItem';
import { Record } from '@/types/records';

const RecordHistory = async () => {
  const { records, error } = await getRecords();
  const cardClass =
    'rounded-3xl border border-border/70 bg-card/75 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl sm:p-6';

  if (error) {
    return (
      <div className={cardClass}>
        <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
          <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-lg sm:h-10 sm:w-10'>
            <span className='text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold text-foreground'>
              Expense History
            </h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Your spending timeline
            </p>
          </div>
        </div>
        <div className='rounded-xl border border-destructive/20 border-l-4 border-l-destructive bg-destructive/10 p-3 sm:p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-destructive/15 sm:h-8 sm:w-8'>
              <span className='text-base sm:text-lg'>⚠️</span>
            </div>
            <h4 className='text-sm font-bold text-destructive'>
              Error loading expense history
            </h4>
          </div>
          <p className='ml-8 text-xs text-destructive sm:ml-10'>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className={cardClass}>
        <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
          <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg sm:h-10 sm:w-10'>
            <span className='text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold text-foreground'>
              Expense History
            </h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Your spending timeline
            </p>
          </div>
        </div>
        <div className='text-center py-6 sm:py-8'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted sm:h-20 sm:w-20'>
            <span className='text-2xl sm:text-3xl'>📊</span>
          </div>
          <h4 className='mb-2 text-base font-bold text-foreground sm:text-lg'>
            No Expense Records Found
          </h4>
          <p className='mx-auto max-w-md text-sm text-muted-foreground'>
            Start tracking your expenses to see your spending history and
            patterns here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id='records' className={`${cardClass} scroll-mt-28`}>
      <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
        <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg sm:h-10 sm:w-10'>
          <span className='text-sm sm:text-lg'>📝</span>
        </div>
        <div>
          <h3 className='text-lg sm:text-xl font-bold text-foreground'>
            Expense History
          </h3>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Your spending timeline
          </p>
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
        {records.map((record: Record) => (
          <RecordItem key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
};

export default RecordHistory;
