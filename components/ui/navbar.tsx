'use client';

import { IconMenu2, IconX } from '@tabler/icons-react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface ScrollAwareProps {
  children: React.ReactNode;
  className?: string;
  scrolled?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 12);
  });

  return (
    <header className={cn('sticky top-0 z-50 w-full px-3 pt-3 sm:px-4', className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ scrolled?: boolean }>,
              { scrolled }
            )
          : child
      )}
    </header>
  );
};

export const NavBody = ({ children, className, scrolled }: ScrollAwareProps) => {
  return (
    <motion.div
      animate={{
        width: scrolled ? 'calc(100% - 1.5rem)' : '100%',
        y: scrolled ? 8 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 26,
      }}
      className={cn(
        'relative mx-auto hidden h-16 max-w-7xl items-center justify-between rounded-[1.35rem] border border-border/60 bg-background/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 md:flex sm:px-6 lg:px-8',
        scrolled && 'shadow-lg shadow-black/5',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <nav
      onMouseLeave={() => setHovered(null)}
      className={cn('hidden items-center gap-1 md:flex', className)}
    >
      {items.map((item, idx) => (
        <Link
          key={item.link}
          href={item.link}
          onClick={onItemClick}
          onMouseEnter={() => setHovered(idx)}
          className='relative inline-flex items-center rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground lg:text-sm'
        >
          {hovered === idx && (
            <motion.span
              layoutId='navbar-hover'
              className='absolute inset-0 rounded-full bg-accent'
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            />
          )}
          <span className='relative z-10'>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export const MobileNav = ({
  children,
  className,
  scrolled,
}: ScrollAwareProps) => {
  return (
    <motion.div
      animate={{
        width: scrolled ? 'calc(100% - 1rem)' : '100%',
        y: scrolled ? 8 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 26,
      }}
      className={cn(
        'relative mx-auto flex max-w-7xl flex-col rounded-[1.35rem] border border-border/60 bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden',
        scrolled && 'shadow-lg shadow-black/5',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: Omit<ScrollAwareProps, 'scrolled'>) => {
  return (
    <div className={cn('flex w-full items-center justify-between gap-3', className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'mt-3 overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80',
            className
          )}
        >
          <div className='flex flex-col gap-3 p-4'>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
    >
      {isOpen ? <IconX className='h-5 w-5' /> : <IconMenu2 className='h-5 w-5' />}
    </button>
  );
};

export const NavbarLogo = ({ className }: { className?: string }) => {
  return (
    <Link
      href='/'
      className={cn('flex min-w-0 shrink-0 items-center gap-3', className)}
    >
      <span className='flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-primary p-1.5 text-primary-foreground shadow-sm'>
        <Image src='/Stackup.png' width={28} height={28} alt='Kharcha logo' />
      </span>
      <span className='min-w-0'>
        <span className='block truncate text-sm font-semibold leading-none text-foreground sm:text-base'>
          Kharcha
        </span>
        <span className='mt-1 hidden text-xs text-muted-foreground sm:block'>
          Smart Expense Dashboard
        </span>
      </span>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = 'a',
  children,
  className,
  variant = 'primary',
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark' | 'gradient';
} & (
  | React.ComponentPropsWithoutRef<'a'>
  | React.ComponentPropsWithoutRef<'button'>
)) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200';

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
    secondary:
      'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    dark: 'bg-foreground text-background shadow-sm hover:opacity-90',
    gradient:
      'bg-linear-to-r from-primary to-chart-3 text-primary-foreground shadow-sm hover:opacity-95',
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
