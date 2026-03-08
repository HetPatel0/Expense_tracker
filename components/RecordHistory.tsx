import getRecords from '@/actions/getRecords';
import RecordItem from './RecordItem';
import { Record } from '@/types/records';

const RecordHistory = async () => {
  const { records, error } = await getRecords();
  const cardClass =
    'rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none sm:p-6';

  if (error) {
    return (
      <div className={cardClass}>
        <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
              Expense History
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              Your spending timeline
            </p>
          </div>
        </div>
        <div className='bg-linear-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-l-red-500 p-3 sm:p-4 rounded-xl'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center'>
              <span className='text-base sm:text-lg'>⚠️</span>
            </div>
            <h4 className='font-bold text-red-800 dark:text-red-300 text-sm'>
              Error loading expense history
            </h4>
          </div>
          <p className='text-red-700 dark:text-red-400 ml-8 sm:ml-10 text-xs'>
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
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-slate-800 to-slate-700 dark:from-sky-600 dark:to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
              Expense History
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              Your spending timeline
            </p>
          </div>
        </div>
        <div className='text-center py-6 sm:py-8'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl sm:text-3xl'>📊</span>
          </div>
          <h4 className='text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2'>
            No Expense Records Found
          </h4>
          <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm'>
            Start tracking your expenses to see your spending history and
            patterns here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
        <div className='w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-slate-800 to-slate-700 dark:from-sky-600 dark:to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
          <span className='text-white text-sm sm:text-lg'>📝</span>
        </div>
        <div>
          <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
            Expense History
          </h3>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
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
