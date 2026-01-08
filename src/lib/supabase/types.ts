// Database types - Updated to match migrations 007 and 008 (Corbin Method)
// To regenerate: npx supabase gen types typescript --project-id rziohajwncqcgzorjqff > src/lib/supabase/types.ts
// Or locally: npx supabase gen types typescript --local > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Cookie consent preferences type
export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          owner_id: string;
          plan: 'free' | 'creator' | 'studio';
          blots: number;
          plan_blots: number;
          blots_reset_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          payment_failed_at: string | null;
          commercial_projects_used: number;
          storage_used_bytes: number;
          storage_limit_bytes: number;
          disabled_at: string | null;
          created_at: string;
          updated_at: string;
          // Compliance fields (migration 009)
          country: string | null;
          referral_source: string | null;
          marketing_consent: boolean;
          cookie_consent: CookieConsent | null;
          accepted_terms_at: string | null;
          accepted_privacy_at: string | null;
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
          audience: string[];
          style_preset: 'bold-simple' | 'kawaii' | 'whimsical' | 'cartoon' | 'botanical' | 'mandala' | 'fantasy' | 'gothic' | 'cozy' | 'geometric' | 'wildlife' | 'floral' | 'abstract';
          line_weight: 'thick' | 'medium' | 'fine';
          complexity: 'minimal' | 'moderate' | 'detailed' | 'intricate';
          style_anchor_key: string | null;
          style_anchor_description: string | null;
          status: 'draft' | 'calibrating' | 'generating' | 'ready' | 'exported';
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      heroes: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          audience: string[];
          compiled_prompt: string;
          negative_prompt: string | null;
          reference_key: string;
          thumbnail_key: string | null;
          style_preset: string | null;
          times_used: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['heroes']['Row'], 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'times_used'>;
        Update: Partial<Database['public']['Tables']['heroes']['Insert']>;
      };
      pages: {
        Row: {
          id: string;
          project_id: string;
          sort_order: number;
          page_type: 'illustration' | 'text-focus' | 'pattern' | 'educational';
          current_version: number;
          scene_brief: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pages']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pages']['Insert']>;
      };
      page_versions: {
        Row: {
          id: string;
          page_id: string;
          version: number;
          asset_key: string;
          thumbnail_key: string | null;
          compiled_prompt: string;
          negative_prompt: string | null;
          seed: string | null;
          compiler_snapshot: Json | null;
          quality_score: number | null;
          quality_status: 'pass' | 'needs_review' | 'fail' | null;
          edit_type: 'initial' | 'regenerate' | 'inpaint' | 'quick_action' | null;
          edit_prompt: string | null;
          edit_mask_key: string | null;
          blots_spent: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['page_versions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['page_versions']['Insert']>;
      };
      jobs: {
        Row: {
          id: string;
          owner_id: string;
          project_id: string | null;
          type: 'generation' | 'export' | 'hero_creation' | 'calibration';
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          total_items: number;
          completed_items: number;
          failed_items: number;
          blots_reserved: number;
          blots_spent: number;
          blots_refunded: number;
          error_message: string | null;
          error_code: string | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
      };
      job_items: {
        Row: {
          id: string;
          job_id: string;
          page_id: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
          retry_count: number;
          asset_key: string | null;
          error_message: string | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['job_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['job_items']['Insert']>;
      };
      assets: {
        Row: {
          id: string;
          owner_id: string;
          type: 'page' | 'thumbnail' | 'hero' | 'hero_thumbnail' | 'style_anchor' | 'export_pdf' | 'export_svg';
          r2_key: string;
          size_bytes: number;
          content_type: string | null;
          project_id: string | null;
          hero_id: string | null;
          page_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['assets']['Insert']>;
      };
      blot_transactions: {
        Row: {
          id: string;
          owner_id: string;
          type: 'subscription_reset' | 'subscription_upgrade' | 'generation' | 'edit' | 'hero' | 'calibration' | 'refund';
          subscription_delta: number;
          pack_delta: number;
          description: string | null;
          job_id: string | null;
          stripe_session_id: string | null;
          stripe_invoice_id: string | null;
          pack_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blot_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['blot_transactions']['Insert']>;
      };
      global_config: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['global_config']['Row'];
        Update: Partial<Database['public']['Tables']['global_config']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_available_blots: {
        Args: { user_id: string };
        Returns: number;
      };
      deduct_blots: {
        Args: {
          user_id: string;
          amount: number;
          tx_type?: string;
          tx_description?: string;
          tx_job_id?: string;
        };
        Returns: boolean;
      };
      reset_subscription_blots: {
        Args: {
          user_id: string;
          new_amount: number;
          invoice_id?: string;
        };
        Returns: void;
      };
      add_upgrade_blots: {
        Args: {
          user_id: string;
          blot_difference: number;
          invoice_id?: string;
        };
        Returns: void;
      };
      refund_blots: {
        Args: {
          user_id: string;
          amount: number;
          p_job_id: string;
          reason: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type aliases for convenience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Hero = Database['public']['Tables']['heroes']['Row'];
export type Page = Database['public']['Tables']['pages']['Row'];
export type PageVersion = Database['public']['Tables']['page_versions']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobItem = Database['public']['Tables']['job_items']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type BlotTransaction = Database['public']['Tables']['blot_transactions']['Row'];
export type GlobalConfig = Database['public']['Tables']['global_config']['Row'];

// Plan type for use across the application
export type Plan = 'free' | 'creator' | 'studio';

// Project status type
export type ProjectStatus = 'draft' | 'calibrating' | 'generating' | 'ready' | 'exported';

// Job status type
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Job type
export type JobType = 'generation' | 'export' | 'hero_creation' | 'calibration';

// Audience type
export type Audience = 'toddler' | 'children' | 'tween' | 'teen' | 'adult';

// Style preset type
export type StylePreset = 'bold-simple' | 'kawaii' | 'whimsical' | 'cartoon' | 'botanical';

// Trim size type
export type TrimSize = '8.5x11' | '8.5x8.5' | '6x9';
