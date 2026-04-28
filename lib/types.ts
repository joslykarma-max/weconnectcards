// Firestore data model types
// Collection: users/{uid}
export interface UserDoc {
  email:       string;
  displayName: string;
  plan:        'essentiel' | 'pro' | 'equipe';
  createdAt:   string; // ISO date
}

// Collection: profiles/{uid}
export interface ProfileDoc {
  uid:         string;
  username:    string;
  displayName: string;
  title?:      string;
  company?:    string;
  bio?:        string;
  avatar?:     string;
  theme:       'midnight' | 'electric' | 'glass' | 'metal';
  isPublic:    boolean;
  updatedAt:   string;
}

// Sub-collection: profiles/{uid}/links/{linkId}
export interface LinkDoc {
  id:       string;
  type:     string;
  label:    string;
  url:      string;
  icon?:    string;
  order:    number;
  isActive: boolean;
}

// Collection: scans/{scanId}
export interface ScanDoc {
  userId:    string;
  device:    string;
  country?:  string;
  userAgent: string;
  scannedAt: string; // ISO date
}

// Collection: linkClicks/{clickId}
export interface LinkClickDoc {
  linkId:    string;
  profileId: string;
  device:    string;
  clickedAt: string;
}

// Collection: savedContacts/{contactId}
export interface SavedContactDoc {
  profileId: string;
  device:    string;
  savedAt:   string;
  name?:     string;
  email?:    string;
  phone?:    string;
}

// Collection: cards/{cardId}
export interface CardDoc {
  userId:        string;
  edition:       string;
  nfcId?:        string;
  status:        'pending' | 'shipped' | 'active' | 'inactive';
  orderedAt:     string;
  activatedAt?:  string;
  accessCardId?: string; // links to accessCards/{userId}_{accessCardId}
  memberCardId?: string; // links to memberCards/{userId}_{memberCardId}
}

// Collection: teams/{ownerUid}
export interface TeamDoc {
  name:      string;
  ownerId:   string;
  createdAt: string;
}

// Sub-collection: teams/{ownerUid}/members/{memberEmail}
export interface TeamMemberDoc {
  email:       string;
  displayName?: string;
  role:        'admin' | 'member';
  status:      'pending' | 'active';
  uid?:        string;
  invitedAt:   string;
  joinedAt?:   string;
}

// Loyalty reward tier
export interface RewardTier {
  stamps: number;
  reward: string;
}

// Collection: loyaltyCards/{profileId}_{phone}
export interface LoyaltyCardDoc {
  profileId:    string;
  phone:        string;
  stamps:       number;
  createdAt:    string;
  lastStampAt?: string;
}

// Menu module sub-types
export interface MenuItem {
  id:          string;
  name:        string;
  description: string;
  price:       number;
  emoji:       string;
  available:   boolean;
  imageUrl?:   string;
}

export interface MenuCategory {
  id:    string;
  name:  string;
  emoji: string;
  items: MenuItem[];
}

// Event module sub-types
export interface TicketType {
  id:           string;
  name:         string;
  description?: string;
  price:        number;
  capacity:     number;
}

export interface AgendaItem {
  id:       string;
  time:     string; // HH:mm
  title:    string;
  speaker?: string;
}

// Collection: eventRegistrations/{profileId}_{normalizedPhone}
export interface EventRegistration {
  profileId:      string;
  name:           string;
  email?:         string;
  phone:          string;
  ticketTypeId:   string;
  ticketTypeName: string;
  ticketPrice:    number;
  registeredAt:   string;
}

// Access module sub-types
export interface AccessZone {
  id:                  string;
  name:                string;
  emoji:               string;
  accessType:          'libre' | 'pin' | 'whatsapp';
  pinHash?:            string; // SHA-256 of PIN, never raw
  whatsapp?:           string;
  schedule: {
    days:      string[]; // ['lun','mar',...]
    startTime: string;   // 'HH:mm'
    endTime:   string;
    allDay:    boolean;
  };
  afterAccessMessage?: string;
  emergencyContact?:   string;
}

// Collection: accessCards/{profileId}_{cardId}
export interface AccessCardDoc {
  id:          string;
  profileId:   string;
  holderTitle: string;
  holderName:  string;
  holderRole:  string;
  holderPhoto: string;
  isActive:    boolean;
  createdAt:   string;
  nfcId?:      string; // linked physical NFC card ID
}

// Collection: accessLogs/{autoId}
export interface AccessLog {
  profileId:   string;
  zoneId:      string;
  zoneName:    string;
  status:      'granted' | 'denied';
  device:      string;
  timestamp:   string;
  cardId?:     string;
  holderName?: string;
}

// Collection: memberCards/{profileId}_{cardId}
export interface MemberCardDoc {
  id:          string;
  profileId:   string;
  memberName:  string;
  memberId:    string;    // custom member number, e.g. "CDE-2025-001"
  level:       'silver' | 'gold' | 'platinum' | 'vip';
  expiryDate?: string;    // YYYY-MM-DD
  photoUrl?:   string;
  isActive:    boolean;
  createdAt:   string;
  nfcId?:      string;    // linked physical NFC card ID
}

// Collection: modules/{uid}_{type}
export interface ModuleDoc {
  profileId: string;
  type:      string;
  isActive:  boolean;
  config?:   Record<string, unknown>;
  updatedAt: string;
}

// ── QR Codes ─────────────────────────────────────────────────────────────────
export type QrType = 'url' | 'text' | 'wifi' | 'contact' | 'email' | 'phone';

// Collection: qrCodes/{qrId}
export interface QrCodeDoc {
  id:             string;
  userId:         string;
  type:           QrType;
  label:          string;
  data:           string;        // QR payload (tracking URL for Pro URL codes)
  targetUrl?:     string;        // original destination (Pro URL type only)
  fgColor:        string;
  bgColor:        string;
  dataUrl:        string;        // base64 PNG preview
  size:           number;
  ecLevel:        'L' | 'M' | 'Q' | 'H';
  createdAt:      string;
  scanCount:      number;
  lastScannedAt?: string;
}

// Collection: qrScans/{autoId}
export interface QrScanDoc {
  qrId:       string;
  userId:     string;
  scannedAt:  string;
  device:     'mobile' | 'desktop' | 'unknown';
  userAgent?: string;
}
