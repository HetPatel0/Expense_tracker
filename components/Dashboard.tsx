import { Suspense } from 'react';
import { getSession } from '@/lib/server';
import AddRecord from './AddNewRecord';
import RecordChart from './RecordChart';
import ExpenseStats from './ExpenseStats';
import ExpenseDigest, { ExpenseDigestFallback } from './ExpenseDigest';
import RecordHistory from './RecordHistory';
import { InfiniteSlider } from './ui/infinite-slider';
import { ProgressiveBlur } from './ui/progressive-blur';
import { Activity, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';

const tickerItems = [
  'Track daily spending with clear trends',
  'Get AI-assisted category suggestions',
  'Spot best and worst expense ranges',
  'Keep your budget decisions data-driven',
];

async function Dashboard() {
  const session = await getSession();
  const user = session?.user;
  const userName = user?.name || 'there';
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : 'Not available';
  const lastActive = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString()
    : 'Today';

  return (
    <main className='min-h-[calc(100vh-4.5rem)] px-4 py-6 text-foreground transition-colors duration-300 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
          <div className='space-y-4 sm:space-y-6'>
            <div className='rounded-3xl border border-border/70 bg-card/70 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl sm:p-6 lg:p-8'>
              <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6'>
                  <div className='relative mx-auto shrink-0 sm:mx-0'>
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={`${user?.name} profile`}
                        className='h-16 w-16 rounded-2xl border-2 border-background shadow-lg sm:h-20 sm:w-20'
                      />
                    ) : (
                      <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg sm:h-20 sm:w-20 sm:text-xl'>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className='absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary sm:h-6 sm:w-6'>
                      <ShieldCheck className='h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4' />
                    </div>
                  </div>

                  <div className='flex-1 text-center sm:text-left'>
                    <p className='mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                      <Sparkles className='h-3.5 w-3.5' />
                      Dashboard Overview
                    </p>
                    <h2 className='text-xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl'>
                      Welcome back, {userName}.
                    </h2>
                    <p className='mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:mx-0 sm:text-base'>
                      Keep your spending in control with real-time insights,
                      cleaner tracking, and smarter category suggestions.
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3'>
                  <div className='rounded-2xl border border-border/70 bg-muted/60 px-3 py-2'>
                    <p className='mb-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                      <CalendarDays className='h-3.5 w-3.5' />
                      Joined
                    </p>
                    <p className='text-sm font-semibold text-foreground'>
                      {joinedDate}
                    </p>
                  </div>
                  <div className='rounded-2xl border border-border/70 bg-muted/60 px-3 py-2'>
                    <p className='mb-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                      <Activity className='h-3.5 w-3.5' />
                      Last Active
                    </p>
                    <p className='text-sm font-semibold text-foreground'>
                      {lastActive}
                    </p>
                  </div>
                </div>

                <div className='relative overflow-hidden rounded-2xl border border-border/80 bg-muted/60 p-3'>
                  <InfiniteSlider speed={36} speedOnHover={18} gap={12}>
                    {tickerItems.map((item) => (
                      <span
                        key={item}
                        className='inline-flex items-center rounded-xl border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground'
                      >
                        {item}
                      </span>
                    ))}
                  </InfiniteSlider>
                  <ProgressiveBlur
                    className='pointer-events-none absolute inset-y-0 left-0 w-12'
                    direction='left'
                    blurIntensity={0.8}
                  />
                  <ProgressiveBlur
                    className='pointer-events-none absolute inset-y-0 right-0 w-12'
                    direction='right'
                    blurIntensity={0.8}
                  />
                </div>
              </div>
            </div>

            <AddRecord />
          </div>

          <div className='space-y-4 sm:space-y-6'>
            <RecordChart />
            <ExpenseStats />
          </div>
        </div>

        <div className='mt-6 sm:mt-8 space-y-4 sm:space-y-6'>
          <RecordHistory />
          <Suspense fallback={<ExpenseDigestFallback />}>
            <ExpenseDigest />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
