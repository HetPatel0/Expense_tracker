'use client';
import Link from 'next/link';
import { LogOut, Menu, ShieldCheck, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ModeToggle } from './modetoggle';

const menuItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Trends', href: '#trends' },
  { name: 'Records', href: '#records' },
  { name: 'Insights', href: '#insights' },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogOut = async () => {
    await authClient.signOut();
    router.push('/');
    router.refresh();
    setMenuState(false);
  };

  const authSection = isPending ? (
    <span className='text-sm text-slate-500 dark:text-slate-400'>Loading...</span>
  ) : session ? (
    <div className='flex items-center gap-2'>
      <div className='hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-200 sm:inline-flex'>
        <ShieldCheck className='h-3.5 w-3.5 text-emerald-500' />
        Hello, {session.user.name}
      </div>
      <Button
        onClick={handleLogOut}
        variant='outline'
        size='sm'
        className='border-slate-300 bg-white/75 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
      >
        <LogOut className='h-4 w-4' />
      </Button>
    </div>
  ) : (
    <div className='flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit'>
      <Button
        asChild
        variant='outline'
        size='sm'
        className='border-slate-300 bg-white/75 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
      >
        <Link href='/login'>
          <span>Login</span>
        </Link>
      </Button>
      <Button
        asChild
        size='sm'
        className='bg-linear-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 dark:from-sky-600 dark:to-blue-600 dark:hover:from-sky-500 dark:hover:to-blue-500'
      >
        <Link href='/signup'>
          <span>Sign Up</span>
        </Link>
      </Button>
    </div>
  );

  return (
    <header className='sticky top-0 z-40'>
      <nav className='border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6'>
          <div className='flex items-center justify-between gap-4 py-3.5'>
            <div className='flex items-center gap-8'>
              <Link href='/' aria-label='home' className='flex items-center gap-2.5'>
                <span className='flex h-10 w-10 items-center justify-center rounded-xl border border-white bg-linear-to-br from-slate-800 to-slate-700 p-1.5 shadow-sm dark:border-slate-700 dark:from-sky-500 dark:to-blue-600'>
                  <Image src='/Stackup.png' width={30} height={30} alt='logo' />
                </span>
                <div className='hidden sm:block'>
                  <p className='font-display inline-flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                    <Wallet className='h-3.5 w-3.5' />
                    Kharcha
                  </p>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                    Smart Expense Dashboard
                  </p>
                </div>
              </Link>

              <ul className='hidden items-center gap-1 md:flex'>
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className='block rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className='hidden items-center gap-3 md:flex'>
              {authSection}
              <ModeToggle />
            </div>

            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState ? 'Close Menu' : 'Open Menu'}
              className='rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden dark:text-slate-200 dark:hover:bg-slate-800'
            >
              {menuState ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </button>
          </div>
        </div>

        {menuState && (
          <div className='border-t border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-950/90'>
            <div className='mx-auto max-w-7xl space-y-4'>
              <ul className='grid grid-cols-2 gap-2'>
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuState(false)}
                      className='block rounded-lg border border-slate-200/80 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className='flex items-center justify-between gap-3'>
                <div className='flex-1'>{authSection}</div>
                <ModeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
