import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { brand } from '../config/brand';
import { usePageMeta } from '../utils/usePageMeta';
import { useFlow } from '../context/FlowContext';
   import { useAuth } from '../context/AuthContext';
   import { saveBusiness } from '../services/businesses';
import { analyzeSite, getSegments, getLeads, getEmailDraft } from '../services/api';
import { Segment, Lead, EmailDraft } from '../mock/data';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import {
  Check,
  X,
  Plus,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Mail,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

export function StartFlowPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const flow = useFlow();
     const { user } = useAuth();

  // Read current step from URL (?step=1..4), defaults to 1
  const stepParam = parseInt(searchParams.get('step') || '1', 10);
  const currentStep = Math.min(4, Math.max(1, isNaN(stepParam) ? 1 : stepParam));

  usePageMeta(
    `Step ${currentStep} of 4`,
    `Onboarding setup for ${brand.name} autonomous sales agent.`
  );

  const setStep = (step: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('step', String(step));
    setSearchParams(nextParams);
  };

  // Step 1 state
  const [siteUrl, setSiteUrl] = useState(
    searchParams.get('url') || flow.url || 'harborandpine.example'
  );
  const [urlError, setUrlError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<number>(0); // 0 = idle, 1 = reading, 2 = competitors, 3 = scoring, 4 = done

  // Step 2 state
  const [newAudience, setNewAudience] = useState('');
  const [newCompName, setNewCompName] = useState('');
  const [newCompDomain, setNewCompDomain] = useState('');
  const [showAddComp, setShowAddComp] = useState(false);
   const [savingBusiness, setSavingBusiness] = useState(false);
   const [saveError, setSaveError] = useState('');
  // Step 3 state
  const [segmentsList, setSegmentsList] = useState<Segment[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(false);
    const [segmentsError, setSegmentsError] = useState('');

  // Step 4 state
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadDraft, setLeadDraft] = useState<EmailDraft | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // Drawer accessibility refs
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeDrawerBtnRef = useRef<HTMLButtonElement>(null);

  // Sync initial URL param if present
  useEffect(() => {
    const queryUrl = searchParams.get('url');
    if (queryUrl && !flow.url) {
      flow.setUrl(queryUrl);
      setSiteUrl(queryUrl);
    }
  }, [searchParams, flow]);

    // Load segments when entering step 3
  useEffect(() => {
    if (currentStep !== 3) return;
    if (!flow.analysis) {
      setSegmentsList([]);
      return;
    }

    let cancelled = false;
    setLoadingSegments(true);
    setSegmentsError('');

    getSegments(flow.analysis)
      .then((data) => {
        if (!cancelled) setSegmentsList(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setSegmentsList([]);
          setSegmentsError(
            err instanceof Error
              ? err.message
              : 'Could not build buyer segments. Please try again.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSegments(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentStep]);

    // Load leads when entering step 4
  useEffect(() => {
    if (currentStep !== 4) return;

    let cancelled = false;
    setLoadingLeads(true);
    setLeadsError('');

    getLeads()
      .then((leadsData) => {
        if (!cancelled) flow.setLeads(leadsData);
      })
      .catch(() => {
        if (!cancelled) {
          flow.setLeads([]);
          setLeadsError('We could not load your leads. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLeads(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentStep]);

  // Load draft when lead is selected in drawer
  useEffect(() => {
    if (selectedLead) {
      setLoadingDraft(true);
      getEmailDraft(selectedLead.id).then((draft) => {
        setLeadDraft(draft);
        setLoadingDraft(false);
      });
    } else {
      setLeadDraft(null);
    }
  }, [selectedLead]);

  // Focus trap for drawer
  useEffect(() => {
    if (selectedLead) {
      closeDrawerBtnRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseDrawer();
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
  }, [selectedLead]);

  const handleOpenDrawer = (lead: Lead, targetEl: HTMLElement) => {
    lastActiveElementRef.current = targetEl;
    setSelectedLead(lead);
  };

  const handleCloseDrawer = () => {
    setSelectedLead(null);
    setTimeout(() => {
      lastActiveElementRef.current?.focus();
    }, 50);
  };

  // Step 1: Submit site URL
    const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = siteUrl.trim();
    if (!clean) {
      setUrlError('Enter a website like yourcompany.com');
      return;
    }

    // Basic domain validation
    const domainRegex = /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/.*)?$/;
    if (!domainRegex.test(clean) && !clean.includes('.')) {
      setUrlError('Enter a website like yourcompany.com');
      return;
    }

    setUrlError('');
    setIsAnalyzing(true);
    setLoadingStage(1);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const stageDuration = prefersReducedMotion ? 200 : 750;

    // The stage lines are just animation while the real analysis runs
    const timer1 = setTimeout(() => setLoadingStage(2), stageDuration);
    const timer2 = setTimeout(() => setLoadingStage(3), stageDuration * 2);

    try {
      const analysisData = await analyzeSite(clean);
      flow.setUrl(clean);
      flow.setAnalysis(analysisData);
      setLoadingStage(0);
      setIsAnalyzing(false);
      setStep(2);
    } catch (err) {
      setUrlError(
        err instanceof Error
          ? err.message
          : 'Could not analyze that website. Please try again.'
      );
      setLoadingStage(0);
      setIsAnalyzing(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };

  // Step 2 handlers
  const handleAddAudience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudience.trim() || !flow.analysis) return;
    const updated = [...flow.analysis.targetAudiences, newAudience.trim()];
    flow.updateAnalysis({ targetAudiences: updated });
    setNewAudience('');
  };

  const handleRemoveAudience = (index: number) => {
    if (!flow.analysis) return;
    const updated = flow.analysis.targetAudiences.filter((_, i) => i !== index);
    flow.updateAnalysis({ targetAudiences: updated });
  };

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim() || !newCompDomain.trim() || !flow.analysis) return;
    const newComp = {
      id: `comp-${Date.now()}`,
      name: newCompName.trim(),
      domain: newCompDomain.trim().replace(/^https?:\/\//i, ''),
    };
    flow.updateAnalysis({
      competitors: [...flow.analysis.competitors, newComp],
    });
    setNewCompName('');
    setNewCompDomain('');
    setShowAddComp(false);
  };

  const handleRemoveCompetitor = (id: string) => {
    if (!flow.analysis) return;
    const updated = flow.analysis.competitors.filter((c) => c.id !== id);
    flow.updateAnalysis({ competitors: updated });
  };
     const handleContinueFromStep2 = async () => {
     setSaveError('');
     if (user && flow.analysis) {
       setSavingBusiness(true);
       try {
         await saveBusiness(flow.analysis.url, flow.analysis.description);
       } catch {
         setSaveError("We couldn't save your business. Check your connection and try again.");
         setSavingBusiness(false);
         return;
       }
       setSavingBusiness(false);
     }
     setStep(3);
   };

  // Step 3 handlers
  const handleToggleSegment = (id: string) => {
    if (flow.selectedSegmentIds.includes(id)) {
      flow.setSelectedSegmentIds(flow.selectedSegmentIds.filter((sId) => sId !== id));
    } else {
      flow.setSelectedSegmentIds([...flow.selectedSegmentIds, id]);
    }
  };

  const handleSelectAllSegments = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      flow.setSelectedSegmentIds(segmentsList.map((s) => s.id));
    } else {
      flow.setSelectedSegmentIds([]);
    }
  };

  const isAllSegmentsSelected =
    segmentsList.length > 0 &&
    flow.selectedSegmentIds.length === segmentsList.length;

  const stepsList = [
    { number: 1, label: 'Paste your website' },
    { number: 2, label: 'What we learned' },
    { number: 3, label: 'Who we contact' },
    { number: 4, label: 'Your first leads' },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink text-left flex flex-col selection:bg-primary-soft selection:text-primary">
      {/* Skip link */}
      <a
        href="#flow-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:p-2 focus:bg-surface focus:border focus:border-border rounded-[8px]"
      >
        Skip to main setup
      </a>

      {/* Minimal Top Bar */}
      <header className="sticky top-0 z-20 w-full bg-surface border-b border-border">
        <div className="max-w-[1120px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <Link
            to="/"
            className="text-[18px] font-semibold text-ink tracking-tight hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px]"
          >
            {brand.name}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="text-[14px] text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px] px-1.5 py-0.5"
            >
              See a sample dashboard
            </Link>
            <Link
              to="/"
              className="text-[14px] text-ink-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px] px-1.5 py-0.5"
            >
              Exit
            </Link>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="max-w-[1120px] mx-auto px-6 py-3 border-t border-border/60">
          {/* Desktop Stepper */}
          <nav aria-label="Setup progress" className="hidden sm:flex items-center justify-between">
            {stepsList.map((st) => {
              const isCurrent = currentStep === st.number;
              const isCompleted = currentStep > st.number;

              return (
                <div
                  key={st.number}
                  className={`flex items-center gap-2 text-[14px] font-medium transition-colors duration-150 ease ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                      ? 'text-ink'
                      : 'text-ink-3'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium tabular-nums ${
                      isCompleted
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-surface-muted border border-border text-ink-3'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : st.number}
                  </span>
                  <span>{st.label}</span>
                </div>
              );
            })}
          </nav>

          {/* Mobile Stepper */}
          <div className="sm:hidden flex items-center justify-between text-[14px]">
            <span className="font-medium text-ink">
              Step {currentStep} of 4: {stepsList[currentStep - 1]?.label}
            </span>
            <span className="text-[12px] text-ink-3 tabular-nums">
              {Math.round((currentStep / 4) * 100)}% complete
            </span>
          </div>
        </div>
      </header>

      {/* Main Flow Content */}
      <main id="flow-main" className="flex-1 w-full max-w-[1120px] mx-auto px-6 py-8 md:py-12">
        {/* ================= STEP 1: Paste Your Website ================= */}
        {currentStep === 1 && (
          <div className="max-w-xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-semibold text-ink tracking-tight">
                Paste your website
              </h1>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                The agent will crawl your public pages, discover what you offer, analyze local competitors, and evaluate potential buyer segments.
              </p>
            </div>

            {!isAnalyzing ? (
              <form onSubmit={handleSiteSubmit} className="flex flex-col gap-4">
                <Input
                  label="Business website"
                  placeholder="yourcompany.com"
                  value={siteUrl}
                  onChange={(e) => {
                    setSiteUrl(e.target.value);
                    if (urlError) setUrlError('');
                  }}
                  errorMessage={urlError}
                  inputSize="hero"
                  helperText="Enter a domain with or without https://"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSiteUrl('harborandpine.example');
                      setUrlError('');
                    }}
                    className="text-[13px] text-primary hover:underline cursor-pointer"
                  >
                    Use the sample site
                  </button>
                  <Button type="submit" variant="primary" size="hero">
                    Analyze site
                  </Button>
                </div>
              </form>
            ) : (
              /* Loading Panel with 3 Stages */
              <div
                className="rounded-[12px] border border-border bg-surface p-6 flex flex-col gap-4 text-left"
                role="status"
                aria-live="polite"
              >
                <span className="text-[14px] font-medium text-ink">
                  Analyzing {siteUrl}...
                </span>

                <div className="flex flex-col gap-3 pt-2">
                  {/* Line 1 */}
                  <div className="flex items-center gap-3 text-[14px]">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {loadingStage > 1 ? (
                        <Check className="w-4 h-4 text-success" strokeWidth={2} />
                      ) : (
                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    <span
                      className={
                        loadingStage >= 1
                          ? 'font-medium text-ink'
                          : 'text-ink-3'
                      }
                    >
                      Reading the website
                    </span>
                  </div>

                  {/* Line 2 */}
                  <div className="flex items-center gap-3 text-[14px]">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {loadingStage > 2 ? (
                        <Check className="w-4 h-4 text-success" strokeWidth={2} />
                      ) : loadingStage === 2 ? (
                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-border" />
                      )}
                    </div>
                    <span
                      className={
                        loadingStage >= 2
                          ? 'font-medium text-ink'
                          : 'text-ink-3'
                      }
                    >
                      Looking at competitors
                    </span>
                  </div>

                  {/* Line 3 */}
                  <div className="flex items-center gap-3 text-[14px]">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {loadingStage > 3 ? (
                        <Check className="w-4 h-4 text-success" strokeWidth={2} />
                      ) : loadingStage === 3 ? (
                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-border" />
                      )}
                    </div>
                    <span
                      className={
                        loadingStage >= 3
                          ? 'font-medium text-ink'
                          : 'text-ink-3'
                      }
                    >
                      Scoring buyer segments
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 2: What We Learned ================= */}
        {currentStep === 2 && flow.analysis && (
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-semibold text-ink tracking-tight">
                Here's what we learned
              </h1>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                Review and refine our findings from {flow.analysis.url}. You can modify descriptions, customer types, and competitors at any time.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Card 1: What you sell (editable text) */}
              <div className="rounded-[12px] border border-border bg-surface p-5 flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between">
                  <label htmlFor="edit-what-you-sell" className="text-[16px] font-semibold text-ink">
                    What you sell
                  </label>
                  <span className="text-[12px] text-ink-3">Editable summary</span>
                </div>
                <textarea
                  id="edit-what-you-sell"
                  rows={3}
                  value={flow.analysis.description}
                  onChange={(e) =>
                    flow.updateAnalysis({ description: e.target.value })
                  }
                  className="w-full rounded-[8px] border border-border hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none p-3 text-[14px] text-ink leading-relaxed transition-colors duration-150 ease"
                />
              </div>

              {/* Card 2: Who buys from you today (editable chips) */}
              <div className="rounded-[12px] border border-border bg-surface p-5 flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-semibold text-ink">
                    Who buys from you today
                  </span>
                  <span className="text-[12px] text-ink-3">Target buyer roles</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {flow.analysis.targetAudiences.map((audience, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[999px] bg-surface-muted border border-border text-[13px] text-ink font-medium select-none"
                    >
                      <span>{audience}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAudience(idx)}
                        className="text-ink-3 hover:text-danger p-0.5 rounded-[4px] cursor-pointer"
                        aria-label={`Remove ${audience}`}
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddAudience} className="flex items-center gap-2 pt-2">
                  <div className="flex-1 max-w-xs">
                    <Input
                      placeholder="Add another buyer type..."
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                      aria-label="Add buyer category"
                    />
                  </div>
                  <Button type="submit" variant="secondary" icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}>
                    Add
                  </Button>
                </form>
              </div>

              {/* Card 3: Competitors */}
              <div className="rounded-[12px] border border-border bg-surface p-5 flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-semibold text-ink">
                    Competitors
                  </span>
                  <span className="text-[12px] text-ink-3">
                    Fictional Austin alternatives
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-border border border-border rounded-[8px] overflow-hidden">
                  {flow.analysis.competitors.map((comp) => (
                    <div
                      key={comp.id}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-surface-muted/50 transition-colors duration-150 ease"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-medium text-ink">
                          {comp.name}
                        </span>
                        <span className="text-[12px] text-ink-3 font-mono">
                          {comp.domain}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(comp.id)}
                        className="text-ink-3 hover:text-danger p-1 rounded-[4px] cursor-pointer text-[12px]"
                        aria-label={`Remove competitor ${comp.name}`}
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>

                {!showAddComp ? (
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddComp(true)}
                      icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
                    >
                      Add competitor row
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleAddCompetitor} className="flex flex-col sm:flex-row gap-2 pt-2 items-end">
                    <div className="flex-1 w-full">
                      <Input
                        label="Competitor name"
                        placeholder="e.g. Lone Star Facilities"
                        value={newCompName}
                        onChange={(e) => setNewCompName(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <Input
                        label="Domain"
                        placeholder="lonestarfacilities.example"
                        value={newCompDomain}
                        onChange={(e) => setNewCompDomain(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="submit" variant="primary">
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAddComp(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
               {saveError && (
     <p role="alert" className="text-[13px] text-danger">
       {saveError}
     </p>
   )}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}
              >
                Back
              </Button>
                 <Button
     variant="primary"
     onClick={handleContinueFromStep2}
     isLoading={savingBusiness}
     icon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
     iconPosition="right"
   >
     Continue
   </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: Who We Contact ================= */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-semibold text-ink tracking-tight">
                Who we would contact
              </h1>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                                These are the groups most likely to need what you offer, based on your website. Fit scores are rough estimates. Select the segments you want to reach.
              </p>
            </div>

            {/* Segments Table */}
            <div className="rounded-[12px] border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px] border-collapse min-w-[640px]">
                  <thead className="bg-surface sticky top-0 border-b border-border text-[12px] text-ink-2 font-medium">
                    <tr className="h-[44px]">
                      <th className="w-12 px-4 sticky left-0 bg-surface z-10">
                        <input
                          type="checkbox"
                          checked={isAllSegmentsSelected}
                          onChange={handleSelectAllSegments}
                          aria-label="Select all segments"
                          className="w-4 h-4 rounded-[4px] border-border text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none cursor-pointer accent-primary"
                        />
                      </th>
                      <th className="px-4 py-2 font-medium">Segment</th>
                      <th className="px-4 py-2 font-medium">Why</th>
                                            <th className="px-4 py-2 font-medium w-48">Fit (estimate)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingSegments ? (
                      <tr>
                        <td colSpan={4} className="h-32 text-center text-ink-3">
                          Loading buyer segments...
                        </td>
                      </tr>
                    ) : segmentsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4">
                          <EmptyState
                            title="No segments found"
                                                        description={segmentsError || 'Return to step 1 to re-analyze your target website.'}
                          />
                        </td>
                      </tr>
                    ) : (
                      segmentsList.map((seg) => {
                        const isSelected = flow.selectedSegmentIds.includes(seg.id);
                        return (
                          <tr
                            key={seg.id}
                            onClick={() => handleToggleSegment(seg.id)}
                            className={`h-[44px] transition-colors duration-150 ease cursor-pointer select-none ${
                              isSelected
                                ? 'bg-primary-soft'
                                : 'bg-surface hover:bg-surface-muted'
                            }`}
                          >
                            <td className="w-12 px-4 sticky left-0 bg-inherit z-10" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSegment(seg.id)}
                                aria-label={`Select segment ${seg.name}`}
                                className="w-4 h-4 rounded-[4px] border-border text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none cursor-pointer accent-primary"
                              />
                            </td>
                            <td className="px-4 py-2 font-medium text-ink whitespace-nowrap">
                              {seg.name}
                            </td>
                            <td className="px-4 py-2 text-[13px] text-ink-2 max-w-xs truncate">
                              {seg.why}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-24 bg-border/60 h-2 rounded-[999px] overflow-hidden">
                                  <div
                                    className="bg-primary h-2 rounded-[999px]"
                                    style={{ width: `${seg.fitScore}%` }}
                                  />
                                </div>
                                <span className="text-[13px] font-medium text-ink tabular-nums">
                                  {seg.fitScore}%
                                </span>
                              </div>
                            </td>
                          
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                icon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="hero"
                disabled={flow.selectedSegmentIds.length === 0}
                onClick={() => setStep(4)}
                icon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
                iconPosition="right"
              >
                Find leads for {flow.selectedSegmentIds.length} selected
              </Button>
            </div>
          </div>
        )}

                {/* ================= STEP 4: Your First Leads ================= */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-semibold text-ink tracking-tight">
                Your first leads
              </h1>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                These leads are saved to your account. Click a row to open it.
              </p>
            </div>

            <div
              className="p-3.5 rounded-[8px] bg-warm-soft border border-border text-[13px] text-ink font-medium"
              role="status"
            >
              Sending is off until you connect a mailbox.
            </div>

            {/* Leads Table */}
            <div className="rounded-[12px] border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px] border-collapse min-w-[640px]">
                  <thead className="bg-surface sticky top-0 border-b border-border text-[12px] text-ink-2 font-medium">
                    <tr className="h-[44px]">
                      <th className="px-4 py-2 font-medium sticky left-0 bg-surface z-10">
                        Contact
                      </th>
                      <th className="px-4 py-2 font-medium">Role</th>
                      <th className="px-4 py-2 font-medium">Company</th>
                      <th className="px-4 py-2 font-medium">Segment</th>
                      <th className="px-4 py-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingLeads ? (
                      <tr>
                        <td colSpan={5} className="h-32 text-center text-ink-3">
                          Loading your leads...
                        </td>
                      </tr>
                    ) : flow.leads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4">
                          <EmptyState
                            title="No leads yet"
                            description={leadsError || 'Leads you add will show up here.'}
                            action={{
                              label: 'Return to segments',
                              onClick: () => setStep(3),
                            }}
                          />
                        </td>
                      </tr>
                    ) : (
                      flow.leads.slice(0, 50).map((lead) => {
                        return (
                          <tr
                            key={lead.id}
                            onClick={(e) => handleOpenDrawer(lead, e.currentTarget)}
                            className="h-[44px] transition-colors duration-150 ease hover:bg-surface-muted cursor-pointer select-none"
                            tabIndex={0}
                            role="button"
                            aria-label={`Open ${lead.name || lead.company}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleOpenDrawer(lead, e.currentTarget);
                              }
                            }}
                          >
                            <td className="px-4 py-2 font-medium text-ink whitespace-nowrap sticky left-0 bg-inherit z-10">
                              {lead.name || '—'}
                            </td>
                            <td className="px-4 py-2 text-ink-2 whitespace-nowrap">
                              {lead.role || '—'}
                            </td>
                            <td className="px-4 py-2 text-ink whitespace-nowrap">
                              {lead.company}
                            </td>
                            <td className="px-4 py-2 text-ink-3 text-[13px] whitespace-nowrap">
                              {lead.segmentName}
                            </td>
                            <td className="px-4 py-2 text-right whitespace-nowrap text-[12px] text-ink-3">
                              Not verified yet
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => setStep(3)}
                icon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}
              >
                Back to segments
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-ink-3">
                  {flow.leads.length} saved
                </span>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (flow.leads.length > 0) {
                      setSelectedLead(flow.leads[0]);
                    }
                  }}
                >
                  Review email copy
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= RIGHT-SIDE DRAWER (420px wide, full-screen below 640px) ================= */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-ink/20 transition-opacity duration-150 ease"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-lead-name"
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] max-w-full bg-surface border-l border-border shadow-lg flex flex-col justify-between z-50 text-left"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex flex-col">
                <h2
                  id="drawer-lead-name"
                  className="text-[18px] font-semibold text-ink leading-tight"
                >
                  {selectedLead.name}
                </h2>
                <span className="text-[13px] text-ink-2">
                  {selectedLead.role} · {selectedLead.company}
                </span>
              </div>
              <button
                ref={closeDrawerBtnRef}
                onClick={handleCloseDrawer}
                className="text-ink-3 hover:text-ink p-1.5 rounded-[6px] border border-border hover:bg-surface-muted transition-colors duration-150 ease cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5">
              {loadingDraft ? (
                <div className="py-12 text-center text-ink-3 text-[14px]">
                  Loading personalized email draft...
                </div>
              ) : leadDraft ? (
                <>
                  {/* Subject Line */}
                  <div className="flex flex-col gap-1 p-3 rounded-[8px] bg-surface-muted border border-border">
                    <span className="text-[12px] font-medium text-ink-3">Subject</span>
                    <span className="text-[14px] font-medium text-ink">
                      {leadDraft.subject}
                    </span>
                  </div>

                  {/* Email Body (4 short sentences) */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] font-medium text-ink-3">
                      Email draft
                    </span>
                    <div className="p-4 rounded-[8px] border border-border bg-surface text-[14px] text-ink leading-relaxed">
                      {leadDraft.body}
                    </div>
                  </div>

                  {/* "What we used" block with 2 short facts */}
                  <div className="flex flex-col gap-2 p-3.5 rounded-[8px] border border-border bg-surface-muted/50">
                    <span className="text-[12px] font-medium text-ink">
                      What we used from their site
                    </span>
                    <ul className="flex flex-col gap-1.5 text-[12px] text-ink-2 pl-4 list-disc">
                      {leadDraft.evidence.map((fact, fIdx) => (
                        <li key={fIdx}>{fact}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Email footer line */}
                  <div className="pt-2 border-t border-border text-[11px] text-ink-3 leading-relaxed">
                    {leadDraft.senderLine}
                  </div>
                                </>
              ) : (
                <div className="py-12 text-center text-ink-3 text-[14px]">
                  Personal email drafts for your own leads come in a later step.
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-border bg-surface flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCloseDrawer}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  disabled
                  className="flex-1"
                >
                  Send
                </Button>
              </div>
              <p className="text-[12px] text-ink-3 text-center">
                Connect a mailbox first.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
