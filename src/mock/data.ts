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

export const sampleHeroStatusMessages = [
  "Reading harborandpine.example",
  "Found 184 property managers",
  "Writing 12 personal emails",
  "Reply received: Tuesday works",
  "Meeting booked",
];

// Harbor & Pine sample data
export const sampleSiteAnalysis: SiteAnalysis = {
  url: "harborandpine.example",
  description:
    "Commercial janitorial and facility maintenance services in Austin, Texas. Specializes in multi-tenant office parks, outpatient medical clinics, and creative studios. Services include daily porter care, terminal sanitization, and green cleaning protocols.",
  targetAudiences: [
    "Property managers",
    "Medical facility administrators",
    "Office operations leads",
    "Coworking operators",
  ],
  competitors: [
    {
      id: "comp-1",
      name: "Austin Clean Pro",
      domain: "austincleanpro.example",
    },
    {
      id: "comp-2",
      name: "Lone Star Facility Care",
      domain: "lonestarfacilities.example",
    },
    {
      id: "comp-3",
      name: "Capitol Janitorial Group",
      domain: "capitoljanitorial.example",
    },
    {
      id: "comp-4",
      name: "Hill Country Building Services",
      domain: "hillcountryservices.example",
    },
    {
      id: "comp-5",
      name: "Verde Commercial Clean",
      domain: "verdecommercial.example",
    },
  ],
};

export const sampleSegments: Segment[] = [
  {
    id: "seg-1",
    name: "Property managers",
    why: "Manage multiple Class A commercial office properties requiring nightly turnover",
    fitScore: 91,
    estimatedLeads: 184,
  },
  {
    id: "seg-2",
    name: "Medical clinics",
    why: "Require strict sanitization standards and documented compliance logs",
    fitScore: 84,
    estimatedLeads: 142,
  },
  {
    id: "seg-3",
    name: "Coworking spaces",
    why: "High foot-traffic environments with flexible daily cleaning requirements",
    fitScore: 78,
    estimatedLeads: 96,
  },
  {
    id: "seg-4",
    name: "Law firms",
    why: "Confidential office spaces needing trusted, vetted evening janitorial crews",
    fitScore: 71,
    estimatedLeads: 88,
  },
  {
    id: "seg-5",
    name: "Boutique hotels",
    why: "Require supplemental overnight support for common areas and meeting spaces",
    fitScore: 66,
    estimatedLeads: 64,
  },
];

export const sampleLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Marcus Vance",
    role: "Property operations lead",
    company: "Travis Tower Management",
    segmentId: "seg-1",
    segmentName: "Property managers",
    verified: true,
  },
  {
    id: "lead-2",
    name: "Elena Rostova",
    role: "Facilities director",
    company: "Barton Creek Medical Suites",
    segmentId: "seg-2",
    segmentName: "Medical clinics",
    verified: true,
  },
  {
    id: "lead-3",
    name: "Sarah Chen",
    role: "Community general manager",
    company: "Atelier Workspaces Austin",
    segmentId: "seg-3",
    segmentName: "Coworking spaces",
    verified: true,
  },
  {
    id: "lead-4",
    name: "Julian Hayes",
    role: "Senior portfolio director",
    company: "Congress Plaza Commercial",
    segmentId: "seg-1",
    segmentName: "Property managers",
    verified: true,
  },
  {
    id: "lead-5",
    name: "David Lindholm",
    role: "Clinical operations manager",
    company: "Guadalupe Family Practice",
    segmentId: "seg-2",
    segmentName: "Medical clinics",
    verified: true,
  },
  {
    id: "lead-6",
    name: "Amara Okafor",
    role: "Head of spaces",
    company: "Foundry Shared Labs",
    segmentId: "seg-3",
    segmentName: "Coworking spaces",
    verified: true,
  },
  {
    id: "lead-7",
    name: "Tomás Morales",
    role: "Managing partner",
    company: "Morales & Sterling Legal",
    segmentId: "seg-4",
    segmentName: "Law firms",
    verified: true,
  },
  {
    id: "lead-8",
    name: "Kavita Patel",
    role: "General manager",
    company: "The SoCo House Austin",
    segmentId: "seg-5",
    segmentName: "Boutique hotels",
    verified: true,
  },
];

