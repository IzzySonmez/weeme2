// Database service layer - Hybrid approach (localStorage + Supabase)
import { supabase } from './supabase';
import type { User, SEOReport, TrackingCode, AIContent } from '../types';
import { 
  loadCurrentUser, 
  saveUserById, 
  readJSON, 
  writeJSON,
  getCurrentSessionUserId 
} from './storage';

// Migration flag to track if user data has been synced to Supabase
const SUPABASE_SYNC_KEY = 'supabase_synced';

export class DatabaseService {
  private static instance: DatabaseService;
  private isSupabaseAvailable = false;

  private constructor() {
    this.checkSupabaseConnection();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async checkSupabaseConnection(): Promise<void> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('[DB] Supabase not configured, using localStorage only');
        this.isSupabaseAvailable = false;
        return;
      }

      // Test connection
      const { error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        console.log('[DB] Supabase connection failed, using localStorage only:', error.message);
        this.isSupabaseAvailable = false;
      } else {
        console.log('[DB] Supabase connected successfully');
        this.isSupabaseAvailable = true;
        await this.syncLocalDataToSupabase();
      }
    } catch (error) {
      console.log('[DB] Supabase check failed, using localStorage only');
      this.isSupabaseAvailable = false;
    }
  }

  // Sync existing localStorage data to Supabase (one-time migration)
  private async syncLocalDataToSupabase(): Promise<void> {
    const currentUser = loadCurrentUser();
    if (!currentUser) return;

    const syncKey = `${SUPABASE_SYNC_KEY}_${currentUser.id}`;
    const alreadySynced = localStorage.getItem(syncKey);
    
    if (alreadySynced) return;

    try {
      console.log('[DB] Syncing local data to Supabase...');
      
      // Sync user
      await this.saveUser(currentUser);
      
      // Sync reports
      const reports = readJSON<SEOReport[]>(`reports_${currentUser.id}`) || [];
      for (const report of reports) {
        await this.saveReport(report);
      }
      
      // Sync tracking codes
      const codes = readJSON<TrackingCode[]>(`trackingCodes_${currentUser.id}`) || [];
      for (const code of codes) {
        await this.saveTrackingCode(code);
      }
      
      // Sync AI content
      const aiContent = readJSON<AIContent[]>(`aiContent_${currentUser.id}`) || [];
      for (const content of aiContent) {
        await this.saveAIContent(content);
      }
      
      localStorage.setItem(syncKey, 'true');
      console.log('[DB] Local data synced to Supabase successfully');
    } catch (error) {
      console.error('[DB] Failed to sync local data to Supabase:', error);
    }
  }

  // User operations
  async saveUser(user: User): Promise<void> {
    // Always save to localStorage first (immediate)
    saveUserById(user);
    
    if (!this.isSupabaseAvailable) return;

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          username: user.username,
          email: user.email,
          membership_type: user.membershipType,
          credits: user.credits,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('[DB] Failed to save user to Supabase:', error);
      }
    } catch (error) {
      console.error('[DB] Supabase user save error:', error);
    }
  }

  async getUser(userId: string): Promise<User | null> {
    // Try localStorage first (faster)
    const localUser = loadCurrentUser();
    if (localUser && localUser.id === userId) {
      return localUser;
    }

    if (!this.isSupabaseAvailable) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      const user: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        membershipType: data.membership_type,
        credits: data.credits,
        createdAt: data.created_at
      };

      // Cache in localStorage
      saveUserById(user);
      return user;
    } catch (error) {
      console.error('[DB] Failed to get user from Supabase:', error);
      return null;
    }
  }

  // Report operations
  async saveReport(report: SEOReport): Promise<void> {
    const userId = getCurrentSessionUserId();
    if (!userId) return;

    // Save to localStorage
    const reports = readJSON<SEOReport[]>(`reports_${userId}`) || [];
    const existingIndex = reports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      reports[existingIndex] = report;
    } else {
      reports.unshift(report);
    }
    writeJSON(`reports_${userId}`, reports.slice(0, 50)); // Keep last 50

    if (!this.isSupabaseAvailable) return;

    try {
      const { error } = await supabase
        .from('seo_reports')
        .upsert({
          id: report.id,
          user_id: report.userId,
          website_url: report.websiteUrl,
          score: report.score,
          positives: report.positives,
          negatives: report.negatives,
          suggestions: report.suggestions,
          report_data: report.reportData,
          created_at: report.createdAt
        });

      if (error) {
        console.error('[DB] Failed to save report to Supabase:', error);
      }
    } catch (error) {
      console.error('[DB] Supabase report save error:', error);
    }
  }

  async getReports(userId: string): Promise<SEOReport[]> {
    // Try localStorage first
    const localReports = readJSON<SEOReport[]>(`reports_${userId}`) || [];
    
    if (!this.isSupabaseAvailable) return localReports;

    try {
      const { data, error } = await supabase
        .from('seo_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[DB] Failed to get reports from Supabase:', error);
        return localReports;
      }

      const reports: SEOReport[] = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        websiteUrl: row.website_url,
        score: row.score,
        positives: row.positives,
        negatives: row.negatives,
        suggestions: row.suggestions,
        reportData: row.report_data,
        createdAt: row.created_at
      }));

      // Update localStorage cache
      writeJSON(`reports_${userId}`, reports);
      return reports;
    } catch (error) {
      console.error('[DB] Supabase reports fetch error:', error);
      return localReports;
    }
  }

  // Tracking code operations
  async saveTrackingCode(code: TrackingCode): Promise<void> {
    const userId = getCurrentSessionUserId();
    if (!userId) return;

    // Save to localStorage
    const codes = readJSON<TrackingCode[]>(`trackingCodes_${userId}`) || [];
    const existingIndex = codes.findIndex(c => c.id === code.id);
    if (existingIndex >= 0) {
      codes[existingIndex] = code;
    } else {
      codes.push(code);
    }
    writeJSON(`trackingCodes_${userId}`, codes);

    if (!this.isSupabaseAvailable) return;

    try {
      const { error } = await supabase
        .from('tracking_codes')
        .upsert({
          id: code.id,
          user_id: code.userId,
          website_url: code.websiteUrl,
          code: code.code,
          is_active: code.isActive,
          scan_frequency: code.scanFrequency,
          last_scan: code.lastScan,
          next_scan: code.nextScan,
          created_at: code.createdAt || new Date().toISOString()
        });

      if (error) {
        console.error('[DB] Failed to save tracking code to Supabase:', error);
      }
    } catch (error) {
      console.error('[DB] Supabase tracking code save error:', error);
    }
  }

  async getTrackingCodes(userId: string): Promise<TrackingCode[]> {
    // Try localStorage first
    const localCodes = readJSON<TrackingCode[]>(`trackingCodes_${userId}`) || [];
    
    if (!this.isSupabaseAvailable) return localCodes;

    try {
      const { data, error } = await supabase
        .from('tracking_codes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[DB] Failed to get tracking codes from Supabase:', error);
        return localCodes;
      }

      const codes: TrackingCode[] = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        websiteUrl: row.website_url,
        code: row.code,
        isActive: row.is_active,
        scanFrequency: row.scan_frequency,
        lastScan: row.last_scan,
        nextScan: row.next_scan,
        createdAt: row.created_at
      }));

      // Update localStorage cache
      writeJSON(`trackingCodes_${userId}`, codes);
      return codes;
    } catch (error) {
      console.error('[DB] Supabase tracking codes fetch error:', error);
      return localCodes;
    }
  }

  async deleteTrackingCode(codeId: string): Promise<void> {
    const userId = getCurrentSessionUserId();
    if (!userId) return;

    // Remove from localStorage
    const codes = readJSON<TrackingCode[]>(`trackingCodes_${userId}`) || [];
    const filtered = codes.filter(c => c.id !== codeId);
    writeJSON(`trackingCodes_${userId}`, filtered);

    if (!this.isSupabaseAvailable) return;

    try {
      const { error } = await supabase
        .from('tracking_codes')
        .delete()
        .eq('id', codeId);

      if (error) {
        console.error('[DB] Failed to delete tracking code from Supabase:', error);
      }
    } catch (error) {
      console.error('[DB] Supabase tracking code delete error:', error);
    }
  }

  // AI Content operations
  async saveAIContent(content: AIContent): Promise<void> {
    const userId = getCurrentSessionUserId();
    if (!userId) return;

    // Save to localStorage
    const contents = readJSON<AIContent[]>(`aiContent_${userId}`) || [];
    contents.unshift(content);
    writeJSON(`aiContent_${userId}`, contents.slice(0, 100)); // Keep last 100

    if (!this.isSupabaseAvailable) return;

    try {
      const { error } = await supabase
        .from('ai_content')
        .insert({
          id: content.id,
          user_id: content.userId,
          platform: content.platform,
          prompt: content.prompt,
          content: content.content,
          created_at: content.createdAt
        });

      if (error) {
        console.error('[DB] Failed to save AI content to Supabase:', error);
      }
    } catch (error) {
      console.error('[DB] Supabase AI content save error:', error);
    }
  }

  async getAIContent(userId: string): Promise<AIContent[]> {
    // Try localStorage first
    const localContent = readJSON<AIContent[]>(`aiContent_${userId}`) || [];
    
    if (!this.isSupabaseAvailable) return localContent;

    try {
      const { data, error } = await supabase
        .from('ai_content')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[DB] Failed to get AI content from Supabase:', error);
        return localContent;
      }

      const contents: AIContent[] = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        platform: row.platform,
        prompt: row.prompt,
        content: row.content,
        createdAt: row.created_at
      }));

      // Update localStorage cache
      writeJSON(`aiContent_${userId}`, contents);
      return contents;
    } catch (error) {
      console.error('[DB] Supabase AI content fetch error:', error);
      return localContent;
    }
  }
}

export const db = DatabaseService.getInstance();