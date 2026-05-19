import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin as supabase } from '../lib/supabase';
import type { CharacterDefinition } from '../types';

interface CharacterRow {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  form1_image_url: string;
  form2_image_url: string;
  available: boolean;
  sort_order: number;
}

function rowToCharacter(row: CharacterRow): CharacterDefinition {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    thumbnail: row.thumbnail_url ?? row.form1_image_url,
    forms: [
      { levels: [1, 2], imageUrl: row.form1_image_url, label: '第一形態' },
      { levels: [3, 4, 5], imageUrl: row.form2_image_url, label: '第二形態' },
    ],
  };
}

export interface CharacterRecord extends CharacterDefinition {
  available: boolean;
  sortOrder: number;
  form1ImageUrl: string;
  form2ImageUrl: string;
}

function rowToRecord(row: CharacterRow): CharacterRecord {
  return {
    ...rowToCharacter(row),
    available: row.available,
    sortOrder: row.sort_order,
    form1ImageUrl: row.form1_image_url,
    form2ImageUrl: row.form2_image_url,
  };
}

export function useCharacters() {
  const [characters, setCharacters] = useState<CharacterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('characters')
      .select('*')
      .order('sort_order', { ascending: true });
    setCharacters((data ?? []).map(rowToRecord));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addCharacter = useCallback(async (input: {
    name: string; description: string;
    form1ImageUrl: string; form2ImageUrl: string;
  }) => {
    const id = `char-${Date.now()}`;
    const { error } = await supabase.from('characters').insert({
      id,
      name: input.name,
      description: input.description,
      thumbnail_url: input.form1ImageUrl,
      form1_image_url: input.form1ImageUrl,
      form2_image_url: input.form2ImageUrl,
      available: true,
      sort_order: 99,
    });
    if (error) throw new Error(error.message);
    await fetch();
  }, [fetch]);

  const updateCharacter = useCallback(async (id: string, input: {
    name?: string; description?: string;
    form1ImageUrl?: string; form2ImageUrl?: string;
  }) => {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.form1ImageUrl !== undefined) {
      updates.form1_image_url = input.form1ImageUrl;
      updates.thumbnail_url = input.form1ImageUrl;
    }
    if (input.form2ImageUrl !== undefined) updates.form2_image_url = input.form2ImageUrl;
    const { error } = await supabase.from('characters').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
    await fetch();
  }, [fetch]);

  const toggleAvailable = useCallback(async (id: string, available: boolean) => {
    const { error } = await supabase.from('characters').update({ available }).eq('id', id);
    if (error) throw new Error(error.message);
    await fetch();
  }, [fetch]);

  const deleteCharacter = useCallback(async (id: string) => {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetch();
  }, [fetch]);

  const availableCharacters = characters.filter((c) => c.available);

  return { characters, availableCharacters, loading, addCharacter, updateCharacter, toggleAvailable, deleteCharacter, refresh: fetch };
}
