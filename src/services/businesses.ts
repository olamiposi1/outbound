import { supabase } from '../lib/supabase';

export async function saveBusiness(website: string, summary: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from('businesses')
    .select('id')
    .eq('website', website)
    .limit(1)
    .maybeSingle();
  if (findError) throw findError;

  if (existing) {
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ summary })
      .eq('id', existing.id);
    if (updateError) throw updateError;
    return existing.id as string;
  }

  const { data: created, error: insertError } = await supabase
    .from('businesses')
    .insert({ website, summary })
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id as string;
}