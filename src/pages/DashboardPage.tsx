import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { pricing } from '../config/pricing';
import { usePageMeta } from '../utils/usePageMeta';
import { getDashboard, setDailyBudget, toggleCampaign } from '../services/api';
import {
  DashboardData,
  CampaignItem,
  CampaignStatus,
  sampleAgentActivity,
} from '../mock/data';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card, CardHeader, CardTitle } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import {
  Check,
  Plus,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  AlertTriangle,
} from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function DashboardPage() {
  usePageMeta('Overview', 'Outbound sales agent performance overview');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Test state override via ?state=
  const stateQuery = searchParams.get('state');

  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Live announcement for screen readers
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Popover states
  const [newCampaignPopoverOpen, setNewCampaignPopoverOpen] = useState(false);
  const [topUpPopoverOpen, setTopUpPopoverOpen] = useState(false);
  const [infoPopoverOpen, setInfoPopoverOpen] = useState(false);

  // Setup card dismissal (persisted in sessionStorage)
  const [setupDismissed, setSetupDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('outbound_finish_setup_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Table sorting state
  const [sortField, setSortField] = useState<'sent' | 'replies' | 'interested' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Interactive daily budget state
  const [dailyBudgetInput, setDailyBudgetInput] = useState<number>(10);

  // Load dashboard data
  const loadData = () => {
    if (stateQuery === 'error') {
      setError(true);
      setLoading(false);
      return;
    }

    if (stateQuery === 'loading') {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(false);
    getDashboard(range)
      .then((res) => {
        if (stateQuery === 'empty') {
          setData({
            ...res,
            daily: res.daily.map((d) => ({ ...d, sent: 0, bounced: 0, interested: 0 })),
            today: { ...res.today, sent: 0, queued: 0, repliesWaiting: 0 },
            campaigns: [],
          });
        } else {
          setData(res);
          setDailyBudgetInput(res.today.dailyBudget);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [range, stateQuery]);

  // Handle outside clicks and Esc for popovers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNewCampaignPopoverOpen(false);
        setTopUpPopoverOpen(false);
        setInfoPopoverOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dismiss setup card
  const handleDismissSetup = () => {
    setSetupDismissed(true);
    try {
      sessionStorage.setItem('outbound_finish_setup_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  // Handle budget slider change
  const handleBudgetChange = (amount: number) => {
    setDailyBudgetInput(amount);
    if (data) {
      setData({
        ...data,
        today: {
          ...data.today,
          dailyBudget: amount,
        },
      });
    }
    setDailyBudget(amount).catch(() => {});
  };

  // Handle toggle campaign status
  const handleToggleCampaign = async (id: string, name: string) => {
    if (!data) return;
    try {
      const updated = await toggleCampaign(id);
      setData({
        ...data,
        campaigns: data.campaigns.map((c) => (c.id === id ? updated : c)),
      });
      setLiveAnnouncement(`${updated.status === 'Paused' ? 'Paused' : 'Resumed'} ${name}`);
    } catch {
      // Ignore
    }
  };

  // Handle table header sort
  const handleSort = (field: 'sent' | 'replies' | 'interested') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Compute all derived performance statistics from raw daily arrays
  const stats = useMemo(() => {
    if (!data) {
      return {
        totalSent: 0,
        totalBounced: 0,
        delivered: 0,
        deliveryRate: 0,
        totalInterested: 0,
        totalCost: 0,
        sentSparkline: [],
        deliveredSparkline: [],
        interestedSparkline: [],
        costSparkline: [],
      };
    }

    const totalSent = data.daily.reduce((sum, d) => sum + d.sent, 0);
    const totalBounced = data.daily.reduce((sum, d) => sum + d.bounced, 0);
    const delivered = Math.max(0, totalSent - totalBounced);
    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
    const totalInterested = data.daily.reduce((sum, d) => sum + d.interested, 0);
    const totalCost = totalSent * pricing.perEmail;

    const sentSparkline = data.daily.map((d) => d.sent);
    const deliveredSparkline = data.daily.map((d) => Math.max(0, d.sent - d.bounced));
    const interestedSparkline = data.daily.map((d) => d.interested);
    const costSparkline = data.daily.map((d) => d.sent * pricing.perEmail);

    return {
      totalSent,
      totalBounced,
      delivered,
      deliveryRate,
      totalInterested,
      totalCost,
      sentSparkline,
      deliveredSparkline,
      interestedSparkline,
      costSparkline,
    };
  }, [data]);

  // Compute campaign sorted rows and pinned totals
  const sortedCampaigns = useMemo(() => {
    if (!data) return [];
    const list = [...data.campaigns];
    if (sortField) {
      list.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }
    return list;
  }, [data, sortField, sortDirection]);

  const campaignTotals = useMemo(() => {
    if (!data || data.campaigns.length === 0) return null;
    const totalSent = data.campaigns.reduce((sum, c) => sum + c.sent, 0);
    const totalReplies = data.campaigns.reduce((sum, c) => sum + c.replies, 0);
    const totalInterested = data.campaigns.reduce((sum, c) => sum + c.interested, 0);
    const totalCost = totalSent * pricing.perEmail;
    const avgCostPerInterested =
      totalInterested > 0 ? totalCost / totalInterested : null;

    return {
      sent: totalSent,
      replies: totalReplies,
      interested: totalInterested,
      costPerInterested: avgCostPerInterested,
    };
  }, [data]);

  // Today used spend computation
  const todaySent = data ? data.today.sent : 0;
  const todayUsedSpend = todaySent * pricing.perEmail;
  const estimatedEmailsAtBudget =
    dailyBudgetInput > 0 ? Math.round(dailyBudgetInput / pricing.perEmail) : 0;
  const usedTodayPercent =
    dailyBudgetInput > 0 ? Math.min(100, (todayUsedSpend / dailyBudgetInput) * 100) : 0;

  // Status mapping
  const campaignBadgeMap: Record<CampaignStatus, { variant: 'success' | 'primary' | 'neutral' | 'warm'; label: string }> = {
    Scaling: { variant: 'success', label: 'Scaling' },
    Working: { variant: 'primary', label: 'Working' },
    Learning: { variant: 'neutral', label: 'Learning' },
    Paused: { variant: 'warm', label: 'Paused' },
  };

  // ================= ERROR STATE =================
  if (error || stateQuery === 'error') {
    return (
      <div className="flex flex-col gap-6 py-8 text-left">
        <div className="rounded-[12px] border border-danger/30 bg-danger-soft p-6 flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
            <h2 className="text-[18px] font-semibold">We couldn't load your overview.</h2>
          </div>
          <p className="text-[14px] text-ink-2 leading-relaxed">
            There was a problem retrieving current performance metrics. Please try again.
          </p>
          <div>
            <Button variant="secondary" onClick={loadData}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ================= SKELETON LOADING STATE =================
  if (loading || stateQuery === 'loading' || !data) {
    return (
      <div className="flex flex-col gap-8 pb-16 text-left" aria-busy="true" aria-label="Loading dashboard">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-32 bg-surface-muted rounded-[6px] animate-skeleton" />
            <div className="h-6 w-44 bg-surface-muted rounded-[999px] animate-skeleton" />
          </div>
          <div className="h-9 w-32 bg-surface-muted rounded-[8px] animate-skeleton" />
        </div>

        {/* Finish setup skeleton */}
        <div className="h-28 bg-surface border border-border rounded-[12px] p-5 flex flex-col gap-3">
          <div className="h-5 w-40 bg-surface-muted rounded-[4px] animate-skeleton" />
          <div className="h-2 w-full bg-surface-muted rounded-[999px] animate-skeleton" />
          <div className="h-6 w-3/4 bg-surface-muted rounded-[6px] animate-skeleton" />
        </div>

        {/* 2-card row skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-44 bg-surface border border-border rounded-[12px] p-5 animate-skeleton" />
          <div className="lg:col-span-2 h-44 bg-surface border border-border rounded-[12px] p-5 animate-skeleton" />
        </div>

        {/* 4 StatCards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-surface border border-border rounded-[12px] p-4 animate-skeleton" />
          <div className="h-28 bg-surface border border-border rounded-[12px] p-4 animate-skeleton" />
          <div className="h-28 bg-surface border border-border rounded-[12px] p-4 animate-skeleton" />
          <div className="h-28 bg-surface border border-border rounded-[12px] p-4 animate-skeleton" />
        </div>

        {/* 2 columns skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-surface border border-border rounded-[12px] p-4 animate-skeleton" />
          <div className="h-64 bg-surface border border-border rounded-[12px] p-4 animate-skeleton" />
        </div>
      </div>
    );
  }

  // ================= MAIN DASHBOARD VIEW =================
  const isBudgetPaused = dailyBudgetInput === 0;

  return (
    <div className="flex flex-col gap-8 pb-16 text-left selection:bg-primary-soft selection:text-primary">
      {/* Screen reader live announcement */}
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* 2) PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-semibold text-ink tracking-tight leading-tight">
            Overview
          </h1>
          <span className="text-[12px] font-mono px-2.5 py-0.5 rounded-[999px] bg-surface-muted text-ink-2 border border-border">
            harborandpine.example
          </span>
        </div>

        <div className="relative">
          <Button
            variant="primary"
            onClick={() => setNewCampaignPopoverOpen(!newCampaignPopoverOpen)}
            icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
            aria-haspopup="dialog"
            aria-expanded={newCampaignPopoverOpen}
          >
            New campaign
          </Button>

          {/* New Campaign Preview Popover */}
          {newCampaignPopoverOpen && (
            <div
              role="dialog"
              aria-label="New campaign notice"
              className="absolute right-0 top-[44px] w-[280px] p-3.5 bg-surface border border-border rounded-[8px] shadow-md z-40 text-left flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-ink">Preview note</span>
                <button
                  onClick={() => setNewCampaignPopoverOpen(false)}
                  className="text-ink-3 hover:text-ink p-0.5 rounded-[4px] cursor-pointer"
                  aria-label="Close message"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-[12px] text-ink-2 leading-relaxed">
                The campaign builder isn't available in this preview.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3) FINISH-SETUP CARD (Full width, dismissible) */}
      {!setupDismissed && (
        <Card variant="default" className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-semibold text-ink tracking-tight">
                Finish setting up
              </h2>
              <span className="text-[12px] text-ink-3">
                Complete these initial milestones to ramp up lead volume.
              </span>
            </div>
            <button
              onClick={handleDismissSetup}
              className="text-[13px] text-ink-3 hover:text-ink px-2 py-1 rounded-[6px] transition-colors duration-150 ease cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="pt-3">
            <ProgressBar value={40} size="sm" />
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3 text-[13px]">
            {/* Step 1: Done */}
            <div className="inline-flex items-center gap-1.5 text-ink-2">
              <span className="w-4 h-4 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" strokeWidth={2} />
              </span>
              <span>Add your website</span>
            </div>

            <span className="text-border-strong">·</span>

            {/* Step 2: Done */}
            <div className="inline-flex items-center gap-1.5 text-ink-2">
              <span className="w-4 h-4 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" strokeWidth={2} />
              </span>
              <span>Review your buyers</span>
            </div>

            <span className="text-border-strong">·</span>

            {/* Step 3: Next step (ghost button) */}
            <Link
              to="/app/mailboxes"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <span>Connect a mailbox</span>
            </Link>

            <span className="text-border-strong">·</span>

            {/* Step 4 */}
            <Link
              to="/app/schedule"
              className="inline-flex items-center gap-1 text-ink-3 hover:text-ink"
            >
              <span>Set a daily budget</span>
            </Link>

            <span className="text-border-strong">·</span>

            {/* Step 5 */}
            <span className="text-ink-3">Send your first campaign</span>
          </div>
        </Card>
      )}

      {/* 4) ROW OF TWO CARDS (3fr and 2fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left card: "Today" (3fr) */}
        <Card variant="default" className="lg:col-span-3 p-5 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-[14px] font-semibold text-ink">Today</span>
            {isBudgetPaused ? (
              <Badge variant="warm" withDot>
                Paused
              </Badge>
            ) : (
              <Badge variant="success" withDot>
                On track
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-[28px] font-semibold text-ink tabular-nums leading-tight">
                {numberFormatter.format(data.today.sent)}
              </span>
              <span className="text-[12px] text-ink-3">sent</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[28px] font-semibold text-ink tabular-nums leading-tight">
                {numberFormatter.format(data.today.queued)}
              </span>
              <span className="text-[12px] text-ink-3">queued</span>
            </div>
            <Link
              to="/app/inbox"
              className="flex flex-col group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px]"
              aria-label={`${numberFormatter.format(data.today.repliesWaiting)} replies waiting. Open inbox`}
            >
              <span className="text-[28px] font-semibold text-ink group-hover:text-primary tabular-nums leading-tight transition-colors duration-150">
                {numberFormatter.format(data.today.repliesWaiting)}
              </span>
              <span className="text-[12px] text-ink-3 group-hover:text-primary transition-colors duration-150">
                replies waiting
              </span>
            </Link>
          </div>

          {isBudgetPaused && (
            <p className="text-[12px] text-warm leading-tight">
              Set a daily budget to resume sending.
            </p>
          )}

          <div className="flex items-center gap-3 pt-1 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => navigate('/app/schedule')}
            >
              View schedule
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/app/inbox')}
            >
              Open inbox
            </Button>
          </div>
        </Card>

        {/* Right card: "Daily budget" (2fr) */}
        <Card variant="default" className="lg:col-span-2 p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-[14px] font-semibold text-ink">Daily budget</span>
            <div className="relative">
              <Button
                variant="ghost"
                size="default"
                onClick={() => setTopUpPopoverOpen(!topUpPopoverOpen)}
                className="h-[28px] px-2 text-[12px]"
                aria-haspopup="dialog"
                aria-expanded={topUpPopoverOpen}
              >
                Top up
              </Button>
              {topUpPopoverOpen && (
                <div
                  role="dialog"
                  aria-label="Top up notice"
                  className="absolute right-0 top-[36px] w-[260px] p-3 bg-surface border border-border rounded-[8px] shadow-md z-40 text-left flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-ink">Preview note</span>
                    <button
                      onClick={() => setTopUpPopoverOpen(false)}
                      className="text-ink-3 hover:text-ink p-0.5 rounded-[4px] cursor-pointer"
                      aria-label="Close message"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="text-[12px] text-ink-2 leading-relaxed">
                    The balance manager isn't available in this preview.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-semibold text-ink tabular-nums leading-tight">
                ${dailyBudgetInput}
              </span>
              <span className="text-[14px] text-ink-3">/ day</span>
            </div>
            <Badge variant="neutral">
              Balance {currencyFormatter.format(data.today.balance)}
            </Badge>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="daily-budget-slider" className="sr-only">
              Daily budget amount
            </label>
            <input
              id="daily-budget-slider"
              type="range"
              min="0"
              max="50"
              step="1"
              value={dailyBudgetInput}
              onChange={(e) => handleBudgetChange(parseInt(e.target.value, 10))}
              aria-valuetext={`${dailyBudgetInput} dollars a day`}
              style={{ accentColor: 'var(--primary)' }}
              className="w-full cursor-pointer"
            />
            <span className="text-[12px] text-ink-3 leading-relaxed">
              About {numberFormatter.format(estimatedEmailsAtBudget)} emails a day at the sample rate of ${pricing.perEmail.toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-border flex flex-col gap-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ink-3">Used today</span>
              <span className="tabular-nums font-medium text-ink">
                {currencyFormatter.format(todayUsedSpend)}
              </span>
            </div>
            <ProgressBar value={usedTodayPercent} size="sm" />
          </div>
        </Card>
      </div>

      {/* 5) PERFORMANCE SECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            Performance
          </h2>

          {/* Styled Range Select */}
          <div className="flex items-center gap-2">
            <label htmlFor="performance-range" className="sr-only">
              Performance date range
            </label>
            <select
              id="performance-range"
              value={range}
              onChange={(e) => setRange(e.target.value as '7d' | '30d')}
              className="h-[36px] px-3 rounded-[8px] border border-border bg-surface text-ink text-[14px] font-medium transition-colors duration-150 ease focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>

        {/* 4 StatCards in a row (2 by 2 at 390px) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Emails sent"
            value={numberFormatter.format(stats.totalSent)}
            caption={`${numberFormatter.format(data.today.sent)} today`}
            sparklineData={stats.totalSent > 0 ? stats.sentSparkline : undefined}
          />

          <StatCard
            label="Delivered"
            value={`${stats.deliveryRate.toFixed(1)}%`}
            caption={`${numberFormatter.format(stats.totalBounced)} bounced`}
            sparklineData={stats.totalSent > 0 ? stats.deliveredSparkline : undefined}
          />

          <div className="relative">
            <StatCard
              label="Interested replies"
              value={numberFormatter.format(stats.totalInterested)}
              caption="High intent responses"
              sparklineData={stats.totalSent > 0 ? stats.interestedSparkline : undefined}
            />
            {/* Info popover button on StatCard */}
            <button
              onClick={() => setInfoPopoverOpen(!infoPopoverOpen)}
              className="absolute top-5 right-5 p-1 rounded-[4px] text-ink-3 hover:text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="What counts as an interested reply?"
              aria-haspopup="dialog"
              aria-expanded={infoPopoverOpen}
            >
              <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            {infoPopoverOpen && (
              <div
                role="dialog"
                aria-label="Interested replies explanation"
                className="absolute right-2 top-[44px] w-[260px] p-3 bg-surface border border-border rounded-[8px] shadow-md z-40 text-left flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-ink">Interested reply</span>
                  <button
                    onClick={() => setInfoPopoverOpen(false)}
                    className="text-ink-3 hover:text-ink p-0.5 rounded-[4px] cursor-pointer"
                    aria-label="Close note"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-[12px] text-ink-2 leading-relaxed">
                  A reply that asks for pricing, a call or more information.
                </p>
              </div>
            )}
          </div>

          <StatCard
            label="Spent"
            value={currencyFormatter.format(stats.totalCost)}
            caption="at the sample rate"
            sparklineData={stats.totalSent > 0 ? stats.costSparkline : undefined}
          />
        </div>
      </div>

      {/* 6) TWO COLUMNS (2fr and 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Campaigns DataTable (2fr) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-ink tracking-tight">
              Campaigns
            </h2>
            <span className="text-[12px] text-ink-3">
              {data.campaigns.length} total segments
            </span>
          </div>

          {data.campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns yet."
              description="Create a campaign targeting property managers, clinics, or office spaces to start sending verified emails."
              action={{
                label: 'New campaign',
                onClick: () => setNewCampaignPopoverOpen(true),
              }}
            />
          ) : (
            <div className="w-full rounded-[12px] border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px] border-collapse min-w-[580px]">
                  <thead className="bg-surface sticky top-0 border-b border-border text-[12px] text-ink-2 font-medium">
                    <tr className="h-[44px]">
                      <th className="px-4 py-2 font-medium sticky left-0 bg-surface z-10">
                        Campaign
                      </th>
                      <th className="px-4 py-2 font-medium">Status</th>

                      {/* Sortable Sent */}
                      <th
                        className="px-4 py-2 font-medium text-right cursor-pointer select-none hover:text-ink"
                        onClick={() => handleSort('sent')}
                        aria-sort={sortField === 'sent' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <div className="inline-flex items-center gap-1 justify-end">
                          <span>Sent</span>
                          {sortField === 'sent' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-ink-3 opacity-60" strokeWidth={1.5} />
                          )}
                        </div>
                      </th>

                      {/* Sortable Replies */}
                      <th
                        className="px-4 py-2 font-medium text-right cursor-pointer select-none hover:text-ink"
                        onClick={() => handleSort('replies')}
                        aria-sort={sortField === 'replies' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <div className="inline-flex items-center gap-1 justify-end">
                          <span>Replies</span>
                          {sortField === 'replies' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-ink-3 opacity-60" strokeWidth={1.5} />
                          )}
                        </div>
                      </th>

                      {/* Sortable Interested */}
                      <th
                        className="px-4 py-2 font-medium text-right cursor-pointer select-none hover:text-ink"
                        onClick={() => handleSort('interested')}
                        aria-sort={sortField === 'interested' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <div className="inline-flex items-center gap-1 justify-end">
                          <span>Interested</span>
                          {sortField === 'interested' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-ink-3 opacity-60" strokeWidth={1.5} />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-2 font-medium text-right">
                        Cost / reply
                      </th>
                      <th className="px-4 py-2 font-medium text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {sortedCampaigns.map((camp) => {
                      const badgeInfo = campaignBadgeMap[camp.status];
                      const costPerInterested =
                        camp.interested > 0
                          ? currencyFormatter.format((camp.sent * pricing.perEmail) / camp.interested)
                          : '—';

                      return (
                        <tr
                          key={camp.id}
                          className="h-[44px] transition-colors duration-150 ease hover:bg-surface-muted select-none"
                        >
                          <td className="px-4 py-2 font-medium text-ink whitespace-nowrap sticky left-0 bg-inherit z-10">
                            <Link
                              to={`/app/campaigns/${camp.id}`}
                              className="text-ink hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[2px]"
                            >
                              {camp.name}
                            </Link>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <Badge variant={badgeInfo.variant}>
                              {badgeInfo.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-right font-medium tabular-nums text-ink whitespace-nowrap">
                            {numberFormatter.format(camp.sent)}
                          </td>
                          <td className="px-4 py-2 text-right font-medium tabular-nums text-ink whitespace-nowrap">
                            {numberFormatter.format(camp.replies)}
                          </td>
                          <td className="px-4 py-2 text-right font-medium tabular-nums text-ink whitespace-nowrap">
                            {numberFormatter.format(camp.interested)}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-ink-2 whitespace-nowrap text-[13px]">
                            {costPerInterested}
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleToggleCampaign(camp.id, camp.name)}
                              aria-label={`${camp.status === 'Paused' ? 'Resume' : 'Pause'} ${camp.name}`}
                              className="text-[13px] text-primary hover:text-primary-hover font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px] px-1"
                            >
                              {camp.status === 'Paused' ? 'Resume' : 'Pause'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Pinned Total Row */}
                  {campaignTotals && (
                    <tfoot className="border-t border-border bg-surface-muted/40 font-semibold text-ink text-[13px]">
                      <tr className="h-[44px]">
                        <td className="px-4 py-2 sticky left-0 bg-inherit z-10">
                          Total
                        </td>
                        <td className="px-4 py-2 text-ink-3 font-normal">
                          5 campaigns
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {numberFormatter.format(campaignTotals.sent)}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {numberFormatter.format(campaignTotals.replies)}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {numberFormatter.format(campaignTotals.interested)}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-[13px]">
                          {campaignTotals.costPerInterested !== null
                            ? currencyFormatter.format(campaignTotals.costPerInterested)
                            : '—'}
                        </td>
                        <td className="px-4 py-2 text-right text-ink-3 font-normal">
                          —
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right column: "What the agent changed" card (1fr) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-ink tracking-tight">
              Agent activity
            </h2>
            <Badge variant="neutral">Sample</Badge>
          </div>

          <Card variant="default" className="p-4 flex flex-col gap-3">
            <CardHeader className="pb-2 border-b border-border mb-1 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-ink">
                What the agent changed
              </span>
              <span className="text-[11px] text-ink-3">Autonomous log</span>
            </CardHeader>

            <div className="flex flex-col divide-y divide-border">
              {sampleAgentActivity.map((act) => (
                <div key={act.id} className="py-2.5 flex flex-col gap-1 text-left">
                  <p className="text-[13px] text-ink leading-relaxed">
                    {act.description}
                  </p>
                  <span className="text-[11px] text-ink-3 font-mono">
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
