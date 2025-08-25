// src/types/index.ts
export type MembershipType = 'Free' | 'Pro' | 'Advanced';

export interface User {
  id: string;
  username: string;
  email: string;
  membershipType: MembershipType;
  credits: number;           // sadece Free için anlamlı
  createdAt: string;
}

export interface TrackingCode {
  id: string;
  userId: string;
  websiteUrl: string;
  code: string;
  isActive: boolean;
  scanFrequency: 'weekly' | 'biweekly' | 'monthly';
  lastScan: string;
  nextScan: string;
}

export interface SEOReport {
  id: string;
  userId: string;
  websiteUrl: string;
  score: number;
  positives: string[];
  negatives: string[];
  suggestions: string[];
  createdAt: string;
  reportData: Record<string, unknown>;
}

export type SocialPlatform = 'linkedin' | 'instagram' | 'twitter' | 'facebook';

export interface AIContent {
  id: string;
  userId: string;
  platform: SocialPlatform;
  prompt: string;
  content: string;
  createdAt: string;
}
