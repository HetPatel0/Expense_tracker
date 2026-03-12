'use client';

import Link from 'next/link';
import React from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ModeToggle } from './modetoggle';
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
  NavbarLogo,
} from '@/components/ui/navbar';

const signedOutMenuItems = [
  { name: 'Overview', link: '/' },
  { name: 'Features', link: '/#features' },
  { name: 'Start', link: '/signup' },
];

const signedInMenuItems = [
  { name: 'Dashboard', link: '/' },
  { name: 'Trends', link: '/#trends' },
  { name: 'Insights', link: '/#insights' },
  { name: 'Records', link: '/#records' },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const closeMenu = React.useCallback(() => {
    setMenuState(false);
  }, []);

  const handleLogOut = React.useCallback(async () => {
    await authClient.signOut();
    closeMenu();
    router.push('/');
    router.refresh();
  }, [closeMenu, router]);

  const menuItems = session ? signedInMenuItems : signedOutMenuItems;

  const desktopAuthSection = isPending ? (
    <span className='text-sm text-muted-foreground'>Loading...</span>
  ) : session ? (
    <div className='flex items-center gap-2'>
      <div className='hidden items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 px-3 py-2 text-sm font-medium text-foreground xl:inline-flex'>
  
        Hello, {session.user.name}
      </div>
      <Button
        onClick={handleLogOut}
        variant='outline'
        size='sm'
        className='h-9 rounded-full border-border bg-background px-3 text-foreground hover:bg-accent hover:text-accent-foreground'
      >
        <LogOut className='h-4 w-4' />
        <span className='hidden lg:inline'>Logout</span>
      </Button>
    </div>
  ) : (
    <div className='flex items-center gap-2'>
      <Button
        asChild
        variant='outline'
        size='sm'
        className='h-9 rounded-full border-border bg-background px-4 text-foreground hover:bg-accent hover:text-accent-foreground'
      >
        <Link href='/login'>Login</Link>
      </Button>
      <Button asChild size='sm' className='h-9 rounded-full px-4'>
        <Link href='/signup'>Sign Up</Link>
      </Button>
    </div>
  );

  const mobileAuthSection = isPending ? (
    <span className='text-sm text-muted-foreground'>Loading...</span>
  ) : session ? (
    <div className='flex flex-col gap-3'>
      <div className='inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/60 px-4 py-3 text-sm font-medium text-foreground'>
        <ShieldCheck className='h-4 w-4 text-primary' />
        Hello, {session.user.name}
      </div>
      <Button
        onClick={handleLogOut}
        variant='outline'
        className='h-10 w-full rounded-full border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
      >
        <LogOut className='h-4 w-4' />
        Logout
      </Button>
    </div>
  ) : (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
      <Button
        asChild
        variant='outline'
        className='h-10 rounded-full border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
      >
        <Link href='/login' onClick={closeMenu}>
          Login
        </Link>
      </Button>
      <Button asChild className='h-10 rounded-full'>
        <Link href='/signup' onClick={closeMenu}>
          Sign Up
        </Link>
      </Button>
    </div>
  );

  return (
    <Navbar>
      <NavBody>
        <div className='flex min-w-0 items-center gap-4 lg:gap-6'>
          <NavbarLogo />
          <NavItems items={menuItems} />
        </div>

        <div className='flex shrink-0 items-center gap-2 lg:gap-3'>
          {desktopAuthSection}
          <ModeToggle className='border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground' />
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo className='max-w-[calc(100%-6rem)]' />
          <div className='flex items-center gap-2'>
            <ModeToggle className='border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground' />
            <MobileNavToggle
              isOpen={menuState}
              onClick={() => setMenuState((open) => !open)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={menuState}>
          <nav className='grid gap-2'>
            {menuItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                onClick={closeMenu}
                className='rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className='border-t border-border/60 pt-4'>{mobileAuthSection}</div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};
