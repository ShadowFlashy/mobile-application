/**
 * Typed description of the Supabase schema (see supabase/migrations, v1 + v2 + Appendix E).
 * Used as generic for `createClient<Database>()` so every query in the services is type checked.
 *
 * Nullable database columns are typed as `T | null` here because that is what Postgres returns;
 * the services convert them to optional (`undefined`) fields before data reaches the UI.
 * `Insert` and `Update` follow the column grants of the migration: a column a client may not write
 * is simply not listed.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
        };
        Update: {
          username?: string;
        };
        Relationships: [];
      };
      car_models: {
        Row: {
          id: string;
          sticker_number: number;
          make: string;
          model: string;
          category: string;
          rarity: string;
          body_style: string;
          country: string;
          season: number;
          year_from: number | null;
          year_to: number | null;
        };
        // Read-only for clients (seeded in the SQL editor).
        Insert: {
          id: string;
          sticker_number: number;
          make: string;
          model: string;
          category: string;
          rarity: string;
          body_style?: string;
          country?: string;
          season?: number;
          year_from?: number | null;
          year_to?: number | null;
        };
        Update: {
          make?: string;
          model?: string;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          number: number;
          sort: number;
        };
        // Read-only for clients (seeded by supabase/seed_collections.sql).
        Insert: {
          id: string;
          number: number;
          sort?: number;
        };
        Update: {
          number?: number;
          sort?: number;
        };
        Relationships: [];
      };
      collection_models: {
        Row: {
          collection_id: string;
          car_model_id: string;
        };
        Insert: {
          collection_id: string;
          car_model_id: string;
        };
        Update: {
          collection_id?: string;
          car_model_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'collection_models_collection_id_fkey';
            columns: ['collection_id'];
            isOneToOne: false;
            referencedRelation: 'collections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'collection_models_car_model_id_fkey';
            columns: ['car_model_id'];
            isOneToOne: false;
            referencedRelation: 'car_models';
            referencedColumns: ['id'];
          },
        ];
      };
      owner_cars: {
        Row: {
          id: string;
          owner_id: string;
          make: string;
          model: string;
          nickname: string | null;
          plate_hint: string;
          /** @deprecated v1 flag, kept in sync with visibility = 'vanity' by the trigger. */
          show_plate: boolean;
          plate_display: string | null;
          visibility: string;
          shoutout: string | null;
          pings_paused: boolean;
          verified_at: string | null;
          verify_expires_at: string | null;
          car_model_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          make: string;
          model: string;
          nickname?: string | null;
          plate_input: string;
          show_plate?: boolean;
          visibility?: string;
          shoutout?: string | null;
          car_model_id?: string | null;
        };
        Update: {
          nickname?: string | null;
          plate_input?: string | null;
          show_plate?: boolean;
          visibility?: string;
          shoutout?: string | null;
          pings_paused?: boolean;
          car_model_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'owner_cars_car_model_id_fkey';
            columns: ['car_model_id'];
            isOneToOne: false;
            referencedRelation: 'car_models';
            referencedColumns: ['id'];
          },
        ];
      };
      spots: {
        Row: {
          id: string;
          user_id: string;
          car_model_id: string | null;
          make: string;
          model: string;
          photo_path: string;
          location_label: string | null;
          notes: string | null;
          spotted_at: string;
          /** @deprecated always null in v2 (matches live in private.spot_matches). */
          owner_car_id: string | null;
          /** @deprecated always null in v2 (read the showcase through get_spot_showcase). */
          vanity_plate: string | null;
          city: string | null;
          paint: string;
          body_style: string;
          plates_hidden: number;
          identified_by: string;
          ai_confidence: number | null;
          ai_model_id: string | null;
          generation: string | null;
          year_from: number | null;
          year_to: number | null;
          photo_hash: string | null;
          share_name_with_owner: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          car_model_id?: string | null;
          make: string;
          model: string;
          photo_path: string;
          location_label?: string | null;
          notes?: string | null;
          spotted_at?: string;
          /** Write-only: hashed and cleared by the trigger, never stored. */
          plate_input?: string | null;
          city?: string | null;
          paint?: string;
          body_style?: string;
          plates_hidden?: number;
          identified_by?: string;
          ai_confidence?: number | null;
          ai_model_id?: string | null;
          generation?: string | null;
          year_from?: number | null;
          year_to?: number | null;
          photo_hash?: string | null;
          share_name_with_owner?: boolean;
        };
        Update: {
          car_model_id?: string | null;
          make?: string;
          model?: string;
          location_label?: string | null;
          notes?: string | null;
          city?: string | null;
          paint?: string;
          body_style?: string;
          identified_by?: string;
          generation?: string | null;
          year_from?: number | null;
          year_to?: number | null;
          share_name_with_owner?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'spots_car_model_id_fkey';
            columns: ['car_model_id'];
            isOneToOne: false;
            referencedRelation: 'car_models';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'spots_ai_model_id_fkey';
            columns: ['ai_model_id'];
            isOneToOne: false;
            referencedRelation: 'car_models';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'spots_owner_car_id_fkey';
            columns: ['owner_car_id'];
            isOneToOne: false;
            referencedRelation: 'owner_cars';
            referencedColumns: ['id'];
          },
        ];
      };
      spot_notifications: {
        Row: {
          id: string;
          owner_id: string;
          owner_car_id: string;
          spot_id: string;
          created_at: string;
          read_at: string | null;
          car_label: string;
          city: string | null;
          spotted_hour: string | null;
          photo_path: string | null;
          spotter_name: string | null;
          /** Per-car HMAC pseudonym of the spotter (dedupe); the app never selects it. */
          spotter_key: string | null;
        };
        Insert: {
          owner_id: string;
          owner_car_id: string;
          spot_id: string;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'spot_notifications_owner_car_id_fkey';
            columns: ['owner_car_id'];
            isOneToOne: false;
            referencedRelation: 'owner_cars';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'spot_notifications_spot_id_fkey';
            columns: ['spot_id'];
            isOneToOne: false;
            referencedRelation: 'spots';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    // Business logic lives in triggers and RPCs. `{}` = "no entries" here (the Supabase generator
    // writes `[_ in never]: never`; the course guidelines ask to avoid `never`, so the empty object
    // type is used deliberately). complete_owner_verification is left out on purpose: only the
    // service role may call it.
    /* eslint-disable @typescript-eslint/no-empty-object-type */
    Views: {};
    Functions: {
      start_owner_verification: {
        Args: { p_car_id: string };
        Returns: { code: string; expires_at: string }[];
      };
      get_spot_showcase: {
        Args: { p_spot_id: string };
        Returns: { visibility: string; shoutout: string | null; vanity_plate: string | null }[];
      };
      get_owner_car_stats: {
        Args: {};
        Returns: {
          owner_car_id: string;
          sightings: number;
          unread: number;
          last_city: string | null;
          last_seen: string | null;
        }[];
      };
      consume_identify_quota: {
        Args: {};
        Returns: number;
      };
      identify_quota_status: {
        Args: {};
        Returns: { remaining: number; daily_limit: number }[];
      };
      export_my_data: {
        Args: {};
        Returns: Json;
      };
      delete_my_account: {
        Args: {};
        Returns: undefined;
      };
    };
    Enums: {};
    CompositeTypes: {};
    /* eslint-enable @typescript-eslint/no-empty-object-type */
  };
}
