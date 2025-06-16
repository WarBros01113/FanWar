import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with fallback handling
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      // Disable auth since we're using anonymous access
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Check if configuration is valid
const isConfigured = supabaseUrl && supabaseKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseKey !== 'placeholder-key';

if (!isConfigured) {
  console.warn('Supabase configuration missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
}

// Database types
export interface War {
  id: string;
  team1: string;
  team2: string;
  created_at: string;
  total_comments: number;
}

export interface Comment {
  id: string;
  war_id: string;
  content: string;
  votes: number;
  created_at: string;
}

// API functions for wars
export const warsApi = {
  // Get all wars ordered by recent activity
  async getWars(): Promise<War[]> {
    if (!isConfigured) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('wars')
      .select('*')
      .order('total_comments', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create a new war
  async createWar(team1: string, team2: string): Promise<War> {
    if (!isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('wars')
      .insert([{ team1: team1.trim(), team2: team2.trim() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get a single war by ID
  async getWar(id: string): Promise<War | null> {
    if (!isConfigured) {
      console.warn('Supabase not configured, returning null');
      return null;
    }

    const { data, error } = await supabase
      .from('wars')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
};

// API functions for comments
export const commentsApi = {
  // Get all comments for a war
  async getComments(warId: string): Promise<Comment[]> {
    if (!isConfigured) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('war_id', warId)
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create a new comment
  async createComment(warId: string, content: string): Promise<Comment> {
    if (!isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{ war_id: warId, content: content.trim() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update comment votes
  async updateVotes(commentId: string, newVotes: number): Promise<void> {
    if (!isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('comments')
      .update({ votes: newVotes })
      .eq('id', commentId);
    
    if (error) throw error;
  },
};