import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { brand } from '../config/brand';
import { useAuth } from '../context/AuthContext';
import { sampleHeroStatusMessages } from '../mock/data';
import { usePageMeta } from '../utils/usePageMeta';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { ChevronDown, ArrowRight, Check, X } from 'lucide-react';

export function LandingPage() {
  usePageMeta(undefined, `${brand.name} — ${brand.tagline}`);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inputUrl, setInputUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [signInOpen, setSignInOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Motion state & preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Rotating status pill state
  const [activeMsgIndex, setActiveMsgIndex] = useState(0);
  const [prevMsgIndex, setPrevMsgIndex] = useState<number | null>(null);
  const [isPillHovered, setIsPillHovered] = useState(false);

  // Sample card motion state
  const [fitScores, setFitScores] = useState<[number, number, number]>([91, 84, 78]);
  const [barsLoaded, setBarsLoaded] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Detect screen size below 640px
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobileScreen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobileScreen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Rotating status pill interval (3.2 seconds)
  useEffect(() => {
    if (isPillHovered || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveMsgIndex((curr) => {
        setPrevMsgIndex(curr);
        return (curr + 1) % sampleHeroStatusMessages.length;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [isPillHovered, prefersReducedMotion]);

  // Pause background SVG animations when off-screen or tab hidden
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== 'function') return;

    let isHeroVisible = true;
    let isTabVisible = document.visibilityState === 'visible';

    const updatePlayState = () => {
      if (!svg || typeof svg.pauseAnimations !== 'function') return;
      if (isHeroVisible && isTabVisible) {
        try {
          svg.unpauseAnimations();
        } catch {
          // Safe catch
        }
      } else {
        try {
          svg.pauseAnimations();
        } catch {
          // Safe catch
        }
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroVisible = entry.isIntersecting;
        updatePlayState();
      },
      { threshold: 0.05 }
    );

    if (heroSectionRef.current) {
      observer.observe(heroSectionRef.current);
    }

    const handleVisibility = () => {
      isTabVisible = document.visibilityState === 'visible';
      updatePlayState();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Preview card animation: initial fill & count up, then 8s row highlight sequence
  useEffect(() => {
    if (prefersReducedMotion) {
      setFitScores([91, 84, 78]);
      setBarsLoaded(true);
      return;
    }

    // Start from 0
    setFitScores([0, 0, 0]);
    setBarsLoaded(false);

    // Staggered fill trigger on next animation frame
    const frame = requestAnimationFrame(() => {
      setBarsLoaded(true);
    });

    // Count up numbers over 800ms
    const startTime = performance.now();
    const duration = 800;
    let animId: number;

    const countUp = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setFitScores([
        Math.round(91 * ease),
        Math.round(84 * ease),
        Math.round(78 * ease),
      ]);
      if (progress < 1) {
        animId = requestAnimationFrame(countUp);
      }
    };
    animId = requestAnimationFrame(countUp);

    // Highlight sequence every 8 seconds
    const interval = setInterval(() => {
      setHighlightedRow(0);
      const t1 = setTimeout(() => setHighlightedRow(1), 600);
      const t2 = setTimeout(() => setHighlightedRow(2), 1200);
      const t3 = setTimeout(() => setHighlightedRow(null), 1800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }, 8000);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(animId);
      clearInterval(interval);
    };
  }, [prefersReducedMotion]);

  // Close sign-in popover on click outside or Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        signInButtonRef.current &&
        !signInButtonRef.current.contains(event.target as Node)
      ) {
        setSignInOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSignInOpen(false);
        signInButtonRef.current?.focus();
      }
    }

    if (signInOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [signInOpen]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUrl.trim();
    if (!clean) {
      setUrlError('Enter a website like yourcompany.com');
      return;
    }
    setUrlError('');
    navigate(`/start?url=${encodeURIComponent(clean)}`);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  const faqItems = [
    {
      q: 'How does it work?',
      a: '[Explanation placeholder: The agent visits your website to understand your offering, identifies fitting customer segments, sources verified business emails, and drafts personalized messages.]',
    },
    {
      q: 'Will it work for my business?',
      a: '[Explanation placeholder: It is designed for companies selling services or products to other businesses with identifiable buyers.]',
    },
    {
      q: 'Where do the leads come from?',
      a: '[Explanation placeholder: Leads are gathered from public domain registries, company directories, and verified against live mail servers.]',
    },
    {
      q: 'Whose mailboxes send the emails?',
      a: '[Explanation placeholder: Messages are sent from your authenticated work mailboxes so replies go straight to your inbox.]',
    },
    {
      q: 'How much does it cost?',
      a: '[Explanation placeholder: You only pay for sent emails. You set a daily sending budget and can adjust or pause anytime.]',
    },
    {
      q: 'What results can I expect?',
      a: '[Explanation placeholder: Results vary by industry and market proposition. You can review all copy and verified recipient criteria before sending.]',
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink text-left flex flex-col selection:bg-primary-soft selection:text-primary">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface focus:text-primary focus:border focus:border-border focus:rounded-[8px] focus:shadow-md"
      >
        Skip to content
      </a>

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 w-full bg-bg/95 backdrop-blur-none border-b border-border">
        <div className="max-w-[1120px] mx-auto px-6 h-[60px] flex items-center justify-between gap-4">
          {/* Wordmark */}
          <a
            href="/"
            className="text-[18px] font-semibold text-ink tracking-tight whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px]"
          >
            {brand.name}
          </a>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-6 text-[14px] text-ink-2">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-ink transition-colors duration-150 ease cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px] px-1"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-ink transition-colors duration-150 ease cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px] px-1"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-ink transition-colors duration-150 ease cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px] px-1"
            >
              FAQ
            </button>
          </nav>

          {/* Actions */}
          <div className="relative flex items-center gap-3">
               <Button
     ref={signInButtonRef}
     variant="ghost"
     size="default"
     onClick={() => navigate(user ? '/app' : '/login')}
   >
     {user ? 'Open app' : 'Sign in'}
   </Button>

            {/* Sign in preview popover with soft shadow */}
            {signInOpen && (
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="Sign in notice"
                className="absolute right-0 top-[44px] w-[260px] p-3.5 bg-surface border border-border rounded-[8px] shadow-md z-40 text-left flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-ink">Preview note</span>
                  <button
                    onClick={() => setSignInOpen(false)}
                    className="text-ink-3 hover:text-ink p-0.5 rounded-[4px]"
                    aria-label="Close notification"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-[12px] text-ink-2 leading-relaxed">
                  Sign in isn't available in this preview.
                </p>
              </div>
            )}

            <Button
              variant="primary"
              size="default"
              onClick={() => navigate('/start')}
            >
              Start free
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {/* HERO SECTION */}
        <section ref={heroSectionRef} className="relative w-full border-b border-border py-16 md:py-24 overflow-hidden">
          {/* Background drifting lines and dots */}
          <svg
            ref={svgRef}
            aria-hidden="true"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1120 540"
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{
              maskImage:
                'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 100%)',
            }}
          >
            <defs>
              {/* Path 1: enters top-left, curves above h1 to URL input */}
              <path
                id="hero-path-1"
                d="M 0,40 C 180,15 360,15 500,40 C 600,60 560,250 440,340 C 380,380 320,395 260,395"
              />
              {/* Path 2: enters mid-left below subline to URL input */}
              <path
                id="hero-path-2"
                d="M 0,330 C 80,330 170,360 260,395"
              />
              {/* Path 3: enters bottom-left to URL input (desktop only) */}
              {!isMobileScreen && (
                <path
                  id="hero-path-3"
                  d="M 0,480 C 80,480 170,440 260,395"
                />
              )}
              {/* Path 4: continues from URL input toward sample card */}
              <path
                id="hero-path-4"
                d="M 280,395 C 400,395 500,220 640,165 C 760,115 920,115 1120,115"
              />
              {/* Path 5: continues from URL input lower toward sample card (desktop only) */}
              {!isMobileScreen && (
                <path
                  id="hero-path-5"
                  d="M 280,400 C 420,410 520,440 640,420 C 780,400 940,380 1120,380"
                />
              )}
            </defs>

            {/* Render paths */}
            <use href="#hero-path-1" stroke="var(--border-strong)" strokeWidth="1" fill="none" />
            <use href="#hero-path-2" stroke="var(--border-strong)" strokeWidth="1" fill="none" />
            {!isMobileScreen && (
              <use href="#hero-path-3" stroke="var(--border-strong)" strokeWidth="1" fill="none" />
            )}
            <use href="#hero-path-4" stroke="var(--border-strong)" strokeWidth="1" fill="none" />
            {!isMobileScreen && (
              <use href="#hero-path-5" stroke="var(--border-strong)" strokeWidth="1" fill="none" />
            )}

            {/* Render drifting dots */}
            {prefersReducedMotion ? (
              /* Static dots at fixed positions when reduced motion is preferred */
              !isMobileScreen ? (
                <g>
                  <circle cx="180" cy="25" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="480" cy="45" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="420" cy="340" r="2.5" fill="var(--primary)" />
                  <circle cx="120" cy="340" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="210" cy="375" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="90" cy="465" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="180" cy="430" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="450" cy="310" r="2.5" fill="var(--primary)" />
                  <circle cx="700" cy="135" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="960" cy="115" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="500" cy="430" r="2.5" fill="var(--primary)" />
                  <circle cx="860" cy="390" r="2" fill="var(--ink-3)" opacity="0.5" />
                </g>
              ) : (
                <g>
                  <circle cx="180" cy="25" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="420" cy="340" r="2.5" fill="var(--primary)" />
                  <circle cx="120" cy="340" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="210" cy="375" r="2" fill="var(--ink-3)" opacity="0.5" />
                  <circle cx="450" cy="310" r="2.5" fill="var(--primary)" />
                  <circle cx="800" cy="120" r="2" fill="var(--ink-3)" opacity="0.5" />
                </g>
              )
            ) : !isMobileScreen ? (
              /* 12 dots on desktop */
              <g>
                {/* Path 1 dots */}
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="24s" repeatCount="indefinite" begin="-3s" calcMode="linear">
                    <mpath href="#hero-path-1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="24s" repeatCount="indefinite" begin="-3s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="28s" repeatCount="indefinite" begin="-15s" calcMode="linear">
                    <mpath href="#hero-path-1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="28s" repeatCount="indefinite" begin="-15s" />
                </circle>
                <circle r="2.5" fill="var(--primary)">
                  <animateMotion dur="20s" repeatCount="indefinite" begin="-9s" calcMode="linear">
                    <mpath href="#hero-path-1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.08; 0.92; 1" dur="20s" repeatCount="indefinite" begin="-9s" />
                </circle>

                {/* Path 2 dots */}
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="18s" repeatCount="indefinite" begin="-5s" calcMode="linear">
                    <mpath href="#hero-path-2" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="18s" repeatCount="indefinite" begin="-5s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="22s" repeatCount="indefinite" begin="-12s" calcMode="linear">
                    <mpath href="#hero-path-2" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="22s" repeatCount="indefinite" begin="-12s" />
                </circle>

                {/* Path 3 dots */}
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="20s" repeatCount="indefinite" begin="-7s" calcMode="linear">
                    <mpath href="#hero-path-3" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="20s" repeatCount="indefinite" begin="-7s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="26s" repeatCount="indefinite" begin="-17s" calcMode="linear">
                    <mpath href="#hero-path-3" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="26s" repeatCount="indefinite" begin="-17s" />
                </circle>

                {/* Path 4 dots */}
                <circle r="2.5" fill="var(--primary)">
                  <animateMotion dur="17s" repeatCount="indefinite" begin="-4s" calcMode="linear">
                    <mpath href="#hero-path-4" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.08; 0.92; 1" dur="17s" repeatCount="indefinite" begin="-4s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="23s" repeatCount="indefinite" begin="-11s" calcMode="linear">
                    <mpath href="#hero-path-4" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="23s" repeatCount="indefinite" begin="-11s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="27s" repeatCount="indefinite" begin="-19s" calcMode="linear">
                    <mpath href="#hero-path-4" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="27s" repeatCount="indefinite" begin="-19s" />
                </circle>

                {/* Path 5 dots */}
                <circle r="2.5" fill="var(--primary)">
                  <animateMotion dur="19s" repeatCount="indefinite" begin="-8s" calcMode="linear">
                    <mpath href="#hero-path-5" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.08; 0.92; 1" dur="19s" repeatCount="indefinite" begin="-8s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="25s" repeatCount="indefinite" begin="-16s" calcMode="linear">
                    <mpath href="#hero-path-5" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="25s" repeatCount="indefinite" begin="-16s" />
                </circle>
              </g>
            ) : (
              /* 6 dots on mobile (<640px) */
              <g>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="24s" repeatCount="indefinite" begin="-4s" calcMode="linear">
                    <mpath href="#hero-path-1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="24s" repeatCount="indefinite" begin="-4s" />
                </circle>
                <circle r="2.5" fill="var(--primary)">
                  <animateMotion dur="20s" repeatCount="indefinite" begin="-10s" calcMode="linear">
                    <mpath href="#hero-path-1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.08; 0.92; 1" dur="20s" repeatCount="indefinite" begin="-10s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="18s" repeatCount="indefinite" begin="-5s" calcMode="linear">
                    <mpath href="#hero-path-2" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="18s" repeatCount="indefinite" begin="-5s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="22s" repeatCount="indefinite" begin="-14s" calcMode="linear">
                    <mpath href="#hero-path-2" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="22s" repeatCount="indefinite" begin="-14s" />
                </circle>
                <circle r="2.5" fill="var(--primary)">
                  <animateMotion dur="17s" repeatCount="indefinite" begin="-6s" calcMode="linear">
                    <mpath href="#hero-path-4" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.08; 0.92; 1" dur="17s" repeatCount="indefinite" begin="-6s" />
                </circle>
                <circle r="2" fill="var(--ink-3)">
                  <animateMotion dur="23s" repeatCount="indefinite" begin="-12s" calcMode="linear">
                    <mpath href="#hero-path-4" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0; 0.5; 0.5; 0" keyTimes="0; 0.08; 0.92; 1" dur="23s" repeatCount="indefinite" begin="-12s" />
                </circle>
              </g>
            )}
          </svg>

          <div className="max-w-[1120px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                {/* Rotating status pill */}
                <div
                  className="inline-flex items-center gap-2 px-3 h-[28px] rounded-[999px] border border-border bg-surface text-[12px] text-ink-2 select-none w-fit cursor-default"
                  onMouseEnter={() => setIsPillHovered(true)}
                  onMouseLeave={() => setIsPillHovered(false)}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-success shrink-0 animate-hero-pulse"
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {brand.name} researches your market, finds buyers, writes each email and books meetings.
                  </span>
                  <div
                    className="grid grid-cols-1 grid-rows-1 overflow-hidden h-[18px] items-center"
                    aria-hidden="true"
                  >
                    {sampleHeroStatusMessages.map((msg, idx) => {
                      const isActive = activeMsgIndex === idx;
                      const isPrev = prevMsgIndex === idx;

                      if (prefersReducedMotion) {
                        return idx === 0 ? (
                          <span
                            key={msg}
                            className="col-start-1 row-start-1 whitespace-nowrap text-ink-2 text-[12px] font-normal"
                          >
                            {msg}
                          </span>
                        ) : null;
                      }

                      return (
                        <span
                          key={msg}
                          className={`col-start-1 row-start-1 whitespace-nowrap text-ink-2 text-[12px] font-normal transition-all duration-[350ms] ease ${
                            isActive
                              ? 'opacity-100 translate-y-0'
                              : isPrev
                              ? 'opacity-0 -translate-y-[6px] pointer-events-none'
                              : 'opacity-0 translate-y-[6px] pointer-events-none'
                          }`}
                        >
                          {msg}
                        </span>
                      );
                    })}
                  </div>
                  <span className="w-[1px] h-3 bg-border shrink-0" aria-hidden="true" />
                  <span className="text-[12px] text-ink-3 shrink-0" aria-hidden="true">
                    Sample
                  </span>
                </div>

                <h1 className="text-[36px] sm:text-[44px] lg:text-[48px] font-bold text-ink tracking-tight leading-[1.15]">
                  Paste your website. Meet your first buyers.
                </h1>
                <p className="text-[16px] text-ink-2 leading-relaxed max-w-xl">
                  The agent learns what you sell, finds the right people, writes each email, and handles the replies.
                </p>
              </div>

              {/* URL Input Form */}
              <form onSubmit={handleHeroSubmit} className="flex flex-col gap-2 max-w-lg">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g. harborandpine.example"
                      value={inputUrl}
                      onChange={(e) => {
                        setInputUrl(e.target.value);
                        if (urlError) setUrlError('');
                      }}
                      errorMessage={urlError}
                      aria-label="Business website URL"
                      inputSize="hero"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="hero"
                    className="shrink-0"
                  >
                    Find my buyers
                  </Button>
                </div>
                <div className="flex items-center justify-between text-[12px] text-ink-3">
                  <span>Free preview. No card needed.</span>
                  <button
                    type="button"
                    onClick={() => setInputUrl('harborandpine.example')}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Try sample site
                  </button>
                </div>
              </form>
            </div>

            {/* Right column: static product preview card in HTML/CSS */}
            <div className="lg:col-span-5 w-full">
              <div className="rounded-[12px] border border-border bg-surface p-5 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-ink">
                      Harbor & Pine
                    </span>
                    <span className="text-[12px] text-ink-3 font-mono">
                      harborandpine.example
                    </span>
                  </div>
                  <Badge variant="neutral">Sample</Badge>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-ink-3">
                    Top identified buyer segments
                  </span>
                  <div className="flex flex-col gap-2.5 pt-1">
                    <div
                      className={`flex flex-col gap-1 p-2 rounded-[8px] border transition-colors duration-150 ease ${
                        highlightedRow === 0
                          ? 'bg-primary-soft border-primary/20'
                          : 'bg-surface-muted/60 border-border/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-ink">Property managers</span>
                        <span className="tabular-nums text-primary font-medium">
                          {fitScores[0]}% fit
                        </span>
                      </div>
                      <div className="w-full bg-border/60 h-1.5 rounded-[999px] overflow-hidden">
                        <div
                          className="bg-primary h-1.5 rounded-[999px] transition-[width] duration-800 ease-out"
                          style={{
                            width: barsLoaded ? '91%' : '0%',
                            transitionDelay: prefersReducedMotion ? '0ms' : '0ms',
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-ink-3 tabular-nums">~184 contacts in Austin</span>
                    </div>

                    <div
                      className={`flex flex-col gap-1 p-2 rounded-[8px] border transition-colors duration-150 ease ${
                        highlightedRow === 1
                          ? 'bg-primary-soft border-primary/20'
                          : 'bg-surface-muted/60 border-border/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-ink">Medical clinics</span>
                        <span className="tabular-nums text-primary font-medium">
                          {fitScores[1]}% fit
                        </span>
                      </div>
                      <div className="w-full bg-border/60 h-1.5 rounded-[999px] overflow-hidden">
                        <div
                          className="bg-primary h-1.5 rounded-[999px] transition-[width] duration-800 ease-out"
                          style={{
                            width: barsLoaded ? '84%' : '0%',
                            transitionDelay: prefersReducedMotion ? '0ms' : '120ms',
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-ink-3 tabular-nums">~142 contacts in Austin</span>
                    </div>

                    <div
                      className={`flex flex-col gap-1 p-2 rounded-[8px] border transition-colors duration-150 ease ${
                        highlightedRow === 2
                          ? 'bg-primary-soft border-primary/20'
                          : 'bg-surface-muted/60 border-border/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-ink">Coworking spaces</span>
                        <span className="tabular-nums text-primary font-medium">
                          {fitScores[2]}% fit
                        </span>
                      </div>
                      <div className="w-full bg-border/60 h-1.5 rounded-[999px] overflow-hidden">
                        <div
                          className="bg-primary h-1.5 rounded-[999px] transition-[width] duration-800 ease-out"
                          style={{
                            width: barsLoaded ? '78%' : '0%',
                            transitionDelay: prefersReducedMotion ? '0ms' : '240ms',
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-ink-3 tabular-nums">~96 contacts in Austin</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[12px] text-ink-3">
                  <span>Austin, Texas commercial market</span>
                  <span className="text-ink-3 font-medium">Sample analysis</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF PLACEHOLDER */}
        <section className="w-full border-b border-border py-8 bg-surface-muted/30">
          <div className="max-w-[1120px] mx-auto px-6">
            <div className="p-6 rounded-[12px] border border-dashed border-border-strong bg-surface text-left flex flex-col gap-1">
              <span className="text-[12px] font-mono text-ink-3">[Placeholder]</span>
              <p className="text-[14px] text-ink-2 font-medium">
                Customer results go here
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="w-full border-b border-border py-20">
          <div className="max-w-[1120px] mx-auto px-6 flex flex-col gap-16">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-[12px] font-medium text-ink-3">Process</span>
              <h2 className="text-[28px] font-semibold text-ink tracking-tight">
                How it works
              </h2>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                Six automated steps from initial website crawl to scheduled meetings.
              </p>
            </div>

            <div className="flex flex-col gap-12">
              {/* Step 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-mono text-ink-3">Step 1</span>
                  <h3 className="text-[20px] font-semibold text-ink tracking-tight">
                    Learns what you sell
                  </h3>
                  <p className="text-[14px] text-ink-2 leading-relaxed">
                    The agent visits your domain, parses your service offerings, and notes your regional coverage and competitors.
                  </p>
                </div>
                <div>
                  <div className="rounded-[12px] border border-border bg-surface p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-[13px] font-medium text-ink">Website profile summary</span>
                      <span className="text-[11px] text-ink-3 font-mono">Sample</span>
                    </div>
                    <p className="text-[13px] text-ink-2 leading-relaxed">
                      Commercial janitorial and sanitization services for multi-tenant facilities, medical centers, and professional offices across Austin, Texas.
                    </p>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[11px] text-ink-3">Observed market alternatives</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-surface-muted border border-border font-mono text-ink-2">
                          austincleanpro.example
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-surface-muted border border-border font-mono text-ink-2">
                          lonestarfacilities.example
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-surface-muted border border-border font-mono text-ink-2">
                          capitoljanitorial.example
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 (Alternated) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2 flex flex-col gap-2">
                  <span className="text-[12px] font-mono text-ink-3">Step 2</span>
                  <h3 className="text-[20px] font-semibold text-ink tracking-tight">
                    Works out who buys
                  </h3>
                  <p className="text-[14px] text-ink-2 leading-relaxed">
                    Evaluates commercial segments by operational need, turnover cadence, and buying fit.
                  </p>
                </div>
                <div className="md:order-1">
                  <div className="rounded-[12px] border border-border bg-surface p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-[13px] font-medium text-ink">Segment fit scores</span>
                      <span className="text-[11px] text-ink-3 font-mono">Sample</span>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[12px]">
                          <span className="font-medium text-ink">Property managers</span>
                          <span className="tabular-nums text-primary font-medium">91%</span>
                        </div>
                        <div className="w-full bg-surface-muted h-1.5 rounded-[999px] overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-[999px] w-[91%]" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[12px]">
                          <span className="font-medium text-ink">Medical clinics</span>
                          <span className="tabular-nums text-primary font-medium">84%</span>
                        </div>
                        <div className="w-full bg-surface-muted h-1.5 rounded-[999px] overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-[999px] w-[84%]" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[12px]">
                          <span className="font-medium text-ink">Coworking spaces</span>
                          <span className="tabular-nums text-primary font-medium">78%</span>
                        </div>
                        <div className="w-full bg-surface-muted h-1.5 rounded-[999px] overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-[999px] w-[78%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-mono text-ink-3">Step 3</span>
                  <h3 className="text-[20px] font-semibold text-ink tracking-tight">
                    Finds those exact people
                  </h3>
                  <p className="text-[14px] text-ink-2 leading-relaxed">
                    Locates real facility coordinators and operations leads, confirming email deliverability.
                  </p>
                </div>
                <div>
                  <div className="rounded-[12px] border border-border bg-surface p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-[13px] font-medium text-ink">Verified lead roster</span>
                      <span className="text-[11px] text-ink-3 font-mono">Sample</span>
                    </div>
                    <div className="flex flex-col divide-y divide-border">
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-ink">Marcus Vance</span>
                          <span className="text-[11px] text-ink-3">Property operations lead · Travis Tower</span>
                        </div>
                        <Badge variant="success" withDot>Verified</Badge>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-ink">Elena Rostova</span>
                          <span className="text-[11px] text-ink-3">Facilities director · Barton Creek Medical</span>
                        </div>
                        <Badge variant="success" withDot>Verified</Badge>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-ink">Sarah Chen</span>
                          <span className="text-[11px] text-ink-3">Community GM · Atelier Workspaces</span>
                        </div>
                        <Badge variant="success" withDot>Verified</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 (Alternated) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2 flex flex-col gap-2">
                  <span className="text-[12px] font-mono text-ink-3">Step 4</span>
                  <h3 className="text-[20px] font-semibold text-ink tracking-tight">
                    Writes each a personal email
                  </h3>
                  <p className="text-[14px] text-ink-2 leading-relaxed">
                    Drafts four tailored sentences grounded in observed details from the target's public updates.
                  </p>
                </div>
                <div className="md:order-1">
                  <div className="rounded-[12px] border border-border bg-surface p-4 flex flex-col gap-2 text-left">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-[13px] font-medium text-ink">Personalized outreach draft</span>
                      <span className="text-[11px] text-ink-3 font-mono">Sample</span>
                    </div>
                    <div className="text-[12px] font-medium text-ink">
                      Subject: Janitorial coverage for Travis Tower common areas
                    </div>
                    <p className="text-[13px] text-ink-2 leading-relaxed pt-1">
                      I noticed Travis Tower recently completed lobby renovations across both multi-tenant towers. Harbor & Pine provides dedicated commercial cleaning with certified crews stationed in downtown Austin. We maintain documented compliance checklists for every evening turnover. Would you be open to reviewing our 15-minute facility audit checklist this week?
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-mono text-ink-3">Step 5</span>
                  <h3 className="text-[20px] font-semibold text-ink tracking-tight">
                    Handles replies and books meetings
                  </h3>
                  <p className="text-[14px] text-ink-2 leading-relaxed">
                    Answers questions about timing and scope, proposing calendar openings when interest is shown.
                  </p>
                </div>
                <div>
                  <div className="rounded-[12px] border border-border bg-surface p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-[13px] font-medium text-ink">Inbox thread</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-ink-3 font-mono">Sample</span>
                        <Badge variant="success" withDot>Meeting booked</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="p-2.5 rounded-[8px] bg-surface-muted text-[12px] text-ink-2 flex flex-col gap-1">
                        <span className="font-medium text-ink">Marcus Vance (10:14 AM)</span>
                        <p>Do your evening crews hold safety clearances for multi-tenant elevator banks?</p>
                      </div>
                      <div className="p-2.5 rounded-[8px] bg-primary-soft/60 text-[12px] text-ink flex flex-col gap-1 border border-primary/20">
                        <span className="font-medium text-primary">Harbor & Pine Agent (10:19 AM)</span>
                        <p>Yes, all staff carry verified badges and background checks. I have added a 15-minute walkthrough for Thursday at 2:00 PM to your calendar.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 (Alternated) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2 flex flex-col gap-2">
                  <span className="text-[12px] font-mono text-ink-3">Step 6</span>
                  <h3 className="text-[20px] font-semibold text-ink tracking-tight">
                    Learns what works and doubles down
                  </h3>
                  <p className="text-[14px] text-ink-2 leading-relaxed">
                    Allocates daily sending volume toward segments and angles that generate confirmed walkthroughs.
                  </p>
                </div>
                <div className="md:order-1">
                  <div className="rounded-[12px] border border-border bg-surface p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-[13px] font-medium text-ink">Campaign optimization</span>
                      <span className="text-[11px] text-ink-3 font-mono">Sample</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12px]">
                        <thead>
                          <tr className="border-b border-border text-ink-3">
                            <th className="py-1.5 font-medium">Segment</th>
                            <th className="py-1.5 font-medium text-right">Replies</th>
                            <th className="py-1.5 font-medium text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="py-2 font-medium text-ink">Property managers</td>
                            <td className="py-2 text-right tabular-nums">18.4%</td>
                            <td className="py-2 text-right">
                              <Badge variant="success">Scaling</Badge>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium text-ink">Medical clinics</td>
                            <td className="py-2 text-right tabular-nums">14.1%</td>
                            <td className="py-2 text-right">
                              <Badge variant="primary">Working</Badge>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium text-ink">Boutique hotels</td>
                            <td className="py-2 text-right tabular-nums">3.2%</td>
                            <td className="py-2 text-right">
                              <Badge variant="danger">Paused</Badge>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="w-full border-b border-border py-20">
          <div className="max-w-[1120px] mx-auto px-6 flex flex-col gap-8">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-[12px] font-medium text-ink-3">Billing</span>
              <h2 className="text-[28px] font-semibold text-ink tracking-tight">
                Simple pricing
              </h2>
              <p className="text-[14px] text-ink-2 leading-relaxed">
                Pay only for the emails we send. You set a daily budget and can change it any time.
              </p>
            </div>

            <div className="max-w-md w-full">
              <div className="rounded-[12px] border border-border bg-surface p-6 flex flex-col gap-5 text-left">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex flex-col">
                    <span className="text-[18px] font-semibold text-ink">Pay as you go</span>
                    <span className="text-[12px] text-ink-3">Metered per delivered message</span>
                  </div>
                  <Badge variant="primary">Flexible budget</Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-bold text-ink tabular-nums font-mono">
                    [price per email]
                  </span>
                  <span className="text-[14px] text-ink-2">/ delivered lead</span>
                </div>

                <p className="text-[14px] text-ink-2 leading-relaxed">
                  Pay only for the emails we send. You set a daily budget and can change it any time.
                </p>

                <div className="p-3 rounded-[8px] bg-surface-muted text-[13px] text-ink-2 flex items-center justify-between border border-border">
                  <span>Included trial allocation</span>
                  <span className="font-medium text-ink font-mono">[free credits]</span>
                </div>

                <Button
                  variant="primary"
                  size="hero"
                  onClick={() => navigate('/start')}
                  icon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
                  iconPosition="right"
                >
                  Start free trial
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="w-full border-b border-border py-20">
          <div className="max-w-[1120px] mx-auto px-6 flex flex-col gap-8">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-[12px] font-medium text-ink-3">Questions</span>
              <h2 className="text-[28px] font-semibold text-ink tracking-tight">
                Frequently asked questions
              </h2>
            </div>

            <div className="max-w-2xl w-full flex flex-col divide-y divide-border border-y border-border">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                const buttonId = `faq-btn-${idx}`;
                const regionId = `faq-region-${idx}`;

                return (
                  <div key={item.q} className="flex flex-col">
                    <button
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={regionId}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="py-4 text-left flex items-center justify-between gap-4 text-[16px] font-medium text-ink hover:text-primary transition-colors duration-150 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[4px] cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-3 shrink-0 transition-transform duration-150 ease ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                    {isOpen && (
                      <div
                        id={regionId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="pb-4 text-[14px] text-ink-2 leading-relaxed"
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface border-t border-border py-12">
        <div className="max-w-[1120px] mx-auto px-6 flex flex-col gap-8 text-left">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-semibold text-ink">{brand.name}</span>
              <p className="text-[12px] text-ink-3 max-w-[200px] leading-relaxed">
                {brand.tagline}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-ink-3">Product</span>
              <a href="#how-it-works" onClick={() => scrollToSection('how-it-works')} className="text-[14px] text-ink-2 hover:text-ink">
                How it works
              </a>
              <a href="#pricing" onClick={() => scrollToSection('pricing')} className="text-[14px] text-ink-2 hover:text-ink">
                Pricing
              </a>
              <a href="/app" className="text-[14px] text-primary hover:underline">
                See a sample dashboard
              </a>
              <a href="/_components" className="text-[14px] text-ink-2 hover:text-ink">
                Design system
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-ink-3">Company</span>
              <span className="text-[14px] text-ink-3">About us</span>
              <span className="text-[14px] text-ink-3">Careers</span>
              <a href={`mailto:${brand.supportEmail}`} className="text-[14px] text-ink-2 hover:text-ink">
                Contact support
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-ink-3">Legal</span>
              <span className="text-[14px] text-ink-3">Privacy policy</span>
              <span className="text-[14px] text-ink-3">Terms of service</span>
              <span className="text-[14px] text-ink-3">Security disclosures</span>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-2 text-[12px] text-ink-3">
            <span>© {brand.name}</span>
            <span>All mock entities and emails are fictional sample data.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
