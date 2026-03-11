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
  'w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30';

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
    <div className='rounded-3xl border border-border/70 bg-card/75 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl sm:p-6'>
      <div className='mb-5 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
            <CreditCard className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-lg font-bold leading-tight text-foreground sm:text-xl'>
              Add New Expense
            </h3>
            <p className='text-xs text-muted-foreground'>
              Fast input with AI assist
            </p>
          </div>
        </div>
        <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
          <Sparkles className='h-3.5 w-3.5' />
          AI Ready
        </span>
      </div>

      <div className='relative mb-6 overflow-hidden rounded-2xl border border-border/70 bg-muted/60 p-2'>
        <InfiniteSlider speed={32} speedOnHover={18} gap={8}>
          {tickerItems.map((item) => (
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

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(formRef.current!);
          clientAction(formData);
        }}
        className='space-y-5 sm:space-y-6'
      >
        <div className='grid grid-cols-1 gap-3 rounded-2xl border border-border/80 bg-background/70 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4'>
          <div className='space-y-1.5'>
            <label
              htmlFor='text'
              className='text-xs font-semibold tracking-wide text-foreground'
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
                className='absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground'
                title='AI Category Suggestion'
              >
                {isCategorizingAI ? (
                  <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground' />
                ) : (
                  <Sparkles className='h-3.5 w-3.5' />
                )}
              </button>
            </div>
            {isCategorizingAI && (
              <div className='inline-flex items-center gap-2 text-xs text-primary'>
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary' />
                AI is analyzing your description...
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <label
              htmlFor='date'
              className='text-xs font-semibold tracking-wide text-foreground'
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

        <div className='grid grid-cols-1 gap-3 rounded-2xl border border-border/80 bg-background/70 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4'>
          <div className='space-y-1.5'>
            <label
              htmlFor='category'
              className='text-xs font-semibold tracking-wide text-foreground'
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
              className='text-xs font-semibold tracking-wide text-foreground'
            >
              Amount
            </label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground'>
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
          className='relative w-full overflow-hidden rounded-xl border border-primary/20 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl sm:py-3.5 sm:text-base'
          disabled={isLoading}
        >
          <span className='relative flex items-center justify-center gap-2'>
            {isLoading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground' />
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
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          <p className='text-sm font-medium'>{alertMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AddRecord;
