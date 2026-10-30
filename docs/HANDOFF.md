# Outbound — Engineering Handoff Documentation

This document outlines the frontend architecture, routes, reusable components, data interfaces, backend integration hooks, and design system compliance rules for the application.

---

## 1. Routes

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/` | `src/pages/LandingPage.tsx` | Public landing page featuring sticky header, two-column hero with subtle background drift and rotating pill, social proof placeholder, 6-step How It Works breakdown with HTML/CSS preview cards, simple pay-as-you-go pricing card, 6-item accessible FAQ accordion, and footer with sample dashboard link. |
| `/start` | `src/pages/StartFlowPage.tsx` | 4-step onboarding flow persisted via `sessionStorage`. Supports direct URL sync (`?step=1..4`), staged domain analysis animation, editable company profile/competitors, fit-score segment selection, verified lead roster, and 420px accessible email review drawer. Includes a "See a sample dashboard" link to `/app`. |
| `/app` | `src/pages/DashboardPage.tsx` | Signed-in agent dashboard with overview header, dismissible setup checklist, today's sending stats (replies waiting links to `/app/inbox`), interactive daily budget slider with cost calculations, 7d/30d performance metrics with SVG sparklines, sortable campaigns DataTable with campaign names linking to `/app/campaigns/:id` and inline pause/resume, and autonomous agent activity log. Supports review states: `?state=loading`, `?state=empty`, `?state=error`. |
| `/app/inbox` | `src/pages/InboxPage.tsx` | 2-pane Inbox (360px list left, thread detail right on desktop >=1024px; single list on mobile opening full-screen detail with back button). Filter tabs ("Needs you", "Handled", "All"), reply mode segmented control ("Review drafts" / "Auto-send"), unread indicator dot, intent badges, editable agent draft response, missing fact warning linking to `/app/profile`, disabled approve button while `[confirm ...]` is present, facts used list, approve/discard actions with `aria-live` announcements. Supports `?state=loading`, `?state=empty`, `?state=error`. |
| `/app/inbox/:threadId` | `src/pages/InboxPage.tsx` | Specific selected thread view with focus auto-transferred to thread h1 heading and unread marker cleared. |
| `/app/campaigns` | `src/pages/CampaignsListPage.tsx` | All outreach campaigns list reusing the campaigns DataTable with sortable headers, inline pause/resume toggle, aggregate metrics, and review states (`?state=loading`, `?state=empty`, `?state=error`). |
| `/app/campaigns/:id` | `src/pages/CampaignDetailPage.tsx` | Campaign detail with breadcrumb, status badge, pause/resume button with polite live announcements, 4 StatCards with sparklines, sequence breakdown with exact per-step figures summing to campaign totals, "Who it is reaching" 6-lead DataTable, "What the agent changed" log, and campaign settings card. Supports review states (`?state=loading`, `?state=empty`, `?state=error`). |
| `/app/:section` | `src/pages/SectionPlaceholderPage.tsx` | Shared placeholder for remaining sidebar destinations using `EmptyState`. |
| `/_components` | `src/pages/ComponentsPage.tsx` | Interactive design system primitives gallery demonstrating every token, font weight/size, component, and interaction state. |
| `*` | Redirection | Any unmatched route redirects to `/`. |

---

## 2. Component Inventory

All components are located in `src/components/` and strictly respect the 4px grid, 12px card radius, 8px input/button radius, 999 pill radius, 1px borders, and 150ms ease transitions.

| Component | File Path | States & Capabilities |
| :--- | :--- | :--- |
| **AppShell** | `src/components/AppShell.tsx` | Extended sidebar layout with grouped sections (Work, Setup, Account), collapsible to a 64px icon rail on desktop, off-canvas drawer on mobile (<1024px) with focus trap and Esc handling, active navigation background in `--primary-soft` with text in `--primary` (`aria-current="page"`), live "Needs you" unread badge count for Inbox, user account popover menu, and 1120px max-width content container. |
| **Button** | `src/components/Button.tsx` | Variants: `primary`, `secondary`, `ghost`, `danger`. Sizes: `default` (36px), `hero` (44px). States: default, hover, active, disabled, loading (subtle SVG spinner), icon left/right. |
| **Input** | `src/components/Input.tsx` | Heights: 36px and 44px hero. States: default, focused, with value, disabled, error (border `--danger`), helper text, prefix/suffix icons. |
| **Card** | `src/components/Card.tsx` | 12px radius, 1px `--border`, no shadow. Variants: `default`, `muted` (`--surface-muted`), `interactive` (hover border highlight). Subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. |
| **Badge** | `src/components/Badge.tsx` | 999 pill radius, 12px font size. Variants: `neutral`, `primary`, `success`, `warm`, `danger`. Supports optional status dot. |
| **ProgressBar** | `src/components/ProgressBar.tsx` | 4px and 8px heights, 999 pill radius. Variants: `primary`, `success`, `warm`, `danger`. Tabular numeric percentage and label support. |
| **Tabs** | `src/components/Tabs.tsx` | Underline and pill variants with sentence case labels and tabular count badges. Active indicator in `--primary`. |
| **StatCard** | `src/components/StatCard.tsx` | Label, big tabular number, small caption, and a 1.5px SVG sparkline rendered in `--primary` with no fill. |
| **DataTable** | `src/components/DataTable.tsx` | Sticky header, 44px rows, hover background `--surface-muted`, selected rows in `--primary-soft`, row checkboxes, tabular figures. |
| **EmptyState** | `src/components/EmptyState.tsx` | Left-aligned hierarchy, title, description, primary and secondary action buttons. |

---

## 3. Data Interfaces (`src/mock/data.ts`)

```typescript
export interface Competitor {
  id: string;
  name: string;
  domain: string;
}

