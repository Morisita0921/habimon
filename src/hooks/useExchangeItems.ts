import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ExchangeItem } from '../types';

interface ExchangeItemRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  emoji: string;
  available: boolean;
  sort_order: number;
}

function rowToItem(row: ExchangeItemRow): ExchangeItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    category: row.category as ExchangeItem['category'],
    price: row.price,
    emoji: row.emoji,
    available: row.available,
  };
}

export function useExchangeItems() {
  const [items, setItems] = useState<ExchangeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exchange_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setItems((data as ExchangeItemRow[]).map(rowToItem));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addItem = useCallback(async (item: Omit<ExchangeItem, 'id'> & { id?: string }) => {
    const id = item.id ?? `item-${Date.now()}`;
    const { error } = await supabase.from('exchange_items').insert({
      id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      emoji: item.emoji,
      available: item.available,
      sort_order: 99,
    });
    if (error) throw new Error(error.message);
    await fetch();
  }, [fetch]);

  const updateItem = useCallback(async (id: string, changes: Partial<Omit<ExchangeItem, 'id'>>) => {
    const { error } = await supabase
      .from('exchange_items')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
    await fetch();
  }, [fetch]);

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase.from('exchange_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetch();
  }, [fetch]);

  return { items, loading, error, addItem, updateItem, deleteItem, refresh: fetch };
}
