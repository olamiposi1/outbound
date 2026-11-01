import {
  SiteAnalysis,
  Segment,
  Lead,
  EmailDraft,
  sampleSegments,
  sampleLeads,
  sampleEmailDrafts,
  DashboardData,
  CampaignItem,
  CampaignStatus,
  sampleDaily7d,
  sampleDaily30d,
  sampleCampaigns,
  sampleDashboardToday,
  Thread,
  ReplyMode,
  CampaignDetail,
  sampleThreads,
  sampleCampaignDetails,
} from '../mock/data';
import { supabase } from '../lib/supabase';

const SIMULATED_DELAY_MS = 250;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Analyzes a website through the smooth-function Edge Function.
 * Competitors are not available yet, so that list is empty for now.
 */
export async function analyzeSite(url: string): Promise<SiteAnalysis> {
  const fallback = 'Could not analyze that website. Please try again.';

  const { data, error } = await supabase.functions.invoke('smooth-function', {
    body: { url },
  });

  if (error) {
    let message = fallback;
    try {
      const body = await error.context.json();
      if (body?.error) message = body.error;
    } catch {
      // keep the fallback message
    }
    throw new Error(message);
  }

  if (!data?.ok || !data.analysis) {
    throw new Error(data?.error ?? fallback);
  }

  const a = data.analysis;
  return {
    url: new URL(data.url).hostname.replace(/^www\./, ''),
    description: `${a.summary} ${a.offering}`.trim(),
    targetAudiences: a.idealBuyers,
    competitors: [],
  };
}
/**
 * Retrieves the evaluated buyer segments with fit scores and lead estimates.
 * // TODO(backend): Call backend ICP segmentation and scoring endpoint (e.g. GET /api/segments).
 */
export async function getSegments(): Promise<Segment[]> {
  await sleep(SIMULATED_DELAY_MS);
  return [...sampleSegments];
}

/**
 * Retrieves verified leads filtered by selected segment IDs.
 * // TODO(backend): Call backend lead discovery and verification service (e.g. POST /api/leads/search).
 */
export async function getLeads(segmentIds?: string[]): Promise<Lead[]> {
  await sleep(SIMULATED_DELAY_MS);
  if (!segmentIds || segmentIds.length === 0) {
    return [...sampleLeads];
  }
  return sampleLeads.filter((lead) => segmentIds.includes(lead.segmentId));
}

/**
 * Retrieves a personalized cold email draft and site evidence for a specific lead.
 * // TODO(backend): Call backend email generation engine with research context (e.g. GET /api/leads/:id/draft).
 */
export async function getEmailDraft(leadId: string): Promise<EmailDraft | null> {
  await sleep(SIMULATED_DELAY_MS);
  const draft = sampleEmailDrafts[leadId];
  if (draft) {
    return { ...draft };
  }

  // Fallback draft for any lead not explicitly keyed in sampleEmailDrafts
  const lead = sampleLeads.find((l) => l.id === leadId);
  return {
    leadId,
    subject: `Janitorial and sanitization schedule for ${lead ? lead.company : 'your facility'}`,
    body: `I noticed your team manages facility operations and tenant experience in Austin. Harbor & Pine provides certified commercial cleaning with dedicated evening crews and documented logs. We keep multi-tenant and clinical spaces compliant and spotless. Would you be open to reviewing our 15-minute facility audit checklist this week?`,
    evidence: [
      'Facility profile confirms multi-tenant commercial operations in Austin',
      'Recent operational updates indicate evening turnover requirements',
    ],
    senderLine: '[Sender name], [postal address]. Reply "stop" and we won\'t write again.',
  };
}

// In-memory state for interactive mutations
let currentDailyBudget = sampleDashboardToday.dailyBudget;
let campaignsStore: CampaignItem[] = sampleCampaigns.map((c) => ({ ...c }));
let campaignDetailsStore: Record<string, CampaignDetail> = JSON.parse(
  JSON.stringify(sampleCampaignDetails)
);
let threadsStore: Thread[] = JSON.parse(JSON.stringify(sampleThreads));
let currentReplyMode: ReplyMode = 'review';