export interface SiteAnalysis {
  url: string;
  description: string;
  targetAudiences: string[];
  competitors: Competitor[];
}

export interface Segment {
  id: string;
  name: string;
  why: string;
  fitScore: number;
  estimatedLeads: number;
}

export interface Lead {
  id: string;
  name: string;
  role: string;
  company: string;
  segmentId: string;
  segmentName: string;
  verified: boolean;
}

export interface EmailDraft {
  leadId: string;
  subject: string;
  body: string;
  evidence: string[];
  senderLine: string;
}

export interface DailyMetric {
  date: string;
  dayLabel: string;
  sent: number;
  bounced: number;
  interested: number;
}

export type CampaignStatus = 'Scaling' | 'Working' | 'Learning' | 'Paused';

export interface CampaignItem {
  id: string;
  name: string;
  status: CampaignStatus;
  sent: number;
  replies: number;
  interested: number;
}

export interface DashboardToday {
  sent: number;
  queued: number;
  repliesWaiting: number;
  balance: number;
  dailyBudget: number;
}

export interface DashboardData {
  range: '7d' | '30d';
  daily: DailyMetric[];
  today: DashboardToday;
  campaigns: CampaignItem[];
}

export interface AgentActivityItem {
  id: string;
  description: string;
  timestamp: string;
}

export type Intent =
  | 'Interested'
  | 'Question'
  | 'Not now'
  | 'Not a fit'
  | 'Out of office'
  | 'Opted out';

export type ReplyMode = 'review' | 'auto';

export interface Message {
  id: string;
  sender: 'lead' | 'agent';
  senderName: string;
  senderEmail: string;
  time: string;
  body: string;
}

export interface DraftNotice {
  warning: string;
  linkText: string;
  linkHref: string;
}

export interface Draft {
  id: string;
  body: string;
  hasMissingFactMarker: boolean;
  missingFactNotice?: DraftNotice | null;
  factsUsed: string[];
}

export interface Thread {
  id: string;
  leadName: string;
  leadRole: string;
  leadCompany: string;
  leadEmail: string;
  segmentName: string;
  campaignId: string;
  campaignName: string;
  intent: Intent;
  unread: boolean;
  status: 'needs_review' | 'handled';
  updatedAt: string;
  snippet: string;
  messages: Message[];
  draft?: Draft | null;
  handledNotice?: string | null;
}

export interface SequenceStep {
  step: number;
  dayLabel: string;
  title: string;
  subject: string;
  snippet: string;
  body: string;
  sent: number;
  replies: number;
  interested: number;
}

export interface CampaignLead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  step: string;
  status: 'Queued' | 'Sent' | 'Replied' | 'Bounced';
}

export interface CampaignSetting {
  audience: string;
  dailyLimit: number;
  schedule: string;
  mailbox: string;
}

