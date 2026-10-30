import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { usePageMeta } from '../utils/usePageMeta';
import {
  getInbox,
  getThread,
  approveDraft,
  discardDraft,
  setReplyMode,
} from '../services/api';
import { Thread, ReplyMode, Intent } from '../mock/data';
import { Badge, BadgeVariant } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  Send,
  Trash2,
  ExternalLink,
  Info,
} from 'lucide-react';

export function InboxPage() {
  usePageMeta('Inbox', 'Review agent drafts and manage buyer replies');
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stateQuery = searchParams.get('state');

  // Filter tab: 'needs_you' | 'handled' | 'all'
  const [activeTab, setActiveTab] = useState<'needs_you' | 'handled' | 'all'>('needs_you');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [counts, setCounts] = useState({ needsYou: 3, handled: 5, all: 8 });
  const [replyModeState, setReplyModeState] = useState<ReplyMode>('review');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Editable draft text
  const [draftBody, setDraftBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref to move focus to thread H1 on selection
  const threadHeadingRef = useRef<HTMLHeadingElement>(null);

  // Load threads list
  const loadInboxData = () => {
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
    getInbox(activeTab)
      .then((res) => {
        if (stateQuery === 'empty') {
          setThreads([]);
          setCounts({ needsYou: 0, handled: 0, all: 0 });
          setSelectedThread(null);
        } else {
          setThreads(res.threads);
          setCounts(res.counts);
          setReplyModeState(res.replyMode);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInboxData();
  }, [activeTab, stateQuery]);

  // Load or sync selected thread
  useEffect(() => {
    if (stateQuery === 'empty' || stateQuery === 'error') {
      setSelectedThread(null);
      return;
    }

    if (threadId) {
      getThread(threadId).then((th) => {
        if (th) {
          setSelectedThread(th);
          setDraftBody(th.draft ? th.draft.body : '');
          // Remove unread dot from local thread list
          setThreads((prev) =>
            prev.map((item) => (item.id === th.id ? { ...item, unread: false } : item))
          );
        } else {
          setSelectedThread(null);
        }
      });
    } else {
      // On desktop, auto-select first thread if available
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
      if (isDesktop && threads.length > 0) {
        navigate(`/app/inbox/${threads[0].id}`, { replace: true });
      } else {
        setSelectedThread(null);
      }
    }
  }, [threadId, threads.length, stateQuery]);

  // Focus thread H1 when selectedThread changes
  useEffect(() => {
    if (selectedThread && threadHeadingRef.current) {
      threadHeadingRef.current.focus();
    }
  }, [selectedThread?.id]);

  // Check if draft contains [confirm ...] marker
  const hasConfirmMarker = useMemo(() => {
    return /\[confirm\s+[^\]]+\]/i.test(draftBody);
  }, [draftBody]);

  // Intent badge mapping
  const getIntentBadgeVariant = (intent: Intent): { variant: BadgeVariant; label: string } => {
    switch (intent) {
      case 'Interested':
        return { variant: 'success', label: 'Interested' };
      case 'Question':
        return { variant: 'primary', label: 'Question' };
      case 'Not now':
        return { variant: 'warm', label: 'Not now' };
      case 'Not a fit':
        return { variant: 'neutral', label: 'Not a fit' };
      case 'Out of office':
        return { variant: 'neutral', label: 'Out of office' };
      case 'Opted out':
        return { variant: 'neutral', label: 'Opted out' };
      default:
        return { variant: 'neutral', label: intent };
    }
  };

  // Reply mode toggle handler
  const handleReplyModeChange = async (newMode: ReplyMode) => {
    setReplyModeState(newMode);
    try {
      await setReplyMode(newMode);
      setLiveAnnouncement(
        newMode === 'review'
          ? 'Reply mode set to review drafts before sending.'
          : 'Reply mode set to send automatically on high confidence.'
      );
    } catch {
      // Revert if error
    }
  };

  // Approve and send draft handler
  const handleApproveDraft = async () => {
    if (!selectedThread || hasConfirmMarker || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await approveDraft(selectedThread.id, draftBody);
      setSelectedThread(updated);
      setLiveAnnouncement(`Draft approved and sent to ${selectedThread.leadName}.`);
      // Refresh list counts
      const res = await getInbox(activeTab);
      setThreads(res.threads);
      setCounts(res.counts);
    } catch {
      setLiveAnnouncement('Failed to send reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Discard draft handler
  const handleDiscardDraft = async () => {
    if (!selectedThread || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await discardDraft(selectedThread.id);
      setSelectedThread(updated);
      setLiveAnnouncement(`Draft discarded for ${selectedThread.leadName}.`);
      // Refresh list counts
      const res = await getInbox(activeTab);
      setThreads(res.threads);
      setCounts(res.counts);
    } catch {
      setLiveAnnouncement('Failed to discard draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error review state
  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyState
          title="Could not load inbox."
          description="There was a connection issue while fetching conversations. Please try again."
          action={{
            label: 'Try again',
            onClick: loadInboxData,
          }}
        />
      </div>
    );
  }

  // Loading review state
  if (loading && threads.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-40 bg-surface-muted rounded-[6px]" />
        <div className="h-10 w-full max-w-md bg-surface-muted rounded-[8px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[480px]">
          <div className="bg-surface border border-border rounded-[12px] p-4 flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface-muted rounded-[8px]" />
            ))}
          </div>
          <div className="lg:col-span-2 bg-surface border border-border rounded-[12px] p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Screen reader live announcements */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* Main Inbox Container */}
      <div className="flex-1 flex flex-col lg:flex-row h-full border-b border-border bg-bg">
        {/* LEFT PANE: Thread List (360px on lg, hidden on mobile if thread open) */}
        <div
          className={`${
            threadId ? 'hidden lg:flex' : 'flex'
          } w-full lg:w-[360px] lg:shrink-0 flex-col bg-surface border-r border-border min-h-screen lg:min-h-0 lg:h-[calc(100vh-57px)]`}
        >
          {/* List Top Bar: Title & Reply Mode Switcher */}
          <div className="p-4 border-b border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-[18px] font-semibold text-ink tracking-tight">Inbox</h1>

              {/* Reply Mode Segmented Control */}
              <div
                role="radiogroup"
                aria-label="Agent reply mode"
                className="inline-flex p-0.5 rounded-[8px] bg-surface-muted border border-border text-[12px]"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={replyModeState === 'review'}
                  onClick={() => handleReplyModeChange('review')}
                  className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    replyModeState === 'review'
                      ? 'bg-surface text-ink border border-border/80 shadow-xs'
                      : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  Review drafts
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={replyModeState === 'auto'}
                  onClick={() => handleReplyModeChange('auto')}
                  className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    replyModeState === 'auto'
                      ? 'bg-surface text-ink border border-border/80 shadow-xs'
                      : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  Auto-send
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div
              role="tablist"
              aria-label="Filter threads by review status"
              className="flex items-center gap-1 border-b border-border/80 pb-2 -mb-2"
            >
              <button
                role="tab"
                aria-selected={activeTab === 'needs_you'}
                onClick={() => setActiveTab('needs_you')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  activeTab === 'needs_you'
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-ink-2 hover:text-ink hover:bg-surface-muted'
                }`}
              >
                <span>Needs you</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-[999px] font-normal tabular-nums ${
                    activeTab === 'needs_you'
                      ? 'bg-primary text-surface'
                      : 'bg-surface-muted text-ink-3 border border-border'
                  }`}
                >
                  {counts.needsYou}
                </span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'handled'}
                onClick={() => setActiveTab('handled')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  activeTab === 'handled'
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-ink-2 hover:text-ink hover:bg-surface-muted'
                }`}
              >
                <span>Handled</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-[999px] bg-surface-muted text-ink-3 border border-border font-normal tabular-nums">
                  {counts.handled}
                </span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  activeTab === 'all'
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-ink-2 hover:text-ink hover:bg-surface-muted'
                }`}
              >
                <span>All</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-[999px] bg-surface-muted text-ink-3 border border-border font-normal tabular-nums">
                  {counts.all}
                </span>
              </button>
            </div>
          </div>

          {/* Threads List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {threads.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-ink-3">
                <p className="text-[14px] text-ink-2">No threads in this view.</p>
                <p className="text-[12px] leading-relaxed">
                  {activeTab === 'needs_you'
                    ? 'All incoming replies have been reviewed.'
                    : 'New inbound messages will appear here.'}
                </p>
              </div>
            ) : (
              threads.map((item) => {
                const isSelected = selectedThread?.id === item.id;
                const badge = getIntentBadgeVariant(item.intent);

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/app/inbox/${item.id}`)}
                    className={`w-full text-left p-4 flex flex-col gap-1.5 transition-colors duration-150 ease select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isSelected
                        ? 'bg-primary-soft/90 border-l-[3px] border-l-primary'
                        : 'hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* 6px Unread dot in --primary */}
                        {item.unread && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
                            aria-label="Unread message"
                          />
                        )}
                        <span
                          className={`text-[14px] truncate ${
                            item.unread ? 'font-semibold text-ink' : 'font-medium text-ink'
                          }`}
                        >
                          {item.leadName}
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-3 whitespace-nowrap shrink-0">
                        {item.updatedAt}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] text-ink-2 truncate">
                        {item.leadCompany}
                      </span>
                      <Badge variant={badge.variant} className="shrink-0 text-[11px]">
                        {badge.label}
                      </Badge>
                    </div>

                    <p className="text-[12px] text-ink-2 line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Thread Detail */}
        <div
          className={`${
            threadId ? 'flex' : 'hidden lg:flex'
          } flex-1 flex-col bg-bg overflow-y-auto lg:h-[calc(100vh-57px)]`}
        >
          {selectedThread ? (
            <div className="max-w-3xl w-full mx-auto p-4 lg:p-8 flex flex-col gap-6">
              {/* Back to inbox button (Mobile only below 1024px) */}
              <div className="lg:hidden">
                <Button
                  variant="secondary"
                  size="default"
                  onClick={() => navigate('/app/inbox')}
                  icon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}
                  className="text-[13px]"
                >
                  Back to inbox
                </Button>
              </div>

              {/* Thread Header Card */}
              <Card variant="default" className="p-5 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex flex-col gap-0.5">
                    <h1
                      ref={threadHeadingRef}
                      tabIndex={-1}
                      className="text-[20px] font-semibold text-ink tracking-tight focus:outline-none"
                    >
                      {selectedThread.leadName}
                    </h1>
                    <span className="text-[13px] text-ink-2">
                      {selectedThread.leadRole} at {selectedThread.leadCompany}
                    </span>
                    <span className="text-[12px] text-ink-3">
                      {selectedThread.leadEmail}
                    </span>
                  </div>

                  <div className="flex flex-wrap sm:flex-col sm:items-end gap-2">
                    <Badge variant={getIntentBadgeVariant(selectedThread.intent).variant}>
                      {getIntentBadgeVariant(selectedThread.intent).label}
                    </Badge>
                    <Link
                      to={`/app/campaigns/${selectedThread.campaignId}`}
                      className="text-[12px] text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      {selectedThread.campaignName} campaign
                    </Link>
                  </div>
                </div>

                {/* Sub-bar with status and timestamps */}
                <div className="flex items-center justify-between text-[12px] text-ink-3 pt-1">
                  <span>
                    Status:{' '}
                    <strong className="text-ink font-medium">
                      {selectedThread.status === 'needs_review' ? 'Needs you' : 'Handled'}
                    </strong>
                  </span>
                  <span>Last activity {selectedThread.updatedAt}</span>
                </div>
              </Card>

              {/* Message History Sequence */}
              <div className="flex flex-col gap-3" aria-label="Conversation history">
                <h2 className="text-[14px] font-semibold text-ink">Messages</h2>

                {selectedThread.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-[12px] border p-4 flex flex-col gap-2 ${
                        isAgent
                          ? 'bg-surface border-border ml-0 sm:ml-4'
                          : 'bg-surface-muted/60 border-border mr-0 sm:mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                        <span className="text-[13px] font-medium text-ink">
                          {msg.senderName}
                        </span>
                        <span className="text-[11px] text-ink-3">{msg.time}</span>
                      </div>
                      <p className="text-[13px] text-ink whitespace-pre-line leading-relaxed">
                        {msg.body}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Draft Area for "Needs review" threads */}
              {selectedThread.draft && (
                <Card variant="default" className="p-5 flex flex-col gap-4 border-primary/40 bg-surface">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-ink">
                        Agent draft response
                      </span>
                      <Badge variant="primary">Draft</Badge>
                    </div>
                    <span className="text-[12px] text-ink-3">
                      Ready for review
                    </span>
                  </div>

                  {/* Missing Fact Warning Alert if present */}
                  {selectedThread.draft.missingFactNotice && (
                    <div className="rounded-[8px] bg-warm-soft border border-warm/40 p-3.5 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-warm shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="flex flex-col gap-1 text-[13px] text-ink">
                        <span className="font-medium text-ink">
                          {selectedThread.draft.missingFactNotice.warning}
                        </span>
                        <span className="text-[12px] text-ink-2">
                          Please update your{' '}
                          <Link
                            to={selectedThread.draft.missingFactNotice.linkHref}
                            className="text-primary underline hover:text-primary-hover font-medium"
                          >
                            {selectedThread.draft.missingFactNotice.linkText}
                          </Link>{' '}
                          or edit the draft below to replace the marker before sending.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Editable Draft Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="draft-textarea"
                      className="text-[12px] font-medium text-ink-2"
                    >
                      Draft response message
                    </label>
                    <textarea
                      id="draft-textarea"
                      rows={6}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="w-full rounded-[8px] border border-border bg-surface p-3 text-[13px] text-ink leading-relaxed font-normal focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                      placeholder="Type your response or edit the agent's draft..."
                    />
                    {hasConfirmMarker && (
                      <p className="text-[12px] text-warm font-medium flex items-center gap-1.5 pt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>
                          Approve and send is disabled while the draft contains [confirm ...]
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Facts Used List */}
                  {selectedThread.draft.factsUsed && selectedThread.draft.factsUsed.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-border">
                      <span className="text-[12px] font-medium text-ink-2">
                        Facts used in this draft
                      </span>
                      <ul className="flex flex-col gap-1.5">
                        {selectedThread.draft.factsUsed.map((fact, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-[12px] text-ink-2"
                          >
                            <Check className="w-3.5 h-3.5 text-success shrink-0" strokeWidth={1.5} />
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-3 border-t border-border gap-3">
                    <Button
                      variant="ghost"
                      onClick={handleDiscardDraft}
                      disabled={isSubmitting}
                      icon={<Trash2 className="w-4 h-4" strokeWidth={1.5} />}
                      className="w-full sm:w-auto text-ink-2 hover:text-ink text-[13px]"
                    >
                      Discard draft
                    </Button>

                    <Button
                      variant="primary"
                      onClick={handleApproveDraft}
                      disabled={hasConfirmMarker || isSubmitting}
                      icon={<Send className="w-4 h-4" strokeWidth={1.5} />}
                      className="w-full sm:w-auto text-[13px]"
                    >
                      {isSubmitting ? 'Sending...' : 'Approve and send'}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Handled Notice Banner if already handled */}
              {selectedThread.status === 'handled' && selectedThread.handledNotice && (
                <div className="rounded-[10px] bg-surface border border-border p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-success-soft flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-success" strokeWidth={1.5} />
                    </span>
                    <div className="flex flex-col text-[13px]">
                      <span className="font-medium text-ink">Handled by agent</span>
                      <span className="text-ink-2">{selectedThread.handledNotice}</span>
                    </div>
                  </div>
                  <Badge variant="neutral">Archived</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-ink-3">
              <p className="text-[14px] text-ink-2 font-medium">No thread selected</p>
              <p className="text-[12px] max-w-sm mt-1 leading-relaxed">
                Choose a conversation from the left pane to view message history, research facts, and approve replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
