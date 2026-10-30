import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../utils/usePageMeta';
import { getCampaigns, toggleCampaign } from '../services/api';
import { CampaignItem, CampaignStatus } from '../mock/data';
import { pricing } from '../config/pricing';
import { Card } from '../components/Card';
import { Badge, BadgeVariant } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Plus,
  X,
} from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const campaignBadgeMap: Record<CampaignStatus, { variant: BadgeVariant; label: string }> = {
  Scaling: { variant: 'success', label: 'Scaling' },
  Working: { variant: 'primary', label: 'Working' },
  Learning: { variant: 'warm', label: 'Learning' },
  Paused: { variant: 'neutral', label: 'Paused' },
};

export function CampaignsListPage() {
  usePageMeta('Campaigns', 'Active and scheduled buyer outreach campaigns');
  const [searchParams] = useSearchParams();
  const stateQuery = searchParams.get('state');

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [newCampaignNotice, setNewCampaignNotice] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<'sent' | 'replies' | 'interested' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
    getCampaigns()
      .then((res) => {
        if (stateQuery === 'empty') {
          setCampaigns([]);
        } else {
          setCampaigns(res);
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
  }, [stateQuery]);

  const handleSort = (field: 'sent' | 'replies' | 'interested') => {
    if (sortField === field) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        setSortField(null);
        setSortDirection('desc');
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleToggle = async (id: string, name: string) => {
    try {
      const updated = await toggleCampaign(id);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setLiveAnnouncement(
        `${name} campaign ${updated.status === 'Paused' ? 'paused' : 'resumed'}.`
      );
    } catch {
      setLiveAnnouncement('Failed to update campaign state.');
    }
  };

  const sortedCampaigns = useMemo(() => {
    if (!sortField) return campaigns;
    return [...campaigns].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [campaigns, sortField, sortDirection]);

  // Aggregate totals
  const totals = useMemo(() => {
    const totalSent = campaigns.reduce((acc, c) => acc + c.sent, 0);
    const totalReplies = campaigns.reduce((acc, c) => acc + c.replies, 0);
    const totalInterested = campaigns.reduce((acc, c) => acc + c.interested, 0);
    const totalCost = totalSent * pricing.perEmail;
    const avgCostPerReply = totalInterested > 0 ? totalCost / totalInterested : 0;
    return {
      totalSent,
      totalReplies,
      totalInterested,
      totalCost,
      avgCostPerReply,
    };
  }, [campaigns]);

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyState
          title="Could not load campaigns."
          description="There was a connection issue loading campaign details. Please try again."
          action={{
            label: 'Try again',
            onClick: loadData,
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-muted rounded-[6px]" />
        <div className="h-64 bg-surface border border-border rounded-[12px]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-semibold text-ink tracking-tight">
            Campaigns
          </h1>
          <p className="text-[14px] text-ink-2">
            Targeted buyer segments researched and managed by your sales agent.
          </p>
        </div>

        <div className="relative">
          <Button
            variant="primary"
            onClick={() => setNewCampaignNotice(!newCampaignNotice)}
            icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
            aria-expanded={newCampaignNotice}
          >
            New campaign
          </Button>

          {newCampaignNotice && (
            <div
              role="dialog"
              aria-label="New campaign notice"
              className="absolute right-0 top-[44px] w-[280px] p-3.5 bg-surface border border-border rounded-[8px] shadow-md z-30 text-left flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-ink">Preview note</span>
                <button
                  onClick={() => setNewCampaignNotice(false)}
                  className="text-ink-3 hover:text-ink p-0.5 rounded-[4px] cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-[12px] text-ink-2 leading-relaxed">
                The agent adds and optimizes campaigns automatically based on your business profile.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main DataTable */}
      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet."
          description="Create a campaign targeting property managers, clinics, or office spaces to start sending verified emails."
          action={{
            label: 'New campaign',
            onClick: () => setNewCampaignNotice(true),
          }}
        />
      ) : (
        <div className="w-full rounded-[12px] border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse min-w-[620px]">
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
                    aria-sort={
                      sortField === 'sent'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
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
                    aria-sort={
                      sortField === 'replies'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
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
                    aria-sort={
                      sortField === 'interested'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
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
                          onClick={() => handleToggle(camp.id, camp.name)}
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

              {/* Summary Footer Row */}
              <tfoot className="border-t border-border bg-surface-muted/40 font-semibold text-ink text-[13px]">
                <tr className="h-[44px]">
                  <td className="px-4 py-2 sticky left-0 bg-inherit z-10">
                    Total
                  </td>
                  <td className="px-4 py-2 text-ink-3 font-normal">
                    {campaigns.length} campaigns
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {numberFormatter.format(totals.totalSent)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {numberFormatter.format(totals.totalReplies)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {numberFormatter.format(totals.totalInterested)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-ink-2 font-normal">
                    {totals.totalInterested > 0
                      ? currencyFormatter.format(totals.avgCostPerReply)
                      : '—'}
                  </td>
                  <td className="px-4 py-2 text-right text-ink-3 font-normal">
                    —
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
