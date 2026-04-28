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
  userId:      string;
  edition:     string;
  nfcId?:      string;
  status:      'pending' | 'shipped' | 'active' | 'inactive';
  orderedAt:   string;
  activatedAt?: string;
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

// Collection: modules/{uid}_{type}
export interface ModuleDoc {
  profileId: string;
  type:      string;
  isActive:  boolean;
  config?:   Record<string, unknown>;
  updatedAt: string;
}
