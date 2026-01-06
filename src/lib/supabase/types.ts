// Database types will be generated from Supabase
// Run: npx supabase gen types typescript --project-id rziohajwncqcgzorjqff > src/lib/supabase/types.ts
// Or locally: npx supabase gen types typescript --local > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          owner_id: string;
          plan: 'free' | 'starter' | 'creator' | 'pro';
          blots: number;
          blots_reset_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          storage_used_bytes: number;
          storage_limit_bytes: number;
          disabled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          hero_id: string | null;
          name: string;
          description: string | null;
          page_count: number;
          trim_size: '8.5x11' | '8.5x8.5' | '6x9';
          audience: 'toddler' | 'children' | 'tween' | 'teen' | 'adult';
          style_preset: 'bold-simple' | 'kawaii' | 'whimsical' | 'cartoon' | 'botanical';
          line_weight: 'thick' | 'medium' | 'fine';
          complexity: 'minimal' | 'moderate' | 'detailed' | 'intricate';
          style_anchor_key: string | null;
          style_anchor_description: string | null;
          status: 'draft' | 'generating' | 'ready' | 'exported';
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      // Add other tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Placeholder - regenerate with: npx supabase gen types typescript --project-id rziohajwncqcgzorjqff