/**
 * Retrieves the dashboard overview metrics, daily series, and campaigns.
 * // TODO(backend): Call backend analytics endpoint for date-ranged performance metrics (e.g. GET /api/dashboard?range=7d).
 */
export async function getDashboard(range: '7d' | '30d'): Promise<DashboardData> {
  await sleep(SIMULATED_DELAY_MS);
  const daily = range === '7d' ? [...sampleDaily7d] : [...sampleDaily30d];
  return {
    range,
    daily,
    today: {
      ...sampleDashboardToday,
      dailyBudget: currentDailyBudget,
      repliesWaiting: threadsStore.filter((t) => t.status === 'needs_review').length,
    },
    campaigns: campaignsStore.map((c) => ({ ...c })),
  };
}

/**
 * Updates the daily sending budget cap.
 * // TODO(backend): Call backend budget management endpoint (e.g. PATCH /api/settings/budget).
 */
export async function setDailyBudget(amount: number): Promise<void> {
  await sleep(SIMULATED_DELAY_MS);
  currentDailyBudget = amount;
}

/**
 * Toggles a campaign status between Paused and its previous active state.
 * // TODO(backend): Call backend campaign state management endpoint (e.g. POST /api/campaigns/:id/toggle).
 */
export async function toggleCampaign(id: string): Promise<CampaignItem> {
  await sleep(SIMULATED_DELAY_MS);
  const index = campaignsStore.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Campaign with id ${id} not found`);
  }
  const item = campaignsStore[index];
  const newStatus: CampaignStatus = item.status === 'Paused' ? 'Working' : 'Paused';
  const updated: CampaignItem = {
    ...item,
    status: newStatus,
  };
  campaignsStore[index] = updated;

  // Also sync detail store if present
  if (campaignDetailsStore[id]) {
    campaignDetailsStore[id].status = newStatus;
  }

  return { ...updated };
}

/**
 * Retrieves inbox threads filtered by tab category with current counts and reply mode.
 * // TODO(backend): Call backend inbox thread retrieval endpoint (e.g. GET /api/inbox?filter=needs_you).
 */
export async function getInbox(
  filter: 'needs_you' | 'handled' | 'all' = 'needs_you'
): Promise<{
  threads: Thread[];
  counts: { needsYou: number; handled: number; all: number };
  replyMode: ReplyMode;
}> {
  await sleep(SIMULATED_DELAY_MS);

  const needsYouCount = threadsStore.filter((t) => t.status === 'needs_review').length;
  const handledCount = threadsStore.filter((t) => t.status === 'handled').length;
  const allCount = threadsStore.length;

  let filtered = [...threadsStore];
  if (filter === 'needs_you') {
    filtered = filtered.filter((t) => t.status === 'needs_review');
  } else if (filter === 'handled') {
    filtered = filtered.filter((t) => t.status === 'handled');
  }

  return {
    threads: filtered.map((t) => ({ ...t })),
    counts: {
      needsYou: needsYouCount,
      handled: handledCount,
      all: allCount,
    },
    replyMode: currentReplyMode,
  };
}

/**
 * Retrieves a single thread by id, marking it as read.
 * // TODO(backend): Call backend thread detail endpoint (e.g. GET /api/inbox/threads/:id).
 */
export async function getThread(id: string): Promise<Thread | null> {
  await sleep(SIMULATED_DELAY_MS);
  const index = threadsStore.findIndex((t) => t.id === id);
  if (index === -1) return null;

  // Mark as read when opened
  threadsStore[index] = {
    ...threadsStore[index],
    unread: false,
  };

  return { ...threadsStore[index] };
}

/**
 * Approves and sends an agent response draft, appending it to the thread messages and marking as handled.
 * // TODO(backend): Call backend email dispatch service to send the approved reply (e.g. POST /api/inbox/threads/:id/approve).
 */
export async function approveDraft(id: string, text: string): Promise<Thread> {
  await sleep(SIMULATED_DELAY_MS);
  const index = threadsStore.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Thread with id ${id} not found`);
  }

  const thread = threadsStore[index];
  const newMsgId = `msg-${id}-${Date.now()}`;
  const newMessage = {
    id: newMsgId,
    sender: 'agent' as const,
    senderName: 'Alex Rivera (Harbor & Pine)',
    senderEmail: 'alex@harborandpine.example',
    time: 'Just now',
    body: text,
  };

  const updatedThread: Thread = {
    ...thread,
    messages: [...thread.messages, newMessage],
    draft: null,
    status: 'handled',
    unread: false,
    updatedAt: 'Just now',
    handledNotice: 'Draft approved and sent.',
  };

  threadsStore[index] = updatedThread;
  return { ...updatedThread };
}

