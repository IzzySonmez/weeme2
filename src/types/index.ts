export interface User {
  id: string;
  username: string;
  email: string;
  membershipType: 'Free' | 'Pro' | 'Advanced';
  credits: number;
  createdAt: string;
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
  reportData: {
    metaTags: boolean;
    headings: boolean;
    images: boolean;
    performance: number;
    mobileOptimization: boolean;
    sslCertificate: boolean;
    pageSpeed: number;
    keywords: string[];
  };
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

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  credits: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface AIContent {
  id: string;
  userId: string;
  platform: 'linkedin' | 'instagram' | 'twitter' | 'facebook';
  prompt: string;
  content: string;
  createdAt: string;
}

export interface MembershipFeatures {
  Free: {
    credits: 3;
    seoReports: true;
    aiContent: false;
    aiSuggestions: false;
  };
  Pro: {
    credits: -1; // unlimited
    seoReports: true;
    aiContent: false;
    aiSuggestions: true;
  };
  Advanced: {
    credits: -1; // unlimited
    seoReports: true;
    aiContent: true;
    aiSuggestions: true;
  };
}