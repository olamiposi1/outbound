import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { brand } from '../config/brand';
import {
  LayoutDashboard,
  Inbox,
  Send,
  Layers,
  Building2,
  Users,
  MessageSquare,
  Clock,
  Globe,
  Ban,
  Sliders,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
  count?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [needsYouCount, setNeedsYouCount] = useState<number>(3);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Dynamically sync inbox count
  useEffect(() => {
    // Import api dynamically or via top-level import
    import('../services/api').then(({ getInbox }) => {
      getInbox('needs_you')
        .then((res) => {
          setNeedsYouCount(res.counts.needsYou);
        })
        .catch(() => {});
    });
  }, [location.pathname]);

  const navGroups: NavGroup[] = [
    {
      label: 'Work',
      items: [
        { name: 'Overview', href: '/app', icon: LayoutDashboard },
        {
          name: 'Inbox',
          href: '/app/inbox',
          icon: Inbox,
          count: needsYouCount > 0 ? String(needsYouCount) : undefined,
        },
        { name: 'Sent', href: '/app/sent', icon: Send },
        { name: 'Campaigns', href: '/app/campaigns', icon: Layers },
      ],
    },
    {
      label: 'Setup',
      items: [
        { name: 'Business profile', href: '/app/profile', icon: Building2 },
        { name: 'Targeting', href: '/app/targeting', icon: Users },
        { name: 'Messages', href: '/app/messages', icon: MessageSquare },
        { name: 'Sending schedule', href: '/app/schedule', icon: Clock },
        { name: 'Mailboxes and domains', href: '/app/mailboxes', icon: Globe },
        { name: 'Suppression list', href: '/app/suppression', icon: Ban },
        { name: 'Integrations', href: '/app/integrations', icon: Sliders },
      ],
    },
    {
      label: 'Account',
      items: [
        { name: 'Billing', href: '/app/billing', icon: CreditCard },
      ],
    },
  ];

  // Close user menu on click outside or Esc
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  // Handle mobile drawer Esc and focus trap
  useEffect(() => {
    if (mobileMenuOpen) {
      closeBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        } else if (e.key === 'Tab') {
          if (!drawerRef.current) return;
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen w-full bg-bg flex flex-col lg:flex-row text-ink">
      {/* Mobile Top Bar (Below 1024px) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-[16px] font-semibold tracking-tight text-ink hover:opacity-85"
          >
            {brand.name}
          </Link>
          <span className="text-[12px] px-2 py-0.5 rounded-[999px] bg-surface-muted text-ink-3 border border-border">
            harborandpine.example
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation drawer"
          className="p-1.5 rounded-[8px] border border-border text-ink-2 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" strokeWidth={1.5} />
          ) : (
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Sidebar: 248px or 64px on lg, Off-canvas drawer on mobile */}
      <aside
        ref={drawerRef}
        aria-label="Dashboard navigation"
        className={`bg-surface border-r border-border flex flex-col justify-between fixed lg:sticky top-0 h-screen z-30 transition-[width,transform] duration-150 ease ${
          isCollapsed ? 'lg:w-[64px]' : 'lg:w-[248px]'
        } w-[248px] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div
            className={`h-[56px] border-b border-border flex items-center ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
            }`}
          >
            <Link
              to="/"
              className={`flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px] ${
                isCollapsed ? 'items-center' : ''
              }`}
              title={brand.name}
            >
              <span className="text-[16px] font-semibold text-ink tracking-tight leading-none">
                {isCollapsed ? brand.name.slice(0, 1) : brand.name}
              </span>
              {!isCollapsed && (
                <span className="text-[11px] text-ink-3 mt-1 leading-none">
                  Autonomous sales agent
                </span>
              )}
            </Link>

            {/* Close button for mobile */}
            <button
              ref={closeBtnRef}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-[6px] text-ink-3 hover:text-ink cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="p-2 flex flex-col gap-4 text-left">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                {!isCollapsed ? (
                  <div className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase select-none">
                    {group.label}
                  </div>
                ) : (
                  <div className="h-[1px] bg-border my-1 mx-2" aria-hidden="true" />
                )}
                {group.items.map((item) => {
                  const isActive =
                    item.href === '/app'
                      ? location.pathname === '/app'
                      : location.pathname === item.href ||
                        location.pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      title={isCollapsed ? item.name : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`h-[36px] rounded-[8px] flex items-center transition-colors duration-150 ease select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        isCollapsed
                          ? 'justify-center px-0'
                          : 'justify-between px-2.5'
                      } ${
                        isActive
                          ? 'bg-primary-soft text-primary font-medium'
                          : 'text-ink-2 hover:bg-surface-muted hover:text-ink'
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2.5 min-w-0 ${
                          isCollapsed ? 'justify-center' : ''
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        {!isCollapsed && (
                          <span className="text-[14px] truncate">{item.name}</span>
                        )}
                      </div>
                      {!isCollapsed && item.count && (
                        <span className="text-[12px] tabular-nums text-ink-3 font-normal">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Collapse Toggle and Fictional Account Row */}
        <div className="border-t border-border bg-surface p-2 text-left relative flex flex-col gap-1">
          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:flex items-center justify-between px-1 py-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full h-[32px] rounded-[6px] text-ink-3 hover:text-ink hover:bg-surface-muted flex items-center gap-2 px-2 text-[12px] transition-colors duration-150 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 mx-auto" strokeWidth={1.5} />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>Collapse sidebar</span>
                </>
              )}
            </button>
          </div>

          {/* Account Popover Menu */}
          {userMenuOpen && (
            <div
              ref={userMenuRef}
              role="menu"
              aria-label="User account actions"
              className={`absolute bottom-[52px] ${
                isCollapsed ? 'left-2 w-[200px]' : 'left-2 right-2'
              } p-2 bg-surface border border-border rounded-[8px] shadow-md z-40 flex flex-col gap-1`}
            >
              <div className="px-2 py-1 text-[12px] text-ink-3 border-b border-border truncate">
                demo@harborandpine.example
              </div>
              <Link
                to="/"
                onClick={() => setUserMenuOpen(false)}
                role="menuitem"
                className="px-2 py-1.5 rounded-[6px] text-[13px] text-ink-2 hover:bg-surface-muted hover:text-ink flex items-center justify-between transition-colors duration-150 ease"
              >
                <span>Back to site</span>
                <ExternalLink className="w-3.5 h-3.5 text-ink-3" strokeWidth={1.5} />
              </Link>
            </div>
          )}

          {/* User Account Row */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            title="demo@harborandpine.example"
            className={`w-full p-1.5 rounded-[8px] hover:bg-surface-muted text-left flex items-center gap-2 transition-colors duration-150 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-full bg-primary-soft text-primary font-medium text-[12px] flex items-center justify-center shrink-0 border border-primary/20">
                HP
              </span>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-ink truncate leading-tight">
                    Harbor & Pine
                  </span>
                  <span className="text-[11px] text-ink-3 truncate leading-tight">
                    demo@harborandpine.example
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-ink-3 shrink-0" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-ink/20 z-20 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main content area (content max-width 1120px) */}
      <main className="flex-1 min-w-0 bg-bg p-6 lg:p-10">
        <div className="max-w-[1120px] mx-auto w-full text-left">
          {children}
        </div>
      </main>
    </div>
  );
}