export const sampleEmailDrafts: Record<string, EmailDraft> = {
  "lead-1": {
    leadId: "lead-1",
    subject: "Janitorial coverage for Travis Tower common areas",
    body:
      "I noticed Travis Tower recently completed lobby renovations across both multi-tenant towers. Harbor & Pine provides dedicated commercial cleaning with certified crews stationed in downtown Austin. We maintain documented compliance checklists for every evening turnover. Would you be open to reviewing our 15-minute facility audit checklist this week?",
    evidence: [
      "Renovation announcement published on company news page last month",
      "Building profile indicates 140,000 sq ft of multi-tenant commercial space",
    ],
    senderLine:
      "[Sender name], [postal address]. Reply \"stop\" and we won't write again.",
  },
  "lead-2": {
    leadId: "lead-2",
    subject: "Terminal sanitization protocols at Barton Creek Medical",
    body:
      "I saw that Barton Creek Medical recently added three new surgical suites to your south wing. Our team at Harbor & Pine handles medical-grade terminal sanitization and daily green-cleaning across Austin clinics. We provide nightly digital sign-offs for all exam and procedure rooms. Could we schedule a 10-minute walkthrough on Thursday to inspect your current turnover schedule?",
    evidence: [
      "Clinic directory shows recent expansion of procedural suites",
      "Accreditation requirements published on clinic patient information page",
    ],
    senderLine:
      "[Sender name], [postal address]. Reply \"stop\" and we won't write again.",
  },
  "lead-3": {
    leadId: "lead-3",
    subject: "Daily turnover support for Atelier Workspaces",
    body:
      "I saw Atelier Workspaces expanded hot-desk hours to include weekend access for members. Harbor & Pine supports Austin shared spaces with flexible evening turnover and midday porter refreshes. We supply non-toxic products that keep open floor plans odor-free during business hours. Do you have five minutes Tuesday to compare our rates against your current cleaning contract?",
    evidence: [
      "Website announced 24/7 access rollout for Austin campus members",
      "Member handbook emphasizes eco-friendly facilities and non-toxic maintenance",
    ],
    senderLine:
      "[Sender name], [postal address]. Reply \"stop\" and we won't write again.",
  },
  "lead-4": {
    leadId: "lead-4",
    subject: "Evening porter service for Congress Plaza suites",
    body:
      "Congress Plaza continues to attract high-density engineering tenants along the corridor. Harbor & Pine provides dependable after-hours cleaning teams with strict background clearances and supervisory audits. We keep multi-floor properties spotless without disrupting overtime work schedules. Would you be open to a brief conversation about our Austin commercial rates next Tuesday?",
    evidence: [
      "Recent leasing announcements for two enterprise tech tenants",
      "Property specification notes LEED certification standards for vendors",
    ],
    senderLine:
      "[Sender name], [postal address]. Reply \"stop\" and we won't write again.",
  },
  "lead-5": {
    leadId: "lead-5",
    subject: "Exam room sanitization for Guadalupe Family Practice",
    body:
      "Guadalupe Family Practice serves a high volume of pediatric and family appointments each week. Harbor & Pine delivers hospital-grade sanitization protocols tailored to outpatient family medicine practices. We provide written cleaning logs after every nightly visit to simplify your audit compliance. Would you be open to reviewing our healthcare cleaning checklist this week?",
    evidence: [
      "Practice updates highlight extended urgent walk-in appointment hours",
      "Facility notes three separate treatment wings requiring partitioned care",
    ],
    senderLine:
      "[Sender name], [postal address]. Reply \"stop\" and we won't write again.",
  },
  "lead-6": {
    leadId: "lead-6",
    subject: "Cleanroom care and waste handling for Foundry Shared Labs",
    body:
      "Foundry Shared Labs accommodates sensitive bench equipment and shared research bays. Harbor & Pine deploys trained cleaners familiar with specialized lab hygiene and strict disposal procedures. We ensure communal workstations are thoroughly disinfected without disturbing delicate instrumentation. Would you have ten minutes Wednesday to discuss your lab maintenance requirements?",
    evidence: [
      "Site outlines strict bio-safety and chemical hygiene expectations for members",
      "Facility profile lists 24 shared wet-lab benches and clean stations",
    ],
    senderLine:
      "[Sender name], [postal address]. Reply \"stop\" and we won't write again.",
  },
  "lead-7": {
    leadId: "lead-7",
    subject: "Confidential office maintenance for Morales & Sterling",
    body:
      "Morales & Sterling handles high-stakes corporate litigation requiring strict evening confidentiality. Harbor & Pine assigns bonded and background-checked cleaning staff dedicated specifically to legal offices. We guarantee secure document custody and meticulous conference room turnover. Can we arrange a brief call on Friday to review our vetted staff guarantees?",
    evidence: [
      "Firm bio lists downtown Austin office with five formal client conference rooms",
      "Practice areas note sensitive intellectual property and corporate transactions",
    ],
    senderLine:
      "[Sender name], [postal address]. Reply \"stop\" and we won't write again.",
  },
  "lead-8": {
    leadId: "lead-8",
    subject: "Overnight public space cleaning for The SoCo House",
    body:
      "The SoCo House maintains a high standard of presentation across your restaurant and courtyard spaces. Harbor & Pine provides scheduled overnight cleaning so morning guests always arrive to pristine common areas. We specialize in polished concrete, natural wood finishes, and high-touch surface care. Would you be open to a quick call to discuss overnight support?",
    evidence: [
      "Hotel website showcases historic boutique property with ground-floor restaurant",
      "Guest reviews praise immaculate design aesthetic and courtyard seating",
    ],
    senderLine:
      "[Sender name], [postal address]. Reply \"stop\" and we won't write again.",
  },
};

// Data used for /_components gallery
export interface MetricItem {
  id: string;
  label: string;
  value: string;
  caption: string;
  trend: number[];
}

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface LeadItem {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  status: 'hot' | 'verified' | 'delivered' | 'paused' | 'bounced';
  matchScore: number;
  lastActivity: string;
}

export const mockMetrics: MetricItem[] = [
  {
    id: 'verified_leads',
    label: 'Verified leads',
    value: '1,428',
    caption: '+14% from last week (sample)',
    trend: [18, 22, 20, 26, 29, 34, 40, 48],
  },
  {
    id: 'delivery_rate',
    label: 'Delivery rate',
    value: '99.4%',
    caption: 'On schedule across mailboxes (sample)',
    trend: [97, 98, 97.5, 98.6, 99.1, 99.4],
  },
  {
    id: 'hot_leads',
    label: 'Hot leads',
    value: '46',
    caption: 'Replied within 2 hours (sample)',
    trend: [5, 9, 14, 22, 31, 38, 46],
  },
  {
    id: 'meetings_booked',
    label: 'Meetings booked',
    value: '19',
    caption: '7 confirmed this week (sample)',
    trend: [2, 4, 6, 9, 13, 16, 19],
  },
];

export const mockLeadTabs: TabItem[] = [
  { id: 'all', label: 'All leads', count: 1428 },
  { id: 'hot', label: 'Hot leads', count: 46 },
  { id: 'verified', label: 'Verified', count: 890 },
  { id: 'delivered', label: 'Delivered', count: 472 },
  { id: 'paused', label: 'Paused', count: 16 },
  { id: 'bounced', label: 'Bounced', count: 4 },
];

export const mockLeads: LeadItem[] = [
  {
    id: 'lead-01',
    name: 'Marcus Vance',
    title: 'Property operations lead',
    company: 'Travis Tower Management',
    email: 'm.vance@travistower.example',
    status: 'hot',
    matchScore: 91,
    lastActivity: 'Replied 14m ago',
  },
  {
    id: 'lead-02',
    name: 'Elena Rostova',
    title: 'Facilities director',
    company: 'Barton Creek Medical',
    email: 'elena.r@bartonmedical.example',
    status: 'delivered',
    matchScore: 84,
    lastActivity: 'Opened 1h ago',
  },
  {
    id: 'lead-03',
    name: 'Sarah Chen',
    title: 'Community general manager',
    company: 'Atelier Workspaces',
    email: 'sarah@atelierwork.example',
    status: 'verified',
    matchScore: 78,
    lastActivity: 'Scheduled for tomorrow',
  },
  {
    id: 'lead-04',
    name: 'Julian Hayes',
    title: 'Senior portfolio director',
    company: 'Congress Plaza Commercial',
    email: 'j.hayes@congressplaza.example',
    status: 'hot',
    matchScore: 91,
    lastActivity: 'Booked meeting for Thu',
  },
  {
    id: 'lead-05',
    name: 'Tomás Morales',
    title: 'Managing partner',
    company: 'Morales & Sterling Legal',
    email: 'tmorales@moraleslegal.example',
    status: 'delivered',
    matchScore: 71,
    lastActivity: 'Sent 3h ago',
  },
  {
    id: 'lead-06',
    name: 'David Lindholm',
    title: 'Clinical operations manager',
    company: 'Guadalupe Family Practice',
    email: 'david@guadalupefp.example',
    status: 'paused',
    matchScore: 84,
    lastActivity: 'Crawl completed',
  },
  {
    id: 'lead-07',
    name: 'Amara Okafor',
    title: 'Head of spaces',
    company: 'Foundry Shared Labs',
    email: 'amara@foundrylabs.example',
    status: 'bounced',
    matchScore: 78,
    lastActivity: 'Mailbox invalid',
  },
  {
    id: 'lead-08',
    name: 'Kavita Patel',
    title: 'General manager',
    company: 'The SoCo House Austin',
    email: 'kavita@socohouse.example',
    status: 'verified',
    matchScore: 66,
    lastActivity: 'Verified 4h ago',
  },
];