export interface CampaignDetail extends CampaignItem {
  description: string;
  deliveryRate: number;
  replyRate: number;
  sequenceSteps: SequenceStep[];
  leads: CampaignLead[];
  recentChanges: AgentActivityItem[];
  settings: CampaignSetting;
  sparklines: {
    sent: number[];
    delivered: number[];
    replies: number[];
    interested: number[];
  };
}
```

---

## 4. Backend Service Endpoints & `TODO(backend)` Locations

All components access data through asynchronous wrapper functions in `src/services/api.ts`. No components import directly from `src/mock/data.ts`.

| Function | Location in `src/services/api.ts` | Backend Task Description |
| :--- | :--- | :--- |
| `analyzeSite(url: string)` | Line 29 | `// TODO(backend): Call backend website crawler and LLM domain extraction service (e.g. POST /api/analyze).` |
| `getSegments()` | Line 44 | `// TODO(backend): Call backend ICP segmentation and scoring endpoint (e.g. GET /api/segments).` |
| `getLeads(segmentIds?: string[])` | Line 53 | `// TODO(backend): Call backend lead discovery and verification service (e.g. POST /api/leads/search).` |
| `getEmailDraft(leadId: string)` | Line 64 | `// TODO(backend): Call backend email generation engine with research context (e.g. GET /api/leads/:id/draft).` |
| `getDashboard(range: "7d" \| "30d")` | Line 94 | `// TODO(backend): Call backend analytics endpoint for date-ranged performance metrics (e.g. GET /api/dashboard?range=7d).` |
| `setDailyBudget(amount: number)` | Line 111 | `// TODO(backend): Call backend budget management endpoint (e.g. PATCH /api/settings/budget).` |
| `toggleCampaign(id: string)` | Line 120 | `// TODO(backend): Call backend campaign state management endpoint (e.g. POST /api/campaigns/:id/toggle).` |
| `getInbox(filter?: "needs_you" \| "handled" \| "all")` | Line 145 | `// TODO(backend): Call backend inbox thread retrieval endpoint (e.g. GET /api/inbox?filter=needs_you).` |
| `getThread(id: string)` | Line 180 | `// TODO(backend): Call backend thread detail endpoint (e.g. GET /api/inbox/threads/:id).` |
| `approveDraft(id: string, text: string)` | Line 199 | `// TODO(backend): Call backend email dispatch service to send the approved reply (e.g. POST /api/inbox/threads/:id/approve).` |
| `discardDraft(id: string)` | Line 237 | `// TODO(backend): Call backend draft removal endpoint (e.g. DELETE /api/inbox/threads/:id/draft).` |
| `setReplyMode(mode: ReplyMode)` | Line 258 | `// TODO(backend): Call backend agent autonomy configuration endpoint (e.g. PUT /api/settings/reply-mode).` |
| `getCampaigns()` | Line 268 | `// TODO(backend): Call backend campaigns list endpoint (e.g. GET /api/campaigns).` |
| `getCampaign(id: string)` | Line 277 | `// TODO(backend): Call backend campaign detail endpoint (e.g. GET /api/campaigns/:id).` |

---

## 5. Pricing Configuration (`src/config/pricing.ts`)

```typescript
// Sample rate. Replace before launch.
export const pricing = {
  perEmail: 0.03,
};
```
Whenever price per email is shown in the interface, it is explicitly accompanied by the label "sample rate".

---

## 6. Design Rule Verification Checklist

| Rule | Status | Notes |
| :--- | :---: | :--- |
| **Brand configuration** | Followed | `src/config/brand.ts` exports `{ name, tagline, supportEmail }`. All product name references dynamically read from this file. |
| **Fictional sample business** | Followed | All sample data is centered on "Harbor & Pine" (commercial cleaning in Austin, TX at `harborandpine.example`). All domains use `.example`. |
| **Tokens only (no hardcoded hex)** | Followed | All colors reference defined CSS variables mapped in Tailwind. |
| **Token substitutions** | None | Strictly adhered to the provided tokens. Modal/drawer scrim uses `bg-ink/20` and focus ring uses `ring-primary/40`. |
| **No AI slop aesthetics** | Followed | Zero gradients, zero glassmorphism, zero neon glows, zero decorative blobs, zero icon-in-colored-circle grids. 1px borders used instead of shadows on cards. |
| **Left-aligned text & hierarchy** | Followed | Left-aligned layouts across hero, dashboard cards, tables, and empty states. |
| **Derived numbers computed dynamically** | Followed | All sums, delivery rates (98.1%), total costs ($12.36), and cost per reply are calculated at runtime from raw daily numbers and `pricing.perEmail`. |
| **Interactive budget slider** | Followed | Slider from $0 to $50 updates Today status (Paused if $0), emails/day projection, used today bar, and persists via `setDailyBudget`. |
| **Table sorting & Pinned total row** | Followed | Clickable Sent, Replies, and Interested headers with `aria-sort` and directional indicator arrows. Pinned total row at bottom. |
| **Live announcements on campaign toggle** | Followed | Pause/Resume action triggers polite `aria-live` announcement ("Paused [name]" / "Resumed [name]") with no toast. |
| **Review states (`?state=loading`, `?state=empty`, `?state=error`)** | Followed | Tested and fully operational on `/app`, `/app/inbox`, and `/app/campaigns/:id`. |
| **Copy discipline** | Followed | Sentence case everywhere. No exclamation marks, no emoji. Forbidden words (revolutionize, supercharge, unlock, seamless, effortless, game-changing, cutting-edge, leverage, delve) strictly excluded. |
| **Typography & Number formatting** | Followed | Figtree font, numbers formatted with `Intl.NumberFormat`, and `tabular-nums` applied on all figures. |
| **Reduced motion support** | Followed | Skeletons don't animate under `prefers-reduced-motion`, sparklines and cards load statically. |
| **Accessibility & Landmarks** | Followed | Nav landmarks, collapsible sidebar, off-canvas mobile drawer with focus trap, popovers close on Esc, single `h1` per page, focus transferred to H1 on thread selection. |
