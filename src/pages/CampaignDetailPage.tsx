import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { usePageMeta } from '../utils/usePageMeta';
import { getCampaign, toggleCampaign } from '../services/api';
import { CampaignDetail, CampaignStatus } from '../mock/data';
import { pricing } from '../config/pricing';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge, BadgeVariant } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import {
  ChevronRight,
  Pause,
  Play,
  Mail,
  Users,
  Clock,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
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

const leadStatusBadgeMap: Record<
  'Queued' | 'Sent' | 'Replied' | 'Bounced',
  { variant: BadgeVariant; label: string }
> = {
  Queued: { variant: 'neutral', label: 'Queued' },
  Sent: { variant: 'primary', label: 'Sent' },
  Replied: { variant: 'success', label: 'Replied' },
  Bounced: { variant: 'warm', label: 'Bounced' },
};

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stateQuery = searchParams.get('state');

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Expandable steps in sequence
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  usePageMeta(
    campaign ? campaign.name : 'Campaign detail',
    'Outreach sequence, leads, and performance metrics'
  );

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

    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    getCampaign(id)
      .then((res) => {
        if (!res || stateQuery === 'empty') {
          if (stateQuery === 'empty' && res) {
            setCampaign({
              ...res,
              sent: 0,
              replies: 0,
              interested: 0,
              sequenceSteps: res.sequenceSteps.map((s) => ({
                ...s,
                sent: 0,
                replies: 0,
                interested: 0,
              })),
              leads: [],
              recentChanges: [],
            });
          } else {
            setCampaign(null);
          }
        } else {
          setCampaign(res);
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
  }, [id, stateQuery]);

  const handleToggleStatus = async () => {
    if (!campaign) return;
    try {
      const updatedItem = await toggleCampaign(campaign.id);
      setCampaign((prev) => (prev ? { ...prev, status: updatedItem.status } : null));
      setLiveAnnouncement(
        `${campaign.name} campaign ${
          updatedItem.status === 'Paused' ? 'paused' : 'resumed'
        }.`
      );
    } catch {
      setLiveAnnouncement('Failed to update campaign status.');
    }
  };

  // Cost calculations computed in code
  const cost = useMemo(() => {
    if (!campaign) return { total: 0, perInterested: '—' };
    const totalCost = campaign.sent * pricing.perEmail;
    const perInterested =
      campaign.interested > 0
        ? currencyFormatter.format(totalCost / campaign.interested)
        : '—';
    return {
      total: totalCost,
      perInterested,
    };
  }, [campaign]);

  if (error || (!loading && !campaign)) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyState
          title="Campaign not found."
          description="The campaign you are looking for does not exist or could not be loaded."
          action={{
            label: 'Back to campaigns',
            onClick: () => navigate('/app/campaigns'),
          }}
        />
      </div>
    );
  }

  if (loading || !campaign) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-6 w-32 bg-surface-muted rounded-[4px]" />
        <div className="h-10 w-64 bg-surface-muted rounded-[8px]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface border border-border rounded-[12px]" />
          ))}
        </div>
      </div>
    );
  }

  const badgeInfo = campaignBadgeMap[campaign.status];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Screen reader live announcements */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* 1) Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-ink-3">
        <Link
          to="/app/campaigns"
          className="hover:text-ink transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[2px]"
        >
          Campaigns
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-ink-3" strokeWidth={1.5} />
        <span className="text-ink font-medium" aria-current="page">
          {campaign.name}
        </span>
      </nav>

      {/* 2) Header with Status & Pause/Resume Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold text-ink tracking-tight">
              {campaign.name}
            </h1>
            <Badge variant={badgeInfo.variant}>
              {badgeInfo.label}
            </Badge>
          </div>
          <p className="text-[14px] text-ink-2 max-w-2xl leading-relaxed">
            {campaign.description}
          </p>
        </div>

        <div>
          <Button
            variant={campaign.status === 'Paused' ? 'primary' : 'secondary'}
            onClick={handleToggleStatus}
            icon={
              campaign.status === 'Paused' ? (
                <Play className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Pause className="w-4 h-4" strokeWidth={1.5} />
              )
            }
            className="text-[13px]"
          >
            {campaign.status === 'Paused' ? 'Resume campaign' : 'Pause campaign'}
          </Button>
        </div>
      </div>

      {/* 3) 4 StatCards with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Emails sent"
          value={numberFormatter.format(campaign.sent)}
          caption="Total delivered touches"
          sparklineData={campaign.sent > 0 ? campaign.sparklines.sent : undefined}
        />

        <StatCard
          label="Delivery rate"
          value={`${campaign.deliveryRate.toFixed(1)}%`}
          caption="Verified inboxes"
          sparklineData={campaign.sent > 0 ? campaign.sparklines.delivered : undefined}
        />

        <StatCard
          label="Replies"
          value={numberFormatter.format(campaign.replies)}
          caption={`${campaign.replyRate.toFixed(1)}% reply rate`}
          sparklineData={campaign.sent > 0 ? campaign.sparklines.replies : undefined}
        />

        <StatCard
          label="Interested"
          value={numberFormatter.format(campaign.interested)}
          caption={`${cost.perInterested} / reply`}
          sparklineData={campaign.sent > 0 ? campaign.sparklines.interested : undefined}
        />
      </div>

      {/* 4) Sequence Card */}
      <Card variant="default" className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <h2 className="text-[18px] font-semibold text-ink tracking-tight">
            Sequence
          </h2>
          <p className="text-[13px] text-ink-2">
            Multi-touch outreach written and paced by the agent. Per-step metrics reflect current campaign volume.
          </p>
        </div>

        {campaign.sequenceSteps.length === 0 ? (
          <p className="text-[13px] text-ink-3">No sequence steps configured.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {campaign.sequenceSteps.map((step) => {
              const isExpanded = expandedStep === step.step;
              return (
                <div
                  key={step.step}
                  className="rounded-[10px] border border-border bg-surface-muted/30 p-4.5 flex flex-col gap-3 transition-colors duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-[12px] font-semibold flex items-center justify-center shrink-0">
                        {step.step}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-ink">
                          {step.title}
                        </span>
                        <span className="text-[12px] text-ink-3">
                          {step.dayLabel} · Subject: {step.subject}
                        </span>
                      </div>
                    </div>

                    {/* Step Metrics: exact sums matching totals */}
                    <div className="flex items-center gap-4 text-[13px] tabular-nums self-end sm:self-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-ink font-semibold">{step.sent}</span>
                        <span className="text-[11px] text-ink-3">sent</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-ink font-semibold">{step.replies}</span>
                        <span className="text-[11px] text-ink-3">replies</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-ink font-semibold">{step.interested}</span>
                        <span className="text-[11px] text-ink-3">interested</span>
                      </div>
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                        aria-expanded={isExpanded}
                        className="text-ink-3 hover:text-ink p-1 rounded-[4px] cursor-pointer"
                        aria-label={`${isExpanded ? 'Hide' : 'Show'} template preview`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                        ) : (
                          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[13px] text-ink-2 leading-relaxed italic bg-surface p-3 rounded-[6px] border border-border/80">
                    "{step.snippet}"
                  </p>

                  {/* Expanded Email Template Body */}
                  {isExpanded && (
                    <div className="mt-2 p-3.5 rounded-[8px] bg-surface border border-border flex flex-col gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                        Email template body
                      </span>
                      <pre className="text-[12px] text-ink leading-relaxed whitespace-pre-wrap font-sans">
                        {step.body}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 5) "Who it is reaching" DataTable */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-ink tracking-tight">
            Who it is reaching
          </h2>
          <span className="text-[12px] text-ink-3">
            {campaign.leads.length} sample leads in active circulation
          </span>
        </div>

        {campaign.leads.length === 0 ? (
          <Card variant="default" className="p-8 text-center text-ink-3">
            No contacts in queue for this campaign.
          </Card>
        ) : (
          <div className="w-full rounded-[12px] border border-border bg-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] border-collapse min-w-[620px]">
                <thead className="bg-surface sticky top-0 border-b border-border text-[12px] text-ink-2 font-medium">
                  <tr className="h-[44px]">
                    <th className="px-4 py-2 font-medium sticky left-0 bg-surface z-10">
                      Lead
                    </th>
                    <th className="px-4 py-2 font-medium">Company</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Stage</th>
                    <th className="px-4 py-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaign.leads.map((lead) => {
                    const badge = leadStatusBadgeMap[lead.status];
                    return (
                      <tr
                        key={lead.id}
                        className="h-[44px] transition-colors duration-150 ease hover:bg-surface-muted select-none"
                      >
                        <td className="px-4 py-2 font-medium text-ink whitespace-nowrap sticky left-0 bg-inherit z-10">
                          <div className="flex flex-col">
                            <span className="text-[14px]">{lead.name}</span>
                            <span className="text-[11px] text-ink-3 font-normal">
                              {lead.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-ink-2 whitespace-nowrap">
                          {lead.company}
                        </td>
                        <td className="px-4 py-2 text-ink-3 text-[13px] whitespace-nowrap">
                          {lead.email}
                        </td>
                        <td className="px-4 py-2 text-ink-2 text-[13px] whitespace-nowrap">
                          {lead.step}
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <Badge variant={badge.variant}>
                            {badge.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 6) Two Bottom Cards: "What the agent changed" & "Settings" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* What the agent changed */}
        <Card variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h3 className="text-[16px] font-semibold text-ink">
              What the agent changed
            </h3>
          </div>

          {campaign.recentChanges.length === 0 ? (
            <p className="text-[13px] text-ink-3">
              No recent parameter changes logged for this campaign yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {campaign.recentChanges.map((change) => (
                <li
                  key={change.id}
                  className="flex flex-col gap-0.5 text-[13px] border-b border-border/60 pb-2.5 last:border-b-0 last:pb-0"
                >
                  <span className="text-ink font-normal leading-relaxed">
                    {change.description}
                  </span>
                  <span className="text-[11px] text-ink-3">
                    {change.timestamp}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Campaign Settings */}
        <Card variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sliders className="w-4 h-4 text-ink-2" strokeWidth={1.5} />
            <h3 className="text-[16px] font-semibold text-ink">
              Campaign settings
            </h3>
          </div>

          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Target audience
              </span>
              <span className="text-ink font-medium">
                {campaign.settings.audience}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Daily volume cap
              </span>
              <span className="text-ink">
                {campaign.settings.dailyLimit} emails per day
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Sending window
              </span>
              <span className="text-ink">
                {campaign.settings.schedule}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Sender mailbox
              </span>
              <span className="text-ink">
                {campaign.settings.mailbox}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
