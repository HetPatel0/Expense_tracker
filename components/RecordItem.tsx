'use client';
import { useState } from 'react';
import { Record } from '@/types/records';
import deleteRecord from '@/actions/deleteRecord';

// Helper function to get category emoji
const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'Food':
      return '🍔';
    case 'Transportation':
      return '🚗';
    case 'Shopping':
      return '🛒';
    case 'Entertainment':
      return '🎬';
    case 'Bills':
      return '💡';
    case 'Healthcare':
      return '🏥';
    default:
      return '📦';
  }
};

const RecordItem = ({ record }: { record: Record }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteRecord = async (recordId: string) => {
    setIsLoading(true); // Show loading spinner
    await deleteRecord(recordId); // Perform delete operation
    setIsLoading(false); // Hide loading spinner
  };

  // Determine border color based on expense amount
  const getBorderColor = (amount: number) => {
    if (amount > 100) return 'border-destructive'; // High expense
    if (amount > 50) return 'border-chart-3'; // Medium expense
    return 'border-primary'; // Low expense
  };

  return (
    <li
      className={`rounded-xl border border-border/50 border-l-4 bg-card/60 p-4 shadow-lg backdrop-blur-sm hover:bg-card/80 sm:p-6 ${getBorderColor(
        record?.amount
      )} relative min-h-[120px] overflow-visible group flex flex-col justify-between sm:min-h-[140px]`}
    >
      {/* Delete button positioned absolutely in top-right corner */}
      <button
        onClick={() => handleDeleteRecord(record.id)}
        className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-destructive text-destructive-foreground shadow-lg transition-all duration-200 hover:scale-110 hover:bg-destructive/90 hover:shadow-xl sm:h-7 sm:w-7 ${
          isLoading ? 'cursor-not-allowed scale-100' : ''
        } transform opacity-100 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100`}
        aria-label='Delete record'
        disabled={isLoading} // Disable button while loading
        title='Delete expense record'
      >
        {isLoading ? (
          <div className='h-3 w-3 animate-spin rounded-full border border-destructive-foreground/30 border-t-destructive-foreground'></div>
        ) : (
          <svg
            className='w-3 h-3 sm:w-4 sm:h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        )}
      </button>

      {/* Content area with proper spacing */}
      <div className='flex-1 flex flex-col justify-between'>
        <div className='space-y-2 sm:space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-muted-foreground tracking-wide uppercase'>
              {new Date(record?.date).toLocaleDateString()}
            </span>
            <span className='text-lg sm:text-xl font-bold text-foreground'>
              Rs {record?.amount.toFixed(2)}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-base sm:text-lg'>
              {getCategoryEmoji(record?.category)}
            </span>
            <span className='text-sm font-medium text-foreground'>
              {record?.category}
            </span>
          </div>
        </div>

        <div className='mt-2 text-xs text-muted-foreground sm:text-sm'>
          <p className='truncate wrap-break-word line-clamp-2'>{record?.text}</p>
        </div>
      </div>
    </li>
  );
};

export default RecordItem;
