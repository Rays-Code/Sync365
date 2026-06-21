import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const links = [
  { to: '/account/subscription', label: 'Billing & subscription', match: '/account/subscription' },
  { to: '/dashboard', label: 'Account dashboard', match: '/dashboard' },
] as const;

export function AccountHubLinks({ className }: { className?: string }) {
  const { pathname } = useLocation();

  return (
    <nav
      className={cn(
        'flex flex-wrap gap-2 p-1 rounded-xl bg-muted/30 border border-border/50',
        className
      )}
      aria-label="Account sections"
    >
      {links.map(({ to, label, match }) => {
        const active = pathname.startsWith(match);
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex-1 min-w-[140px] text-center text-sm px-3 py-2 rounded-lg transition-colors',
              active
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
