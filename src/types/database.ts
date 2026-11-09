/**
 * Typed description of the Supabase schema (see supabase/migrations).
 * Used as generic for `createClient<Database>()` so every query in the services is type checked.
 *
 * Nullable database columns are typed as `T | null` here because that is what Postgres returns;
 * the services convert them to optional (`undefined`) fields before data reaches the UI.
 */
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
        };
        Insert: {
          id: string;
          sticker_number: number;
          make: string;
          model: string;
          category: string;
          rarity: string;
        };
        Update: {
          make?: string;
          model?: string;
        };
        Relationships: [];
      };
      owner_cars: {
        Row: {
          id: string;
          owner_id: string;
          make: string;
          model: string;
          nickname: string | null;
          plate_hint: string;
          show_plate: boolean;
          plate_display: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          make: string;
          model: string;
          nickname?: string | null;
          plate_input: string;
          show_plate?: boolean;
        };
        Update: {
          nickname?: string | null;
          plate_input?: string | null;
          show_plate?: boolean;
        };
        Relationships: [];
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
          owner_car_id: string | null;
          vanity_plate: string | null;
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
          plate_input?: string | null;
        };
        Update: {
          car_model_id?: string | null;
          make?: string;
          model?: string;
          location_label?: string | null;
          notes?: string | null;
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
    // Business logic lives in triggers; the only RPC is the GDPR account deletion.
    // `{}` = "no entries" here (the Supabase generator writes `[_ in never]: never`; the course
    // guidelines ask to avoid `never`, so the empty object type is used deliberately).
    /* eslint-disable @typescript-eslint/no-empty-object-type */
    Views: {};
    Functions: {
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
