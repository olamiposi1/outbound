import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteAnalysis, Lead } from '../mock/data';

interface FlowState {
  url: string;
  analysis: SiteAnalysis | null;
  selectedSegmentIds: string[];
  leads: Lead[];
}

interface FlowContextValue extends FlowState {
  setUrl: (url: string) => void;
  setAnalysis: (analysis: SiteAnalysis | null) => void;
  updateAnalysis: (updates: Partial<SiteAnalysis>) => void;
  setSelectedSegmentIds: (ids: string[]) => void;
  setLeads: (leads: Lead[]) => void;
  resetFlow: () => void;
}

const STORAGE_KEY = 'outbound_flow_state_v1';

const defaultState: FlowState = {
  url: '',
  analysis: null,
  selectedSegmentIds: ['seg-1', 'seg-2', 'seg-3'], // Top 3 preselected by default
  leads: [],
};

function loadStoredState(): FlowState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultState,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Unable to load flow state from sessionStorage', err);
  }
  return defaultState;
}

function saveState(state: FlowState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Unable to save flow state to sessionStorage', err);
  }
}

const FlowContext = createContext<FlowContextValue | undefined>(undefined);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FlowState>(loadStoredState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setUrl = (url: string) => {
    setState((prev) => ({ ...prev, url }));
  };

  const setAnalysis = (analysis: SiteAnalysis | null) => {
    setState((prev) => ({ ...prev, analysis }));
  };

  const updateAnalysis = (updates: Partial<SiteAnalysis>) => {
    setState((prev) => {
      if (!prev.analysis) return prev;
      return {
        ...prev,
        analysis: {
          ...prev.analysis,
          ...updates,
        },
      };
    });
  };

  const setSelectedSegmentIds = (selectedSegmentIds: string[]) => {
    setState((prev) => ({ ...prev, selectedSegmentIds }));
  };

  const setLeads = (leads: Lead[]) => {
    setState((prev) => ({ ...prev, leads }));
  };

  const resetFlow = () => {
    setState(defaultState);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <FlowContext.Provider
      value={{
        ...state,
        setUrl,
        setAnalysis,
        updateAnalysis,
        setSelectedSegmentIds,
        setLeads,
        resetFlow,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
}
