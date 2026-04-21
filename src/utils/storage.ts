import type { Facility, User } from '../types';
import { createSampleData } from '../data/sampleData';

const STORAGE_KEY = 'habimon-data';

// 旧データに新しいフィールド（アカシコイン関連・交換申請）を補完する
function migrateUser(user: User): User {
  return {
    ...user,
    akashiCoins: user.akashiCoins ?? 0,
    ownedCosmetics: user.ownedCosmetics ?? [],
    equippedCosmetics: user.equippedCosmetics ?? [],
    coinHistory: user.coinHistory ?? [],
    exchangeRequests: user.exchangeRequests ?? [],
  };
}

function migrateFacility(facility: Facility): Facility {
  return {
    ...facility,
    users: facility.users.map(migrateUser),
  };
}

export function loadFacility(): Facility {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Facility;
      return migrateFacility(parsed);
    }
  } catch {
    // ignore parse errors
  }
  const data = createSampleData();
  saveFacility(data);
  return data;
}

export function saveFacility(facility: Facility): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(facility));
}

export function resetData(): Facility {
  localStorage.removeItem(STORAGE_KEY);
  const data = createSampleData();
  saveFacility(data);
  return data;
}
