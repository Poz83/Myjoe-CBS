import { createClient } from '@/lib/supabase/server';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import type { Database } from '@/lib/supabase/types';
import type { Audience } from '@/types/domain';

type Hero = Database['public']['Tables']['heroes']['Row'];

/**
 * Input for creating a new hero
 */
export interface CreateHeroInput {
  owner_id: string;
  name: string;
  description: string;
  audience: Audience;
  compiled_prompt: string;
  negative_prompt: string | null;
  reference_key: string;
  thumbnail_key: string | null;
  style_preset?: string | null;
}

/**
 * Input for updating a hero
 */
export interface UpdateHeroInput {
  name?: string;
  description?: string;
}

/**
 * Get all heroes for a user
 * Filters out soft-deleted heroes and orders by most recently updated
 */
export async function getHeroes(userId: string): Promise<Hero[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('heroes')
    .select('*')
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch heroes: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single hero by ID with ownership verification
 */
export async function getHero(heroId: string, userId: string): Promise<Hero> {
  const supabase = await createClient();

  const { data: hero, error } = await supabase
    .from('heroes')
    .select('*')
    .eq('id', heroId)
    .is('deleted_at', null)
    .single();

  if (error || !hero) {
    throw new NotFoundError('Hero');
  }

  if (hero.owner_id !== userId) {
    throw new ForbiddenError('Access to this hero is forbidden');
  }

  return hero;
}

/**
 * Create a new hero
 */
export async function createHero(data: CreateHeroInput): Promise<Hero> {
  const supabase = await createClient();

  const { data: hero, error } = await supabase
    .from('heroes')
    .insert({
      owner_id: data.owner_id,
      name: data.name,
      description: data.description,
      audience: data.audience,
      compiled_prompt: data.compiled_prompt,
      negative_prompt: data.negative_prompt,
      reference_key: data.reference_key,
      thumbnail_key: data.thumbnail_key,
      style_preset: data.style_preset || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create hero: ${error.message}`);
  }

  return hero;
}

/**
 * Update a hero
 * Only allows updating specific fields
 */
export async function updateHero(
  heroId: string,
  userId: string,
  input: UpdateHeroInput
): Promise<Hero> {
  const supabase = await createClient();

  // Verify ownership first
  const { data: existing, error: checkError } = await supabase
    .from('heroes')
    .select('id')
    .eq('id', heroId)
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .single();

  if (checkError || !existing) {
    throw new NotFoundError('Hero');
  }

  // Update only allowed fields
  const { data: hero, error: updateError } = await supabase
    .from('heroes')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', heroId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update hero: ${updateError.message}`);
  }

  return hero;
}

/**
 * Soft delete a hero
 * Sets deleted_at timestamp instead of removing from database
 */
export async function deleteHero(heroId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  // Verify ownership first
  const { data: existing, error: checkError } = await supabase
    .from('heroes')
    .select('id')
    .eq('id', heroId)
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .single();

  if (checkError || !existing) {
    throw new NotFoundError('Hero');
  }

  // Soft delete
  const { error: deleteError } = await supabase
    .from('heroes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', heroId);

  if (deleteError) {
    throw new Error(`Failed to delete hero: ${deleteError.message}`);
  }
}

/**
 * Increment the times_used counter for a hero
 */
export async function incrementHeroUsage(heroId: string): Promise<void> {
  const supabase = await createClient();

  // Get current usage
  const { data: hero, error: fetchError } = await supabase
    .from('heroes')
    .select('times_used')
    .eq('id', heroId)
    .single();

  if (fetchError || !hero) {
    throw new NotFoundError('Hero');
  }

  // Increment
  const { error: updateError } = await supabase
    .from('heroes')
    .update({
      times_used: hero.times_used + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', heroId);

  if (updateError) {
    throw new Error(`Failed to increment hero usage: ${updateError.message}`);
  }
}
