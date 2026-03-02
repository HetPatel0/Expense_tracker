import getBestWorstExpense from '@/actions/getBestWorstExpense';
import getUserRecord from '@/actions/getUserRecord';
import { FileChartColumn } from 'lucide-react';

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
    <div className='backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl'>
      <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
        <div className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg'>
          <span className='text-white text-sm sm:text-lg'>
            <FileChartColumn />
          </span>
        </div>
        <div>
          <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
            Expense Statistics
          </h3>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
            Your spending insights and ranges
          </p>
        </div>
      </div>

      {hasError && (
        <p className='mb-3 text-xs text-amber-600 dark:text-amber-400'>
          Some stats may be unavailable right now.
        </p>
      )}

      <div className='space-y-3 sm:space-y-4'>
        <div className='bg-linear-to-r from-blue-50/50 to-sky-50/50 dark:from-blue-900/10 dark:to-sky-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/50'>
          <div className='text-center'>
            <p className='text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 tracking-wide uppercase'>
              Average Daily Spending
            </p>
            <div className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
              Rs{averageExpense.toFixed(2)}
            </div>
            <div className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-medium'>
              <span className='w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full'></span>
              Based on {validDays} days with expenses
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3'>
          <div className='bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl border-l-4 border-l-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-red-100 dark:bg-red-800 rounded-xl flex items-center justify-center shrink-0'>
                <span className='text-sm leading-none text-red-600 dark:text-red-300 font-bold'>
                  ↑
                </span>
              </div>
              <div className='flex-1'>
                <h4 className='font-bold text-gray-900 dark:text-gray-100 text-xs mb-0.5'>
                  Highest
                </h4>
                <p className='text-lg font-bold text-red-600 dark:text-red-300'>
                  {bestExpense !== undefined ? `Rs ${bestExpense}` : 'No data'}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl border-l-4 border-l-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center shrink-0'>
                <span className='text-sm leading-none text-green-600 dark:text-green-300 font-bold'>
                  ↓
                </span>
              </div>
              <div className='flex-1'>
                <h4 className='font-bold text-gray-900 dark:text-gray-100 text-xs mb-0.5'>
                  Lowest
                </h4>
                <p className='text-lg font-bold text-green-600 dark:text-green-300'>
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
