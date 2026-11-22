import { supabase } from '../supabase';

export interface SourceRow {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit';
  current_balance: number;
  credit_limit?: number | null;
  opening_balance: number;
  is_overdrawn?: boolean;
  archived: boolean;
  has_transactions?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SourceTotals {
  bank_cash_total: number;
  credit_card_total: number;
}

export async function fetchSourcesWithStats(): Promise<{ data: SourceRow[] | null; error: unknown }> {
  const { data, error } = await supabase.rpc('sources_with_stats');
  return { data: (data as SourceRow[]) ?? null, error };
}

export async function fetchSourceTotals(): Promise<{ data: SourceTotals[] | null; error: unknown }> {
  const { data, error } = await supabase.rpc('source_totals');
  return { data: (data as SourceTotals[]) ?? null, error };
}

export async function setSourceArchived(id: string, archived: boolean): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('financial_sources')
    .update({ archived })
    .eq('id', id);
  return { error };
}

export async function deleteSourceRecord(id: string): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('financial_sources')
    .delete()
    .eq('id', id);
  return { error };
}