// Dashboard Types & Data
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

// 7-day range: Wed to Tue (Tue is today)
export const sampleDaily7d: DailyMetric[] = [
  { date: '2026-10-21', dayLabel: 'Wed', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-22', dayLabel: 'Thu', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-23', dayLabel: 'Fri', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-24', dayLabel: 'Sat', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-25', dayLabel: 'Sun', sent: 112, bounced: 2, interested: 1 },
  { date: '2026-10-26', dayLabel: 'Mon', sent: 236, bounced: 4, interested: 4 },
  { date: '2026-10-27', dayLabel: 'Tue', sent: 64, bounced: 2, interested: 1 },
];

// 30-day range: 23 prior days + the 7 days above
export const sampleDaily30d: DailyMetric[] = [
  { date: '2026-09-28', dayLabel: 'Mon', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-09-29', dayLabel: 'Tue', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-09-30', dayLabel: 'Wed', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-01', dayLabel: 'Thu', sent: 14, bounced: 0, interested: 0 },
  { date: '2026-10-02', dayLabel: 'Fri', sent: 28, bounced: 1, interested: 1 },
  { date: '2026-10-03', dayLabel: 'Sat', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-04', dayLabel: 'Sun', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-05', dayLabel: 'Mon', sent: 35, bounced: 1, interested: 0 },
  { date: '2026-10-06', dayLabel: 'Tue', sent: 42, bounced: 1, interested: 1 },
  { date: '2026-10-07', dayLabel: 'Wed', sent: 48, bounced: 1, interested: 1 },
  { date: '2026-10-08', dayLabel: 'Thu', sent: 50, bounced: 0, interested: 1 },
  { date: '2026-10-09', dayLabel: 'Fri', sent: 45, bounced: 2, interested: 0 },
  { date: '2026-10-10', dayLabel: 'Sat', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-11', dayLabel: 'Sun', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-12', dayLabel: 'Mon', sent: 60, bounced: 1, interested: 1 },
  { date: '2026-10-13', dayLabel: 'Tue', sent: 72, bounced: 2, interested: 1 },
  { date: '2026-10-14', dayLabel: 'Wed', sent: 68, bounced: 1, interested: 2 },
  { date: '2026-10-15', dayLabel: 'Thu', sent: 80, bounced: 2, interested: 1 },
  { date: '2026-10-16', dayLabel: 'Fri', sent: 75, bounced: 1, interested: 1 },
  { date: '2026-10-17', dayLabel: 'Sat', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-18', dayLabel: 'Sun', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-19', dayLabel: 'Mon', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-20', dayLabel: 'Tue', sent: 0, bounced: 0, interested: 0 },
  // Last 7 days
  { date: '2026-10-21', dayLabel: 'Wed', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-22', dayLabel: 'Thu', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-23', dayLabel: 'Fri', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-24', dayLabel: 'Sat', sent: 0, bounced: 0, interested: 0 },
  { date: '2026-10-25', dayLabel: 'Sun', sent: 112, bounced: 2, interested: 1 },
  { date: '2026-10-26', dayLabel: 'Mon', sent: 236, bounced: 4, interested: 4 },
  { date: '2026-10-27', dayLabel: 'Tue', sent: 64, bounced: 2, interested: 1 },
];

export const sampleCampaigns: CampaignItem[] = [
  {
    id: 'camp-1',
    name: 'Property managers',
    status: 'Scaling',
    sent: 148,
    replies: 11,
    interested: 3,
  },
  {
    id: 'camp-2',
    name: 'Medical clinics',
    status: 'Working',
    sent: 96,
    replies: 6,
    interested: 1,
  },
  {
    id: 'camp-3',
    name: 'Coworking spaces',
    status: 'Working',
    sent: 74,
    replies: 4,
    interested: 1,
  },
  {
    id: 'camp-4',
    name: 'Boutique hotels',
    status: 'Learning',
    sent: 42,
    replies: 5,
    interested: 1,
  },
  {
    id: 'camp-5',
    name: 'Law firms',
    status: 'Paused',
    sent: 52,
    replies: 2,
    interested: 0,
  },
];

export const sampleDashboardToday: DashboardToday = {
  sent: 64,
  queued: 80,
  repliesWaiting: 3,
  balance: 24.5,
  dailyBudget: 10,
};

export const sampleAgentActivity: AgentActivityItem[] = [
  {
    id: 'act-1',
    description: 'Paused Law firms. No interested replies after 50 emails.',
    timestamp: 'Today, 9:15 AM',
  },
  {
    id: 'act-2',
    description: "Gave Property managers a larger share of today's sends.",
    timestamp: 'Today, 8:00 AM',
  },
  {
    id: 'act-3',
    description: 'Added a second follow-up for Medical clinics.',
    timestamp: 'Yesterday, 4:30 PM',
  },
  {
    id: 'act-4',
    description: 'Removed 8 addresses that bounced.',
    timestamp: 'Yesterday, 2:10 PM',
  },
];

// Inbox & Sequences Interfaces
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

// 8 Sample Inbox Threads
export const sampleThreads: Thread[] = [
  {
    id: 'thread-1',
    leadName: 'Marcus Bellamy',
    leadRole: 'Facilities Director',
    leadCompany: 'Larkin Property Group',
    leadEmail: 'marcus.bellamy@larkinpg.example',
    segmentName: 'Property managers',
    campaignId: 'camp-1',
    campaignName: 'Property managers',
    intent: 'Interested',
    unread: true,
    status: 'needs_review',
    updatedAt: '12 min ago',
    snippet: 'Tuesday works. Send over a calendar link.',
    messages: [
      {
        id: 'msg-1-1',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: 'Yesterday, 9:00 AM',
        body: 'Hi Marcus,\n\nI noticed Larkin Property Group manages multi-tenant commercial office space across central Austin. Harbor & Pine provides dedicated evening janitorial crews with logged inspection checklists and consistent teams.\n\nWould you have 15 minutes this week to compare notes on turnover coverage and response times?',
      },
      {
        id: 'msg-1-2',
        sender: 'lead',
        senderName: 'Marcus Bellamy',
        senderEmail: 'marcus.bellamy@larkinpg.example',
        time: 'Today, 9:48 AM',
        body: 'Tuesday works. Send over a calendar link.',
      },
    ],
    draft: {
      id: 'draft-1',
      body: 'Hi Marcus,\n\nTuesday at 2:00 pm CDT works well on our end. You can grab a direct calendar invite here: [calendar booking link: https://cal.example/harborandpine].\n\nLooking forward to speaking with you.\n\nBest,\nHarbor & Pine',
      hasMissingFactMarker: false,
      factsUsed: [
        'Austin commercial janitorial services',
        'Evening crew turnover schedule',
        'Online booking link configured at https://cal.example/harborandpine',
      ],
    },
  },
  {
    id: 'thread-2',
    leadName: 'Dr. Elena Voss',
    leadRole: 'Practice Manager',
    leadCompany: 'Cedar Row Medical',
    leadEmail: 'elena.voss@cedarrowmed.example',
    segmentName: 'Medical clinics',
    campaignId: 'camp-2',
    campaignName: 'Medical clinics',
    intent: 'Question',
    unread: true,
    status: 'needs_review',
    updatedAt: '1 hr ago',
    snippet: 'Do you use hospital-grade disinfectant?',
    messages: [
      {
        id: 'msg-2-1',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: 'Yesterday, 10:15 AM',
        body: 'Hello Dr. Voss,\n\nOutpatient clinics in Austin often struggle with night crews that skip terminal sanitization logs. Harbor & Pine assigns certified healthcare janitorial teams with digital compliance records.\n\nCould I send our sanitization checklist for your review?',
      },
      {
        id: 'msg-2-2',
        sender: 'lead',
        senderName: 'Dr. Elena Voss',
        senderEmail: 'elena.voss@cedarrowmed.example',
        time: 'Today, 8:52 AM',
        body: 'Do you use hospital-grade disinfectant? We have specific EPA criteria for our procedural suites.',
      },
    ],
    draft: {
      id: 'draft-2',
      body: 'Hi Dr. Voss,\n\nYes, our medical sanitization crews use EPA-registered hospital-grade solutions ([confirm products]) with documented contact times for all high-touch and clinical procedural suites.\n\nWould you like me to send over our product data sheets and verification log template?\n\nBest,\nHarbor & Pine',
      hasMissingFactMarker: true,
      missingFactNotice: {
        warning: 'Disinfectant details are missing from your business profile.',
        linkText: 'business profile',
        linkHref: '/app/profile',
      },
      factsUsed: [
        'Austin outpatient sanitization protocols',
        'Documented compliance cleaning logs',
      ],
    },
  },
  {
    id: 'thread-3',
    leadName: 'Tomas Rieck',
    leadRole: 'Operations Lead',
    leadCompany: 'Northbank Coworking',
    leadEmail: 'tomas.rieck@northbankcowork.example',
    segmentName: 'Coworking spaces',
    campaignId: 'camp-3',
    campaignName: 'Coworking spaces',
    intent: 'Not now',
    unread: true,
    status: 'needs_review',
    updatedAt: '3 hr ago',
    snippet: 'Not ready until our lease renewal in January. Ping us then.',
    messages: [
      {
        id: 'msg-3-1',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: '2 days ago, 11:00 AM',
        body: 'Hi Tomas,\n\nManaging shared desk turnover and event spaces requires nimble cleaning support. Harbor & Pine provides flexible commercial porter and evening janitorial support in Austin.\n\nOpen to reviewing our scope?',
      },
      {
        id: 'msg-3-2',
        sender: 'lead',
        senderName: 'Tomas Rieck',
        senderEmail: 'tomas.rieck@northbankcowork.example',
        time: 'Today, 6:45 AM',
        body: 'Not ready until our lease renewal in January. Ping us then.',
      },
    ],
    draft: {
      id: 'draft-3',
      body: 'Hi Tomas,\n\nUnderstood. I will set a reminder to touch base in early January right before your renewal window.\n\nHave a great rest of the quarter.\n\nBest,\nHarbor & Pine',
      hasMissingFactMarker: false,
      factsUsed: [
        'Flexible daily turnover protocols',
        'Re-contact date: January 12, 2027',
      ],
    },
  },
  {
    id: 'thread-4',
    leadName: 'Hannah Ostrow',
    leadRole: 'Office Manager',
    leadCompany: 'Pinecrest Law',
    leadEmail: 'hannah.ostrow@pinecrestlaw.example',
    segmentName: 'Law firms',
    campaignId: 'camp-5',
    campaignName: 'Law firms',
    intent: 'Not a fit',
    unread: false,
    status: 'handled',
    updatedAt: 'Yesterday',
    snippet: 'We have an in-house team.',
    messages: [
      {
        id: 'msg-4-1',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: '3 days ago, 2:00 PM',
        body: 'Hi Hannah,\n\nLegal offices require vetted, background-checked crews who respect confidential files. Harbor & Pine provides bonded evening cleaning for Austin practices.\n\nWould you be open to an audit?',
      },
      {
        id: 'msg-4-2',
        sender: 'lead',
        senderName: 'Hannah Ostrow',
        senderEmail: 'hannah.ostrow@pinecrestlaw.example',
        time: 'Yesterday, 1:15 PM',
        body: 'We have an in-house team.',
      },
      {
        id: 'msg-4-3',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: 'Yesterday, 1:20 PM',
        body: 'Understood, thanks for letting us know Hannah. We have updated our records accordingly.',
      },
    ],
    handledNotice: 'We have an in-house team. Archived.',
  },
  {
    id: 'thread-5',
    leadName: 'Ravi Menon',
    leadRole: 'General Manager',
    leadCompany: 'Willow Court Hotel',
    leadEmail: 'ravi.menon@willowcourthotel.example',
    segmentName: 'Boutique hotels',
    campaignId: 'camp-4',
    campaignName: 'Boutique hotels',
    intent: 'Out of office',
    unread: false,
    status: 'handled',
    updatedAt: 'Yesterday',
    snippet: 'Out of office until Nov 4.',
    messages: [
      {
        id: 'msg-5-1',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: '2 days ago, 10:00 AM',
        body: 'Hi Ravi,\n\nBoutique hospitality spaces require seamless overnight common area maintenance. Harbor & Pine provides supplemental overnight crews in Austin.\n\nWould a quick overview be helpful?',
      },
      {
        id: 'msg-5-2',
        sender: 'lead',
        senderName: 'Ravi Menon',
        senderEmail: 'ravi.menon@willowcourthotel.example',
        time: 'Yesterday, 10:02 AM',
        body: 'Auto-reply: I am out of the office attending our regional conference until Monday, November 4. For urgent issues please reach reception.',
      },
    ],
    handledNotice: 'Out of the office until November 4. Auto-paused sequence until Nov 4.',
  },
  {
    id: 'thread-6',
    leadName: 'Carla Dunmore',
    leadRole: 'Practice Owner',
    leadCompany: 'Ashgrove Dental',
    leadEmail: 'carla.dunmore@ashgrovedental.example',
    segmentName: 'Medical clinics',
    campaignId: 'camp-2',
    campaignName: 'Medical clinics',
    intent: 'Opted out',
    unread: false,
    status: 'handled',
    updatedAt: '2 days ago',
    snippet: 'Stop.',
    messages: [
      {
        id: 'msg-6-1',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: '3 days ago, 9:30 AM',
        body: 'Hello Carla,\n\nOutpatient dental practices require strict compliance and infection control. Harbor & Pine specializes in medical office janitorial in Austin.\n\nWould you be open to a 10-minute introduction?',
      },
      {
        id: 'msg-6-2',
        sender: 'lead',
        senderName: 'Carla Dunmore',
        senderEmail: 'carla.dunmore@ashgrovedental.example',
        time: '2 days ago, 11:14 AM',
        body: 'Stop.',
      },
    ],
    handledNotice: 'Stop. Added to suppression list.',
  },
  {
    id: 'thread-7',
    leadName: 'Jonas Pell',
    leadRole: 'Building Manager',
    leadCompany: 'Westfield Offices',
    leadEmail: 'jonas.pell@westfieldoffices.example',
    segmentName: 'Property managers',
    campaignId: 'camp-1',
    campaignName: 'Property managers',
    intent: 'Interested',
    unread: false,
    status: 'handled',
    updatedAt: '2 days ago',
    snippet: 'Booking link sent; Meeting booked: Thursday 10:30 am.',
    messages: [
      {
        id: 'msg-7-1',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: '4 days ago, 1:00 PM',
        body: 'Hi Jonas,\n\nManaging multiple office suites in Austin requires dependable nightly turnover. Harbor & Pine supplies dedicated crews with digital punch-lists.\n\nWould you have 15 minutes this week?',
      },
      {
        id: 'msg-7-2',
        sender: 'lead',
        senderName: 'Jonas Pell',
        senderEmail: 'jonas.pell@westfieldoffices.example',
        time: '3 days ago, 4:20 PM',
        body: 'Sounds relevant. How is your pricing structured for 45k sq ft?',
      },
      {
        id: 'msg-7-3',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: '3 days ago, 4:25 PM',
        body: 'Hi Jonas,\n\nFor 45k sq ft we typically provide custom scope tiers based on weekly frequency. You can pick a quick 15-minute briefing slot here: https://cal.example/harborandpine\n\nLooking forward to speaking.',
      },
      {
        id: 'msg-7-4',
        sender: 'lead',
        senderName: 'Jonas Pell',
        senderEmail: 'jonas.pell@westfieldoffices.example',
        time: '2 days ago, 9:10 AM',
        body: 'Booked for Thursday morning. Talk then.',
      },
    ],
    handledNotice: 'Booking link sent; Meeting booked: Thursday 10:30 am.',
  },
  {
    id: 'thread-8',
    leadName: 'Mei Okafor',
    leadRole: 'Regional Manager',
    leadCompany: 'Hollis Park Apartments',
    leadEmail: 'mei.okafor@hollisparkapts.example',
    segmentName: 'Property managers',
    campaignId: 'camp-1',
    campaignName: 'Property managers',
    intent: 'Question',
    unread: false,
    status: 'handled',
    updatedAt: '3 days ago',
    snippet: 'Inquired about multi-building rates. Booking link sent.',
    messages: [
      {
        id: 'msg-8-1',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: '5 days ago, 11:30 AM',
        body: 'Hi Mei,\n\nMulti-building residential clubhouse and common area upkeep can be challenging with inconsistent contractors. Harbor & Pine provides dedicated Austin janitorial crews.\n\nCould we share our turnover checklist?',
      },
      {
        id: 'msg-8-2',
        sender: 'lead',
        senderName: 'Mei Okafor',
        senderEmail: 'mei.okafor@hollisparkapts.example',
        time: '4 days ago, 2:15 PM',
        body: 'Do you service both clubhouses and fitness centers across 3 separate properties?',
      },
      {
        id: 'msg-8-3',
        sender: 'agent',
        senderName: 'Alex Rivera (Harbor & Pine)',
        senderEmail: 'alex@harborandpine.example',
        time: '4 days ago, 2:20 PM',
        body: 'Hi Mei,\n\nYes, we service combined clubhouse, fitness center, and leasing office portfolios across Austin. Here is our calendar link if you would like to review portfolio rates: https://cal.example/harborandpine',
      },
    ],
    handledNotice: 'Inquired about multi-building rates. Booking link sent.',
  },
];

// Campaign Details Map
export const sampleCampaignDetails: Record<string, CampaignDetail> = {
  'camp-1': {
    id: 'camp-1',
    name: 'Property managers',
    status: 'Scaling',
    sent: 148,
    replies: 11,
    interested: 3,
    description: 'Reaching Austin commercial property directors and asset managers overseeing multi-tenant office parks.',
    deliveryRate: 98.6,
    replyRate: 7.4,
    sequenceSteps: [
      {
        step: 1,
        dayLabel: 'Day 0',
        title: 'Initial outreach',
        subject: 'Janitorial turnover coverage for {{company}}',
        snippet: 'Noticed your team manages Class A commercial square footage across central Austin...',
        body: 'Hi {{name}},\n\nI noticed {{company}} manages commercial office space across central Austin. Harbor & Pine provides dedicated evening janitorial crews with logged inspection checklists and reliable turnover teams.\n\nWould you have 15 minutes this week to compare notes on your turnover coverage and response times?\n\nBest,\nAlex Rivera',
        sent: 80,
        replies: 7,
        interested: 2,
      },
      {
        step: 2,
        dayLabel: 'Day 3',
        title: 'Quick follow-up',
        subject: 'Re: Janitorial turnover coverage for {{company}}',
        snippet: 'Following up on my note earlier this week regarding evening crew turnover schedules...',
        body: 'Hi {{name}},\n\nFollowing up briefly on my note from Tuesday. Most property managers we speak with in Austin tell us their biggest headache is night crews cutting corners on high-traffic common areas.\n\nHere is our 15-minute facility audit checklist if you would like to take a look.\n\nBest,\nAlex',
        sent: 44,
        replies: 3,
        interested: 1,
      },
      {
        step: 3,
        dayLabel: 'Day 7',
        title: 'Final check-in',
        subject: 'Closing the loop on janitorial support',
        snippet: 'Assuming you have reliable evening coverage in place right now, but wanted to check one last time...',
        body: 'Hi {{name}},\n\nAssuming your current turnover team has things covered, so I will not follow up again. If your needs change before the next quarter, we are always glad to connect.\n\nBest,\nAlex',
        sent: 24,
        replies: 1,
        interested: 0,
      },
    ],
    leads: [
      {
        id: 'clead-1',
        name: 'Marcus Bellamy',
        role: 'Facilities Director',
        company: 'Larkin Property Group',
        email: 'marcus.bellamy@larkinpg.example',
        step: 'Step 2',
        status: 'Replied',
      },
      {
        id: 'clead-2',
        name: 'Julian Hayes',
        role: 'Senior Portfolio Director',
        company: 'Congress Plaza Commercial',
        email: 'julian.hayes@congressplaza.example',
        step: 'Step 1',
        status: 'Sent',
      },
      {
        id: 'clead-3',
        name: 'Claire Henderson',
        role: 'VP Operations',
        company: 'North Austin Medical Tower',
        email: 'claire.h@northaustintower.example',
        step: 'Step 3',
        status: 'Sent',
      },
      {
        id: 'clead-4',
        name: 'David Sterling',
        role: 'Asset Manager',
        company: 'River City Commercial',
        email: 'david.s@rivercitycomm.example',
        step: 'Step 1',
        status: 'Queued',
      },
      {
        id: 'clead-5',
        name: 'Alicia Morales',
        role: 'Property Administrator',
        company: 'Zilker Tech Center',
        email: 'alicia.m@zilkertech.example',
        step: 'Step 1',
        status: 'Replied',
      },
      {
        id: 'clead-6',
        name: 'Todd Finch',
        role: 'Facilities Supervisor',
        company: 'Arboretum Square',
        email: 'todd.finch@arboretumsquare.example',
        step: 'Step 1',
        status: 'Bounced',
      },
    ],
    recentChanges: [
      {
        id: 'cact-1',
        description: "Gave Property managers a larger share of today's sends.",
        timestamp: 'Today, 8:00 AM',
      },
      {
        id: 'cact-2',
        description: 'Adjusted Day 3 follow-up angle toward evening turnover checklist.',
        timestamp: '2 days ago, 11:20 AM',
      },
    ],
    settings: {
      audience: 'Property managers and facilities directors in Austin, TX',
      dailyLimit: 35,
      schedule: 'Mon–Fri, 8:00 AM – 5:00 PM CDT',
      mailbox: 'alex@harborandpine.example',
    },
    sparklines: {
      sent: [0, 0, 0, 0, 40, 78, 30],
      delivered: [0, 0, 0, 0, 39, 77, 30],
      replies: [0, 0, 0, 0, 2, 6, 3],
      interested: [0, 0, 0, 0, 1, 1, 1],
    },
  },
  'camp-2': {
    id: 'camp-2',
    name: 'Medical clinics',
    status: 'Working',
    sent: 96,
    replies: 6,
    interested: 1,
    description: 'Outpatient surgical, dental, and specialty medical suites requiring terminal sanitization logs.',
    deliveryRate: 97.9,
    replyRate: 6.3,
    sequenceSteps: [
      {
        step: 1,
        dayLabel: 'Day 0',
        title: 'Initial outreach',
        subject: 'Medical clinic sanitization logs for {{company}}',
        snippet: 'Healthcare facilities require strict regulatory compliance...',
        body: 'Hello {{name}},\n\nOutpatient clinics in Austin often struggle with night crews that skip terminal sanitization logs. Harbor & Pine assigns certified healthcare janitorial teams with digital compliance records.\n\nCould I send our sanitization checklist for your review?\n\nBest,\nAlex Rivera',
        sent: 52,
        replies: 4,
        interested: 1,
      },
      {
        step: 2,
        dayLabel: 'Day 3',
        title: 'Follow-up',
        subject: 'Re: Medical clinic sanitization logs for {{company}}',
        snippet: 'Touching base regarding procedural suite cleanliness...',
        body: 'Hello {{name}},\n\nFollowing up on my previous note regarding terminal sanitization logs for healthcare facilities in Austin.\n\nBest,\nAlex',
        sent: 28,
        replies: 1,
        interested: 0,
      },
      {
        step: 3,
        dayLabel: 'Day 7',
        title: 'Final follow-up',
        subject: 'Sanitization verification for {{company}}',
        snippet: 'Final check on whether you need supplemental medical cleaning...',
        body: 'Hello {{name}},\n\nWanted to check one final time if your practice requires verified medical cleaning support.\n\nBest,\nAlex',
        sent: 16,
        replies: 1,
        interested: 0,
      },
    ],
    leads: [
      {
        id: 'clead-2-1',
        name: 'Dr. Elena Voss',
        role: 'Practice Manager',
        company: 'Cedar Row Medical',
        email: 'elena.voss@cedarrowmed.example',
        step: 'Step 1',
        status: 'Replied',
      },
      {
        id: 'clead-2-2',
        name: 'Dr. Carla Dunmore',
        role: 'Practice Owner',
        company: 'Ashgrove Dental',
        email: 'carla.dunmore@ashgrovedental.example',
        step: 'Step 1',
        status: 'Replied',
      },
      {
        id: 'clead-2-3',
        name: 'Martin Kelly',
        role: 'Clinical Operations Director',
        company: 'Austin Spine and Ortho',
        email: 'martin.k@austinspine.example',
        step: 'Step 2',
        status: 'Sent',
      },
      {
        id: 'clead-2-4',
        name: 'Patricia Vance',
        role: 'Facility Lead',
        company: 'Shoal Creek Wellness',
        email: 'pvance@shoalcreekwell.example',
        step: 'Step 1',
        status: 'Queued',
      },
      {
        id: 'clead-2-5',
        name: 'Siddharth Rao',
        role: 'Administrator',
        company: 'Capital Eye Clinic',
        email: 'srao@capitaleye.example',
        step: 'Step 3',
        status: 'Sent',
      },
      {
        id: 'clead-2-6',
        name: 'Linda Garza',
        role: 'Office Coordinator',
        company: 'Central Texas Allergy',
        email: 'lgarza@ctxallergy.example',
        step: 'Step 1',
        status: 'Bounced',
      },
    ],
    recentChanges: [
      {
        id: 'cact-2-1',
        description: 'Added a second follow-up for Medical clinics.',
        timestamp: 'Yesterday, 4:30 PM',
      },
    ],
    settings: {
      audience: 'Practice managers and medical administrators in Austin, TX',
      dailyLimit: 25,
      schedule: 'Mon–Fri, 8:00 AM – 5:00 PM CDT',
      mailbox: 'alex@harborandpine.example',
    },
    sparklines: {
      sent: [0, 0, 0, 0, 24, 52, 20],
      delivered: [0, 0, 0, 0, 23, 51, 20],
      replies: [0, 0, 0, 0, 1, 3, 2],
      interested: [0, 0, 0, 0, 0, 1, 0],
    },
  },
  'camp-3': {
    id: 'camp-3',
    name: 'Coworking spaces',
    status: 'Working',
    sent: 74,
    replies: 4,
    interested: 1,
    description: 'Shared workspaces, flexible office hubs, and incubator facilities with heavy daytime traffic.',
    deliveryRate: 98.6,
    replyRate: 5.4,
    sequenceSteps: [
      {
        step: 1,
        dayLabel: 'Day 0',
        title: 'Initial outreach',
        subject: 'Day porter & evening janitorial for {{company}}',
        snippet: 'Managing high member foot-traffic and event turnover...',
        body: 'Hi {{name}},\n\nManaging shared desk turnover and event spaces requires nimble cleaning support. Harbor & Pine provides flexible commercial porter and evening janitorial support in Austin.\n\nOpen to reviewing our scope?\n\nBest,\nAlex Rivera',
        sent: 42,
        replies: 2,
        interested: 1,
      },
      {
        step: 2,
        dayLabel: 'Day 3',
        title: 'Follow-up',
        subject: 'Re: Day porter & evening janitorial for {{company}}',
        snippet: 'Checking back on flexible member cleaning schedules...',
        body: 'Hi {{name}},\n\nWanted to follow up on my note regarding flexible commercial porter coverage for your spaces in Austin.\n\nBest,\nAlex',
        sent: 22,
        replies: 1,
        interested: 0,
      },
      {
        step: 3,
        dayLabel: 'Day 7',
        title: 'Final check-in',
        subject: 'Touchpoint regarding coworking cleaning',
        snippet: 'Closing out note for {{company}}...',
        body: 'Hi {{name}},\n\nWill close out my notes here in case you are fully set with your existing crew. Cheers,\nAlex',
        sent: 10,
        replies: 1,
        interested: 0,
      },
    ],
    leads: [
      {
        id: 'clead-3-1',
        name: 'Tomas Rieck',
        role: 'Operations Lead',
        company: 'Northbank Coworking',
        email: 'tomas.rieck@northbankcowork.example',
        step: 'Step 1',
        status: 'Replied',
      },
      {
        id: 'clead-3-2',
        name: 'Sarah Chen',
        role: 'Community GM',
        company: 'Atelier Workspaces',
        email: 'sarah.c@atelierwork.example',
        step: 'Step 2',
        status: 'Sent',
      },
      {
        id: 'clead-3-3',
        name: 'Derek Woods',
        role: 'Site Director',
        company: 'Foundry Collective',
        email: 'derek@foundrycollective.example',
        step: 'Step 1',
        status: 'Sent',
      },
      {
        id: 'clead-3-4',
        name: 'Maya Lin',
        role: 'Member Experience Lead',
        company: 'Studio Hive East',
        email: 'maya@studiohive.example',
        step: 'Step 1',
        status: 'Queued',
      },
      {
        id: 'clead-3-5',
        name: 'Evan Ross',
        role: 'General Manager',
        company: 'The Hive Austin',
        email: 'evan@thehiveatx.example',
        step: 'Step 3',
        status: 'Sent',
      },
      {
        id: 'clead-3-6',
        name: 'Chris Taylor',
        role: 'Facilities Manager',
        company: 'Common Desk South',
        email: 'chris.t@commondesk.example',
        step: 'Step 1',
        status: 'Bounced',
      },
    ],
    recentChanges: [],
    settings: {
      audience: 'Community managers and operations leads in Austin, TX',
      dailyLimit: 20,
      schedule: 'Mon–Fri, 8:00 AM – 5:00 PM CDT',
      mailbox: 'alex@harborandpine.example',
    },
    sparklines: {
      sent: [0, 0, 0, 0, 20, 40, 14],
      delivered: [0, 0, 0, 0, 20, 39, 14],
      replies: [0, 0, 0, 0, 1, 2, 1],
      interested: [0, 0, 0, 0, 0, 1, 0],
    },
  },
  'camp-4': {
    id: 'camp-4',
    name: 'Boutique hotels',
    status: 'Learning',
    sent: 42,
    replies: 5,
    interested: 1,
    description: 'Independent hotels and boutique hospitality properties in downtown and South Congress.',
    deliveryRate: 97.6,
    replyRate: 11.9,
    sequenceSteps: [
      {
        step: 1,
        dayLabel: 'Day 0',
        title: 'Initial outreach',
        subject: 'Overnight common area support for {{company}}',
        snippet: 'Hospitality spaces require spotless presentation...',
        body: 'Hi {{name}},\n\nBoutique hospitality spaces require seamless overnight common area maintenance. Harbor & Pine provides supplemental overnight crews in Austin.\n\nWould a quick overview be helpful?\n\nBest,\nAlex Rivera',
        sent: 26,
        replies: 3,
        interested: 1,
      },
      {
        step: 2,
        dayLabel: 'Day 3',
        title: 'Follow-up',
        subject: 'Re: Overnight common area support for {{company}}',
        snippet: 'Checking back on lobby and lounge night janitorial...',
        body: 'Hi {{name}},\n\nFollowing up to see if your team needs extra hands for late-night lobby and restaurant turnover.\n\nBest,\nAlex',
        sent: 16,
        replies: 2,
        interested: 0,
      },
    ],
    leads: [
      {
        id: 'clead-4-1',
        name: 'Ravi Menon',
        role: 'General Manager',
        company: 'Willow Court Hotel',
        email: 'ravi.menon@willowcourthotel.example',
        step: 'Step 1',
        status: 'Replied',
      },
      {
        id: 'clead-4-2',
        name: 'Greta Shaw',
        role: 'Operations Director',
        company: 'The South Lamar Inn',
        email: 'greta@southlamarinn.example',
        step: 'Step 2',
        status: 'Sent',
      },
      {
        id: 'clead-4-3',
        name: 'Owen Bradley',
        role: 'Property Host',
        company: 'Rainey House Suites',
        email: 'owen@raineyhouse.example',
        step: 'Step 1',
        status: 'Sent',
      },
      {
        id: 'clead-4-4',
        name: 'Nora Diaz',
        role: 'Rooms Division Manager',
        company: 'Guadalupe Boutique Hotel',
        email: 'nora@guadalupehotel.example',
        step: 'Step 1',
        status: 'Queued',
      },
      {
        id: 'clead-4-5',
        name: 'Leo Campbell',
        role: 'General Manager',
        company: 'Eastside Courtyard Stays',
        email: 'leo@eastsidecourtyard.example',
        step: 'Step 2',
        status: 'Replied',
      },
      {
        id: 'clead-4-6',
        name: 'Kylie Ward',
        role: 'Hospitality Director',
        company: 'Travis Heights Lodge',
        email: 'kylie@travisheightslodge.example',
        step: 'Step 1',
        status: 'Bounced',
      },
    ],
    recentChanges: [],
    settings: {
      audience: 'General managers and hospitality operations directors in Austin, TX',
      dailyLimit: 15,
      schedule: 'Mon–Fri, 8:00 AM – 5:00 PM CDT',
      mailbox: 'alex@harborandpine.example',
    },
    sparklines: {
      sent: [0, 0, 0, 0, 14, 28, 0],
      delivered: [0, 0, 0, 0, 13, 28, 0],
      replies: [0, 0, 0, 0, 1, 4, 0],
      interested: [0, 0, 0, 0, 0, 1, 0],
    },
  },
  'camp-5': {
    id: 'camp-5',
    name: 'Law firms',
    status: 'Paused',
    sent: 52,
    replies: 2,
    interested: 0,
    description: 'Mid-sized law firms and legal partnerships in Austin requiring confidential after-hours cleaning.',
    deliveryRate: 98.1,
    replyRate: 3.8,
    sequenceSteps: [
      {
        step: 1,
        dayLabel: 'Day 0',
        title: 'Initial outreach',
        subject: 'Confidential evening office cleaning for {{company}}',
        snippet: 'Legal practices require background-checked night teams...',
        body: 'Hi {{name}},\n\nLegal offices require vetted, background-checked crews who respect confidential files. Harbor & Pine provides bonded evening cleaning for Austin practices.\n\nWould you be open to an audit?\n\nBest,\nAlex Rivera',
        sent: 32,
        replies: 1,
        interested: 0,
      },
      {
        step: 2,
        dayLabel: 'Day 3',
        title: 'Follow-up',
        subject: 'Re: Confidential evening office cleaning for {{company}}',
        snippet: 'Checking back on bonded evening coverage...',
        body: 'Hi {{name}},\n\nFollowing up to see if your firm has dedicated evening janitorial support in place.\n\nBest,\nAlex',
        sent: 20,
        replies: 1,
        interested: 0,
      },
    ],
    leads: [
      {
        id: 'clead-5-1',
        name: 'Hannah Ostrow',
        role: 'Office Manager',
        company: 'Pinecrest Law',
        email: 'hannah.ostrow@pinecrestlaw.example',
        step: 'Step 1',
        status: 'Replied',
      },
      {
        id: 'clead-5-2',
        name: 'Arthur Vance',
        role: 'Managing Partner',
        company: 'Vance & Sterling LLP',
        email: 'avance@vancesterling.example',
        step: 'Step 2',
        status: 'Sent',
      },
      {
        id: 'clead-5-3',
        name: 'Rachel Klein',
        role: 'Firm Administrator',
        company: 'Barton Springs Legal',
        email: 'rachel@bartonspringslegal.example',
        step: 'Step 1',
        status: 'Sent',
      },
      {
        id: 'clead-5-4',
        name: 'Samuel Bishop',
        role: 'Operations Partner',
        company: 'Bishop & Hughes Law',
        email: 'sbishop@bishophughes.example',
        step: 'Step 1',
        status: 'Queued',
      },
      {
        id: 'clead-5-5',
        name: 'Diane Thorne',
        role: 'Office Director',
        company: 'Thorne Litigation Group',
        email: 'diane@thornelitigation.example',
        step: 'Step 2',
        status: 'Sent',
      },
      {
        id: 'clead-5-6',
        name: 'Warren Scott',
        role: 'Practice Manager',
        company: 'Capitol Legal Associates',
        email: 'wscott@capitollegal.example',
        step: 'Step 1',
        status: 'Bounced',
      },
    ],
    recentChanges: [
      {
        id: 'cact-5-1',
        description: 'Paused Law firms. No interested replies after 50 emails.',
        timestamp: 'Today, 9:15 AM',
      },
    ],
    settings: {
      audience: 'Office managers and managing partners in Austin, TX',
      dailyLimit: 15,
      schedule: 'Mon–Fri, 8:00 AM – 5:00 PM CDT',
      mailbox: 'alex@harborandpine.example',
    },
    sparklines: {
      sent: [0, 0, 0, 0, 14, 38, 0],
      delivered: [0, 0, 0, 0, 13, 38, 0],
      replies: [0, 0, 0, 0, 1, 1, 0],
      interested: [0, 0, 0, 0, 0, 0, 0],
    },
  },
};

