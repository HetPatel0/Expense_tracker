'use client';
import { useRef, useState } from 'react';
import addExpenseRecord from '@/actions/addExpenseRecord';
import { suggestCategory } from '@/actions/suggestCategory';
import { CreditCard, Sparkles } from 'lucide-react';
import { InfiniteSlider } from './ui/infinite-slider';
import { ProgressiveBlur } from './ui/progressive-blur';

const tickerItems = [
  'Quick capture flow',
  'AI category suggestion',
  'Clean amount entry',
  'Instant dashboard update',
];

const fieldClass =
  'w-full rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2.5 text-sm text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-400/30 dark:focus:bg-slate-800';

const AddRecord = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState(50);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isCategorizingAI, setIsCategorizingAI] = useState(false);

  const clientAction = async (formData: FormData) => {
    setIsLoading(true);
    setAlertMessage(null);

    formData.set('amount', amount.toString());
    formData.set('category', category);

    const { error } = await addExpenseRecord(formData);

    if (error) {
      setAlertMessage(`Error: ${error}`);
      setAlertType('error');
    } else {
      setAlertMessage('Expense record added successfully!');
      setAlertType('success');
      formRef.current?.reset();
      setAmount(50);
      setCategory('');
      setDescription('');
    }

    setIsLoading(false);
  };

  const handleAISuggestCategory = async () => {
    if (!description.trim()) {
      setAlertMessage('Please enter a description first');
      setAlertType('error');
      return;
    }

    setIsCategorizingAI(true);
    setAlertMessage(null);

    try {
      const result = await suggestCategory(description);
      if (result.error) {
        setAlertMessage(`AI Suggestion: ${result.error}`);
        setAlertType('error');
      } else {
        setCategory(result.category);
        setAlertMessage(`AI suggested category: ${result.category}`);
        setAlertType('success');
      }
    } catch {
      setAlertMessage('Failed to get AI category suggestion');
      setAlertType('error');
    } finally {
      setIsCategorizingAI(false);
    }
  };

  return (
    <div className='rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none sm:p-6'>
      <div className='mb-5 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-slate-800 to-slate-700 text-white shadow-lg dark:from-sky-600 dark:to-blue-600'>
            <CreditCard className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-xl'>
              Add New Expense
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Fast input with AI assist
            </p>
          </div>
        </div>
        <span className='inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'>
          <Sparkles className='h-3.5 w-3.5' />
          AI Ready
        </span>
      </div>

      <div className='relative mb-6 overflow-hidden rounded-2xl border border-slate-300/70 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-900'>
        <InfiniteSlider speed={32} speedOnHover={18} gap={8}>
          {tickerItems.map((item) => (
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

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(formRef.current!);
          clientAction(formData);
        }}
        className='space-y-5 sm:space-y-6'
      >
        <div className='grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white/65 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 dark:border-slate-700 dark:bg-slate-900/40'>
          <div className='space-y-1.5'>
            <label
              htmlFor='text'
              className='text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300'
            >
              Expense Description
            </label>
            <div className='relative'>
              <input
                type='text'
                id='text'
                name='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${fieldClass} pr-12 sm:pr-14`}
                placeholder='Coffee, groceries, rent...'
                required
              />
              <button
                type='button'
                onClick={handleAISuggestCategory}
                disabled={isCategorizingAI || !description.trim()}
                className='absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-linear-to-r from-slate-800 to-slate-700 text-white shadow-md transition-all duration-200 hover:from-slate-700 hover:to-slate-600 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 dark:from-sky-600 dark:to-blue-600 dark:hover:from-sky-500 dark:hover:to-blue-500 dark:disabled:from-slate-600 dark:disabled:to-slate-600'
                title='AI Category Suggestion'
              >
                {isCategorizingAI ? (
                  <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                ) : (
                  <Sparkles className='h-3.5 w-3.5' />
                )}
              </button>
            </div>
            {isCategorizingAI && (
              <div className='inline-flex items-center gap-2 text-xs text-sky-700 dark:text-sky-300'>
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500' />
                AI is analyzing your description...
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <label
              htmlFor='date'
              className='text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300'
            >
              Expense Date
            </label>
            <input
              type='date'
              name='date'
              id='date'
              className={fieldClass}
              required
              onFocus={(e) => e.target.showPicker()}
            />
          </div>
        </div>

        <div className='grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white/65 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 dark:border-slate-700 dark:bg-slate-900/40'>
          <div className='space-y-1.5'>
            <label
              htmlFor='category'
              className='text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300'
            >
              Category
            </label>
            <select
              id='category'
              name='category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
              required
            >
              <option value='' disabled>
                Select category...
              </option>
              <option value='Food'>Food & Dining</option>
              <option value='Transportation'>Transportation</option>
              <option value='Shopping'>Shopping</option>
              <option value='Entertainment'>Entertainment</option>
              <option value='Bills'>Bills & Utilities</option>
              <option value='Healthcare'>Healthcare</option>
              <option value='Other'>Other</option>
            </select>
          </div>

          <div className='space-y-1.5'>
            <label
              htmlFor='amount'
              className='text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300'
            >
              Amount
            </label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
                Rs
              </span>
              <input
                type='number'
                name='amount'
                id='amount'
                min='0'
                max='100000'
                step='0.01'
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className={`${fieldClass} pl-9`}
                placeholder='0.00'
                required
              />
            </div>
          </div>
        </div>

        <button
          type='submit'
          className='relative w-full overflow-hidden rounded-xl border border-slate-400/30 bg-linear-to-r from-slate-800 to-slate-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/50 transition-all duration-300 hover:from-slate-700 hover:to-slate-600 hover:shadow-xl sm:py-3.5 sm:text-base dark:from-sky-600 dark:to-blue-600 dark:hover:from-sky-500 dark:hover:to-blue-500 dark:shadow-none'
          disabled={isLoading}
        >
          <span className='relative flex items-center justify-center gap-2'>
            {isLoading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white' />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className='h-4 w-4' />
                <span>Add Expense</span>
              </>
            )}
          </span>
        </button>
      </form>

      {alertMessage && (
        <div
          className={`mt-4 rounded-xl border p-3 ${
            alertType === 'success'
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-red-200 bg-red-50/80 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300'
          }`}
        >
          <p className='text-sm font-medium'>{alertMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AddRecord;
