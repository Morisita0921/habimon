import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin as supabase } from '../lib/supabase';

export const DEFAULT_HOME_BG = 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 30%, #E8F8FF 60%, #FFF8F0 80%, #FFE8D0 100%)';

export interface FacilitySettings {
  homeBgType: 'gradient' | 'image';
  homeBgValue: string;
}

const DEFAULTS: FacilitySettings = {
  homeBgType: 'gradient',
  homeBgValue: DEFAULT_HOME_BG,
};

export function useFacilitySettings() {
  const [settings, setSettings] = useState<FacilitySettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('facility_settings')
      .select('key, value');

    if (data && data.length > 0) {
      const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
      setSettings({
        homeBgType: (map['home_bg_type'] as 'gradient' | 'image') ?? DEFAULTS.homeBgType,
        homeBgValue: map['home_bg_value'] ?? DEFAULTS.homeBgValue,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateBackground = useCallback(async (type: 'gradient' | 'image', value: string) => {
    await supabase.from('facility_settings').upsert({ key: 'home_bg_type', value: type });
    await supabase.from('facility_settings').upsert({ key: 'home_bg_value', value });
    setSettings({ homeBgType: type, homeBgValue: value });
  }, []);

  return { settings, loading, updateBackground, refresh: fetch };
}
