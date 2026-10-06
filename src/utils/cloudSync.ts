import { InvitationRecord } from '../types';

// Cloud store ID for cross-device sync between phone & laptop
const CLOUD_STORE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1107563970734';
const LOCAL_STORAGE_KEY = 'tetehku_invitation_records';

/**
 * Fetch records synchronized across all devices (phone, laptop, etc.)
 */
export async function getCloudRecords(): Promise<InvitationRecord[]> {
  let records: InvitationRecord[] = [];

  // Try fetching from cloud first
  try {
    const res = await fetch(CLOUD_STORE_URL);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data?.records)) {
        records = json.data.records;
        // Update local cache
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
        } catch {}
        return records;
      }
    }
  } catch (err) {
    console.warn('Cloud fetch failed, using local fallback:', err);
  }

  // Fallback to local storage if offline
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}

  return records;
}

/**
 * Save record to cloud so Aa can see it immediately on laptop
 */
export async function saveCloudRecord(newRecord: InvitationRecord): Promise<void> {
  // 1. Immediately save to local storage as instant cache
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const updatedLocal = [newRecord, ...local.filter((r: any) => r.id !== newRecord.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocal));
  } catch {}

  // 2. Fetch latest from cloud, prepend, and save
  try {
    let currentRecords: InvitationRecord[] = [];
    const getRes = await fetch(CLOUD_STORE_URL);
    if (getRes.ok) {
      const json = await getRes.json();
      if (Array.isArray(json?.data?.records)) {
        currentRecords = json.data.records;
      }
    }

    const merged = [newRecord, ...currentRecords.filter((r) => r.id !== newRecord.id)];

    await fetch(CLOUD_STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'tetehku_records',
        data: { records: merged },
      }),
    });
  } catch (err) {
    console.error('Failed to sync to cloud store:', err);
  }

  // 3. Also send to optional local backend endpoint if running Express
  try {
    fetch('/api/save-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(() => {});
  } catch {}
}

/**
 * Clear all records in cloud and locally
 */
export async function clearCloudRecords(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {}

  try {
    await fetch(CLOUD_STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'tetehku_records',
        data: { records: [] },
      }),
    });
  } catch (err) {
    console.error('Failed to clear cloud store:', err);
  }
}

/**
 * Delete a single record by ID
 */
export async function deleteSingleRecord(id: string): Promise<InvitationRecord[]> {
  const current = await getCloudRecords();
  const updated = current.filter((r) => r.id !== id);

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  try {
    await fetch(CLOUD_STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'tetehku_records',
        data: { records: updated },
      }),
    });
  } catch (err) {
    console.error('Failed to delete single record from cloud:', err);
  }

  return updated;
}
