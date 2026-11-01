import { supabase } from '../lib/supabase';
import type { ParsedLead } from '../utils/parseLeadsCsv';

export type LeadSource = 'csv' | 'places' | 'manual';

export type LeadRow = ParsedLead & {
  id: string;
  source: LeadSource;
  created_at: string;
};

export async function saveLeads(leads: ParsedLead[], source: LeadSource): Promise<number> {
  if (leads.length === 0) return 0;
  const rows = leads.map((l) => ({ ...l, source }));
  const { error } = await supabase.from('leads').insert(rows);
  if (error) throw error;
  return rows.length;
}

export async function listLeads(): Promise<LeadRow[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadRow[];
}