/**
 * Discards a pending draft for a thread.
 * // TODO(backend): Call backend draft removal endpoint (e.g. DELETE /api/inbox/threads/:id/draft).
 */
export async function discardDraft(id: string): Promise<Thread> {
  await sleep(SIMULATED_DELAY_MS);
  const index = threadsStore.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Thread with id ${id} not found`);
  }

  const thread = threadsStore[index];
  const updatedThread: Thread = {
    ...thread,
    draft: null,
    status: 'handled',
    handledNotice: 'Draft discarded.',
  };

  threadsStore[index] = updatedThread;
  return { ...updatedThread };
}

/**
 * Sets the reply autonomy mode between 'review' and 'auto'.
 * // TODO(backend): Call backend agent autonomy configuration endpoint (e.g. PUT /api/settings/reply-mode).
 */
export async function setReplyMode(mode: ReplyMode): Promise<ReplyMode> {
  await sleep(SIMULATED_DELAY_MS);
  currentReplyMode = mode;
  return currentReplyMode;
}

/**
 * Retrieves all active and paused campaigns list.
 * // TODO(backend): Call backend campaigns list endpoint (e.g. GET /api/campaigns).
 */
export async function getCampaigns(): Promise<CampaignItem[]> {
  await sleep(SIMULATED_DELAY_MS);
  return campaignsStore.map((c) => ({ ...c }));
}

/**
 * Retrieves campaign detail by id including sequence steps, reached leads, changes, and settings.
 * // TODO(backend): Call backend campaign detail endpoint (e.g. GET /api/campaigns/:id).
 */
export async function getCampaign(id: string): Promise<CampaignDetail | null> {
  await sleep(SIMULATED_DELAY_MS);
  const detail = campaignDetailsStore[id];
  if (!detail) {
    // If not found in details map, check if present in campaignsStore
    const item = campaignsStore.find((c) => c.id === id);
    if (!item) return null;
    return {
      ...item,
      description: `Targeting prospective buyers for ${item.name}.`,
      deliveryRate: 98.0,
      replyRate: item.sent > 0 ? (item.replies / item.sent) * 100 : 0,
      sequenceSteps: [],
      leads: [],
      recentChanges: [],
      settings: {
        audience: `${item.name} in Austin, TX`,
        dailyLimit: 25,
        schedule: 'Mon–Fri, 8:00 AM – 5:00 PM CDT',
        mailbox: 'alex@harborandpine.example',
      },
      sparklines: {
        sent: [0, 0, 0, 0, 20, 40, item.sent % 30],
        delivered: [0, 0, 0, 0, 19, 39, item.sent % 30],
        replies: [0, 0, 0, 0, 1, 2, item.replies % 5],
        interested: [0, 0, 0, 0, 0, 1, item.interested],
      },
    };
  }

  // Ensure current status from campaignsStore is synced
  const currentItem = campaignsStore.find((c) => c.id === id);
  return {
    ...detail,
    status: currentItem ? currentItem.status : detail.status,
  };
}

