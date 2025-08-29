// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import { config } from './config';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'weeme-ai@1.0.0'
    }
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          membership_type: 'Free' | 'Pro' | 'Advanced';
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          membership_type?: 'Free' | 'Pro' | 'Advanced';
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          membership_type?: 'Free' | 'Pro' | 'Advanced';
          credits?: number;
          updated_at?: string;
        };
      };
      seo_reports: {
        Row: {
          id: string;
          user_id: string;
          website_url: string;
          score: number;
          positives: string[];
          negatives: string[];
          suggestions: string[];
          report_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          website_url: string;
          score: number;
          positives: string[];
          negatives: string[];
          suggestions: string[];
          report_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          website_url?: string;
          score?: number;
          positives?: string[];
          negatives?: string[];
          suggestions?: string[];
          report_data?: any;
        };
      };
      tracking_codes: {
        Row: {
          id: string;
          user_id: string;
          website_url: string;
          code: string;
          is_active: boolean;
          scan_frequency: 'weekly' | 'biweekly' | 'monthly';
          last_scan: string;
          next_scan: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          website_url: string;
          code: string;
          is_active?: boolean;
          scan_frequency?: 'weekly' | 'biweekly' | 'monthly';
          last_scan?: string;
          next_scan?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          website_url?: string;
          code?: string;
          is_active?: boolean;
          scan_frequency?: 'weekly' | 'biweekly' | 'monthly';
          last_scan?: string;
          next_scan?: string;
        };
      };
      ai_content: {
        Row: {
          id: string;
          user_id: string;
          platform: 'linkedin' | 'instagram' | 'twitter' | 'facebook';
          prompt: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: 'linkedin' | 'instagram' | 'twitter' | 'facebook';
          prompt: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: 'linkedin' | 'instagram' | 'twitter' | 'facebook';
          prompt?: string;
          content?: string;
        };
      };
    };
  };
}