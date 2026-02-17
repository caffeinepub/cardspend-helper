import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, Link, useMatchRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import CardsManagerPage from './pages/CardsManagerPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';
import { CreditCard, Receipt, Settings } from 'lucide-react';

function AppLayout() {
  const matchRoute = useMatchRoute();
  
  const isActive = (path: string) => {
    return !!matchRoute({ to: path, fuzzy: false });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 mr-8">
            <img src="/assets/generated/card-icon.dim_128x128.png" alt="CardSpend" className="h-8 w-8" />
            <span className="font-semibold text-lg">CardSpend Helper</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              to="/cards"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/cards')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Cards
            </Link>
            <Link
              to="/transactions"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/transactions')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Receipt className="h-4 w-4" />
              Transactions
            </Link>
            <Link
              to="/settings"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/settings')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
      <footer className="border-t mt-16">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} · Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: AppLayout,
});

const cardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cards',
  component: CardsManagerPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    window.location.href = '/cards';
    return null;
  },
});

const routeTree = rootRoute.addChildren([indexRoute, cardsRoute, transactionsRoute, settingsRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
