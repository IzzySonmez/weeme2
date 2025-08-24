// src/lib/storage.ts

// ---- Keys & Versions ----
const STORAGE_VERSION_KEY = 'storage_version';
const STORAGE_VERSION = '1'; // v1
const SESSION_USER_ID_KEY = 'currentSessionUserId';
const USER_INDEX_KEY = 'userIndex'; // username -> userId mapping

export type MembershipType = 'Free' | 'Pro' | 'Advanced';

export interface PersistedUser {
  id: string;
  username: string;
  email: string;
  membershipType: MembershipType;
  credits: number;
  createdAt: string;
}

const userKey = (id: string) => `user_${id}`;

// ---- Helpers ----
export const readJSON = <T = any>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const writeJSON = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeKey = (key: string) => {
  localStorage.removeItem(key);
};

// ---- Index & Session ----
export const getUserIndex = (): Record<string, string> => readJSON(USER_INDEX_KEY) || {};
export const setUserIndex = (index: Record<string, string>) => writeJSON(USER_INDEX_KEY, index);

export const getCurrentSessionUserId = (): string | null => localStorage.getItem(SESSION_USER_ID_KEY);
export const setCurrentSessionUserId = (id: string | null) => {
  if (!id) localStorage.removeItem(SESSION_USER_ID_KEY);
  else localStorage.setItem(SESSION_USER_ID_KEY, id);
};

// ---- User CRUD ----
export const loadUserById = (id: string): PersistedUser | null => readJSON<PersistedUser>(userKey(id));
export const saveUserById = (u: PersistedUser) => writeJSON(userKey(u.id), u);

// ---- Migration v0 -> v1 ----
/**
 * v0'da sadece "user" anahtarı olabilir (aktif kullanıcı).
 * v1'de kullanıcılar user_<id> altında, username->id index'i ve currentSessionUserId ile yönetilir.
 */
export const migrateStorage = () => {
  const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  if (currentVersion === STORAGE_VERSION) return;

  // v0: "user" -> v1: user_<id>, userIndex, currentSessionUserId
  const v0User = readJSON<PersistedUser>('user');
  if (v0User && v0User.id) {
    // userIndex güncelle
    const index = getUserIndex();
    index[v0User.username] = v0User.id;
    setUserIndex(index);

    // kalıcı kullanıcı kaydı
    saveUserById(v0User);

    // aktif oturum
    setCurrentSessionUserId(v0User.id);

    // Eski "user" anahtarını temizle (aktif oturumu artık SESSION_USER_ID_KEY tutuyor)
    removeKey('user');
  }

  // Diğer veriler (reports_<id>, trackingCode_<id>, aiContent_<id>, aiSeoHistory_<id>) zaten id bazlı kullanılıyor → dokunmuyoruz.

  localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
};

// ---- Load current user from session ----
export const loadCurrentUser = (): PersistedUser | null => {
  const id = getCurrentSessionUserId();
  if (!id) return null;
  return loadUserById(id);
};
