import { useState } from 'react';
import { brand } from '../config/brand';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Tabs } from '../components/Tabs';
import { StatCard } from '../components/StatCard';
import { DataTable, Column } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import {
  mockMetrics,
  mockLeads,
  mockLeadTabs,
  LeadItem,
} from '../mock/data';
import { Search, Plus, ArrowRight, Mail, Check, RefreshCw } from 'lucide-react';

export function ComponentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [activePillTab, setActivePillTab] = useState('active');
  const [inputVal, setInputVal] = useState('https://northfieldbio.com');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>(['lead-01', 'lead-04']);
  const [tableShowEmpty, setTableShowEmpty] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const columns: Column<LeadItem>[] = [
    {
      key: 'name',
      header: 'Prospect',
      render: (row) => (
        <div className="flex flex-col py-1">
          <span className="font-medium text-ink leading-tight">{row.name}</span>
          <span className="text-[12px] text-ink-3 leading-tight">{row.title} · {row.company}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email address',
      render: (row) => (
        <span className="text-ink-2 font-mono text-[13px]">{row.email}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const badgeMap = {
          hot: { variant: 'warm' as const, label: 'Hot lead' },
          verified: { variant: 'success' as const, label: 'Verified' },
          delivered: { variant: 'primary' as const, label: 'Delivered' },
          paused: { variant: 'danger' as const, label: 'Paused' },
          bounced: { variant: 'neutral' as const, label: 'Bounced' },
        }[row.status];

        return (
          <Badge variant={badgeMap.variant} withDot>
            {badgeMap.label}
          </Badge>
        );
      },
    },
    {
      key: 'matchScore',
      header: 'Match score',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums font-medium text-ink">
          {row.matchScore}%
        </span>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last activity',
      align: 'right',
      render: (row) => (
        <span className="text-[12px] text-ink-3">{row.lastActivity}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-12 pb-24 text-left">
      {/* Page Header */}
      <header className="flex flex-col gap-2 pb-6 border-b border-border">
        <h1 className="text-[28px] font-semibold text-ink tracking-tight leading-tight">
          Component library
        </h1>
        <p className="text-[14px] text-ink-2 leading-relaxed max-w-2xl">
          Specification-compliant primitives for {brand.name}. All components strictly adhere to the warm off-white design tokens, 4px spatial grid, 1px borders, and Figtree typography.
        </p>
      </header>

      {/* 1. Tokens & Typography System */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            Design tokens & typography
          </h2>
          <p className="text-[14px] text-ink-2">
            Mapped via CSS variables and tailwind.config. Zero hard-coded hex values.
          </p>
        </div>

        {/* Color Palette Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-bg border border-border" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--bg</span>
              <span className="text-[12px] text-ink-3 font-mono">#F6F5F2</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-surface border border-border" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--surface</span>
              <span className="text-[12px] text-ink-3 font-mono">#FFFFFF</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-surface-muted border border-border" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--surface-muted</span>
              <span className="text-[12px] text-ink-3 font-mono">#F0EEE9</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-border border border-border-strong" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--border</span>
              <span className="text-[12px] text-ink-3 font-mono">#E4E1DA</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-primary" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--primary</span>
              <span className="text-[12px] text-ink-3 font-mono">#4F63B5</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-primary-soft border border-primary/20" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--primary-soft</span>
              <span className="text-[12px] text-ink-3 font-mono">#E8ECF8</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-success" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--success</span>
              <span className="text-[12px] text-ink-3 font-mono">#3F8F6B</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-success-soft border border-success/20" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--success-soft</span>
              <span className="text-[12px] text-ink-3 font-mono">#E3F1EA</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-warm" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--warm</span>
              <span className="text-[12px] text-ink-3 font-mono">#C28A2C</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-warm-soft border border-warm/20" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--warm-soft</span>
              <span className="text-[12px] text-ink-3 font-mono">#F8EFDC</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-danger" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--danger</span>
              <span className="text-[12px] text-ink-3 font-mono">#B5483F</span>
            </div>
          </div>
          <div className="p-3 rounded-[8px] border border-border bg-surface flex flex-col gap-2">
            <div className="h-10 rounded-[6px] bg-danger-soft border border-danger/20" />
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-ink">--danger-soft</span>
              <span className="text-[12px] text-ink-3 font-mono">#F7E4E1</span>
            </div>
          </div>
        </div>

        {/* Typography Scale */}
        <div className="p-6 rounded-[12px] border border-border bg-surface flex flex-col gap-4">
          <span className="text-[12px] font-medium text-ink-3">Typography hierarchy (Figtree)</span>
          <div className="flex flex-col gap-3 divide-y divide-border">
            <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-[12px] text-ink-3 font-mono w-32">48 hero (700)</span>
              <p className="text-[48px] font-bold text-ink tracking-tight leading-tight flex-1">
                Autonomous outbound for verified B2B buyers
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-[12px] text-ink-3 font-mono w-32">28 page title (600)</span>
              <p className="text-[28px] font-semibold text-ink tracking-tight leading-tight flex-1">
                Campaign performance and meeting conversion
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-[12px] text-ink-3 font-mono w-32">20 section title (600)</span>
              <p className="text-[20px] font-semibold text-ink tracking-tight leading-tight flex-1">
                Target audience discovery and email verification
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-[12px] text-ink-3 font-mono w-32">16 large body (400)</span>
              <p className="text-[16px] text-ink leading-relaxed flex-1">
                Crawls your product pages to identify decision makers with authentic purchasing authority.
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-[12px] text-ink-3 font-mono w-32">14 body (400)</span>
              <p className="text-[14px] text-ink leading-relaxed flex-1">
                Standard interface copy with 1.5 line height for maximum legibility and readability across screens.
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-[12px] text-ink-3 font-mono w-32">12 caption (400)</span>
              <p className="text-[12px] text-ink-3 leading-normal flex-1">
                Secondary captions, column table headers, metadata timestamps, and form field helper annotations.
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-[12px] text-ink-3 font-mono w-32">Tabular numerals</span>
              <p className="text-[14px] font-medium text-ink tabular-nums flex-1">
                0123456789 · $1,280,450.00 · 99.4% · +14% weekly growth
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Button Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            Button
          </h2>
          <p className="text-[14px] text-ink-2">
            Radius 8px, heights 36px (default) and 44px (hero), 150ms ease transition, 2px focus ring.
          </p>
        </div>

        <div className="p-6 rounded-[12px] border border-border bg-surface flex flex-col gap-6">
          {/* Default Height 36px Variants */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-ink-3">Standard height (36px)</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary button</Button>
              <Button variant="secondary">Secondary button</Button>
              <Button variant="ghost">Ghost button</Button>
              <Button variant="danger">Danger action</Button>
              <Button variant="primary" disabled>Disabled button</Button>
              <Button
                variant="primary"
                isLoading={isDemoLoading}
                onClick={() => {
                  setIsDemoLoading(true);
                  setTimeout(() => setIsDemoLoading(false), 1200);
                }}
              >
                {isDemoLoading ? 'Analyzing...' : 'Click to load'}
              </Button>
            </div>
          </div>

          {/* Buttons with Icons */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-ink-3">With icons</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                Add business URL
              </Button>
              <Button variant="secondary" icon={<Mail className="w-4 h-4" />}>
                Send test sequence
              </Button>
              <Button
                variant="ghost"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                View all leads
              </Button>
              <Button
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Sync inboxes
              </Button>
            </div>
          </div>

          {/* Hero Height 44px */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-ink-3">Hero height (44px)</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="hero" variant="primary" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                Launch automated outreach
              </Button>
              <Button size="hero" variant="secondary">
                Upload lead CSV
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Input Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            Input
          </h2>
          <p className="text-[14px] text-ink-2">
            Radius 8px, height 36px (or 44px hero), 1px border, 2px --primary focus ring at 40% opacity.
          </p>
        </div>

        <div className="p-6 rounded-[12px] border border-border bg-surface grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Target company URL"
            placeholder="https://example.com"
            helperText="Enter a domain to analyze buyer personas and prospects."
            prefixIcon={<Search className="w-4 h-4" />}
          />

          <Input
            label="Active domain input (with value)"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            helperText="Ready for customer profile extraction."
          />

          <Input
            label="Email address (error state)"
            defaultValue="invalid-email-format"
            errorMessage="Please enter a valid business email domain."
          />

          <Input
            label="Mailbox API key (disabled state)"
            defaultValue="sk_live_outbound_9420b6ab"
            disabled
            helperText="Managed by server-side secrets."
          />

          <div className="md:col-span-2">
            <Input
              label="Hero input size (44px height)"
              inputSize="hero"
              placeholder="Paste website address to start lead discovery..."
              prefixIcon={<Search className="w-5 h-5" />}
              suffixIcon={<Check className="w-4 h-4 text-success" />}
            />
          </div>
        </div>
      </section>

      {/* 4. Card Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            Card
          </h2>
          <p className="text-[14px] text-ink-2">
            Radius 12px, 1px --border, no shadow. Popovers and drawers only receive soft shadows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Autonomous pipeline</CardTitle>
              <CardDescription>Continuous lead generation cycle</CardDescription>
            </CardHeader>
            <CardContent>
              The agent visits targets, scans for hiring and decision makers, verifies inboxes against MX records, and drafts tailored emails.
            </CardContent>
            <CardFooter>
              <span className="text-[12px] text-ink-3">Updated 2m ago</span>
              <Badge variant="success">Active</Badge>
            </CardFooter>
          </Card>

          <Card variant="interactive">
            <CardHeader>
              <CardTitle>Interactive card</CardTitle>
              <CardDescription>Hover border highlight state</CardDescription>
            </CardHeader>
            <CardContent>
              Clickable cards respond on hover with 150ms ease transition to --border-strong, maintaining zero elevation or drop shadows.
            </CardContent>
            <CardFooter>
              <span className="text-[12px] text-ink-2 font-medium">Click to inspect</span>
              <ArrowRight className="w-4 h-4 text-ink-2" />
            </CardFooter>
          </Card>

          <Card variant="muted">
            <CardHeader>
              <CardTitle>Muted surface card</CardTitle>
              <CardDescription>Secondary grouping container</CardDescription>
            </CardHeader>
            <CardContent>
              Utilizes --surface-muted (#F0EEE9) background for secondary panels, technical summaries, or contextual metadata callouts.
            </CardContent>
            <CardFooter>
              <span className="text-[12px] text-ink-3 font-mono">--surface-muted</span>
              <span className="text-[12px] text-ink-2 font-medium">System container</span>
            </CardFooter>
          </Card>
        </div>

        {/* Social proof placeholder card */}
        <div className="p-4 rounded-[12px] border border-dashed border-border-strong bg-surface text-left flex flex-col gap-1">
          <span className="text-[12px] font-mono text-ink-3">[Social proof placeholder]</span>
          <p className="text-[14px] text-ink-2">
            Customer testimonials, logos, and verified case studies will be displayed here once customer verification and consent are completed.
          </p>
        </div>
      </section>

      {/* 5. Badge Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            Badge
          </h2>
          <p className="text-[14px] text-ink-2">
            Radius 999 pill, 12px font size, mapped token variants.
          </p>
        </div>

        <div className="p-6 rounded-[12px] border border-border bg-surface flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-ink-3">Standard pills</span>
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="neutral">Neutral: Draft</Badge>
              <Badge variant="primary">Primary: In review</Badge>
              <Badge variant="success">Success: Sent & delivered</Badge>
              <Badge variant="warm">Warm: Hot lead (46)</Badge>
              <Badge variant="danger">Danger: Paused / bounced</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-ink-3">With status dot</span>
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="neutral" withDot>Draft queue</Badge>
              <Badge variant="primary" withDot>Mailbox active</Badge>
              <Badge variant="success" withDot>On schedule</Badge>
              <Badge variant="warm" withDot>Reply detected</Badge>
              <Badge variant="danger" withDot>Quota reached</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ProgressBar Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            ProgressBar
          </h2>
          <p className="text-[14px] text-ink-2">
            4px spacing grid, radius 999, token color fills, tabular numbers.
          </p>
        </div>

        <div className="p-6 rounded-[12px] border border-border bg-surface flex flex-col gap-5">
          <ProgressBar
            value={0}
            label="Sequence initialization"
            helper="Waiting for first prospect selection"
            showValue
          />
          <ProgressBar
            value={35}
            label="Target domain scraping"
            helper="CRAWL: 14 pages evaluated of 40"
            showValue
          />
          <ProgressBar
            value={78}
            label="Verified lead enrichment"
            variant="primary"
            showValue
          />
          <ProgressBar
            value={100}
            label="Deliverability verification"
            variant="success"
            showValue
            helper="All MX records and SMTP handshakes passed."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <ProgressBar
              value={88}
              label="Warm leads ratio"
              variant="warm"
              showValue
              size="sm"
            />
            <ProgressBar
              value={99}
              label="Inbox health"
              variant="success"
              showValue
              size="sm"
            />
            <ProgressBar
              value={14}
              label="Bounce threshold"
              variant="danger"
              showValue
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* 7. Tabs Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            Tabs
          </h2>
          <p className="text-[14px] text-ink-2">
            Underline and pill variants, sentence case, count badges, 150ms ease transition.
          </p>
        </div>

        <div className="p-6 rounded-[12px] border border-border bg-surface flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-ink-3">Underline tab group (with counts)</span>
            <Tabs
              tabs={mockLeadTabs}
              activeId={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-ink-3">Pill segmented tabs</span>
            <Tabs
              variant="pills"
              tabs={[
                { id: 'active', label: 'Active campaigns', count: 4 },
                { id: 'scheduled', label: 'Scheduled', count: 2 },
                { id: 'completed', label: 'Completed', count: 18 },
                { id: 'archived', label: 'Archived', disabled: true },
              ]}
              activeId={activePillTab}
              onChange={setActivePillTab}
            />
          </div>
        </div>
      </section>

      {/* 8. StatCard Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            StatCard
          </h2>
          <p className="text-[14px] text-ink-2">
            Label, big number, small caption, and a 1.5px sparkline in --primary with no fill.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockMetrics.map((metric) => (
            <StatCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              caption={metric.caption}
              sparklineData={metric.trend}
            />
          ))}
        </div>
      </section>

      {/* 9. DataTable Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-ink tracking-tight">
              DataTable
            </h2>
            <p className="text-[14px] text-ink-2">
              Sticky header, 44px rows, hover --surface-muted, selected row --primary-soft, tabular numerals.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <Button
              variant="secondary"
              size="default"
              onClick={() => setTableShowEmpty(!tableShowEmpty)}
            >
              {tableShowEmpty ? 'Show sample rows' : 'View empty table state'}
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={tableShowEmpty ? [] : mockLeads}
          keyExtractor={(row) => row.id}
          selectable
          selectedIds={selectedLeadIds}
          onSelectionChange={setSelectedLeadIds}
          emptyMessage="No verified prospects found matching current filter criteria."
        />
      </section>

      {/* 10. EmptyState Component */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-ink tracking-tight">
            EmptyState
          </h2>
          <p className="text-[14px] text-ink-2">
            Left-aligned text, clear typographic hierarchy, generous whitespace, actionable button triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            title="No businesses analyzed yet"
            description="Enter a website URL above to allow the agent to crawl product pages, discover ICP personas, and assemble verified buyer contacts."
            action={{
              label: 'Analyze new URL',
              onClick: () => {},
            }}
            secondaryAction={{
              label: 'View sample report',
              onClick: () => {},
            }}
          />

          <EmptyState
            title="All replies reviewed"
            description="No inbound prospect messages require human input. The AI agent has responded to scheduling requests and booked meetings."
            action={{
              label: 'Inspect calendar sync',
              onClick: () => {},
            }}
          />
        </div>
      </section>
    </div>
  );
}
