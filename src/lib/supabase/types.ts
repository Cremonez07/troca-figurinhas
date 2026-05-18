export type StickerStatus = "missing" | "duplicate";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          whatsapp: string | null;
          city: string | null;
          neighborhood: string | null;
          exchange_point: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          whatsapp?: string | null;
          city?: string | null;
          neighborhood?: string | null;
          exchange_point?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["profiles"]["Insert"], "id">>;
      };
      stickers: {
        Row: {
          id: string;
          code: string;
          country: string | null;
          player_name: string | null;
          number: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          country?: string | null;
          player_name?: string | null;
          number?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stickers"]["Insert"]>;
      };
      user_stickers: {
        Row: {
          id: string;
          user_id: string;
          sticker_id: string;
          status: StickerStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sticker_id: string;
          status: StickerStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["user_stickers"]["Insert"], "id" | "user_id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      sticker_status: StickerStatus;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Sticker = Database["public"]["Tables"]["stickers"]["Row"];
export type UserSticker = Database["public"]["Tables"]["user_stickers"]["Row"];
