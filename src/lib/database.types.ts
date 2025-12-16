/**
 * Database Type Definitions
 * Auto-generated types for Supabase tables
 */

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
          email: string;
          phone: string | null;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          gender: 'female' | 'male' | 'other' | null;
          date_of_birth: string | null;
          role: 'buyer' | 'seller' | 'admin';
          preferred_language: string;
          theme: string;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          gender?: 'female' | 'male' | 'other' | null;
          date_of_birth?: string | null;
          role?: 'buyer' | 'seller' | 'admin';
          preferred_language?: string;
          theme?: string;
          notifications_enabled?: boolean;
          last_login_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          email?: string;
          phone?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          gender?: 'female' | 'male' | 'other' | null;
          date_of_birth?: string | null;
          role?: 'buyer' | 'seller' | 'admin';
          preferred_language?: string;
          theme?: string;
          notifications_enabled?: boolean;
          last_login_at?: string | null;
          is_active?: boolean;
        };
      };
      sellers: {
        Row: {
          id: string;
          user_id: string;
          shop_name: string;
          shop_type: string;
          shop_logo_url: string | null;
          shop_description: string | null;
          business_registration_number: string | null;
          gst_number: string | null;
          pan_number: string | null;
          is_verified: boolean;
          verified_at: string | null;
          kyc_status: string;
          kyc_documents: Json | null;
          seller_level: 'new_seller' | 'trusted_vendor' | 'expert_seller' | 'glow_partner' | 'mithas_star';
          trust_score: number;
          total_sales: number;
          total_orders: number;
          average_rating: number;
          response_rate: number;
          bank_account_number: string | null;
          bank_ifsc_code: string | null;
          bank_account_name: string | null;
          upi_id: string | null;
          is_active: boolean;
          auto_accept_orders: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          shop_name: string;
          shop_type: string;
          shop_logo_url?: string | null;
          shop_description?: string | null;
          business_registration_number?: string | null;
          gst_number?: string | null;
          pan_number?: string | null;
          is_verified?: boolean;
          verified_at?: string | null;
          kyc_status?: string;
          kyc_documents?: Json | null;
          seller_level?: 'new_seller' | 'trusted_vendor' | 'expert_seller' | 'glow_partner' | 'mithas_star';
          bank_account_number?: string | null;
          bank_ifsc_code?: string | null;
          bank_account_name?: string | null;
          upi_id?: string | null;
          is_active?: boolean;
          auto_accept_orders?: boolean;
        };
        Update: {
          shop_name?: string;
          shop_type?: string;
          shop_logo_url?: string | null;
          shop_description?: string | null;
          is_verified?: boolean;
          verified_at?: string | null;
          kyc_status?: string;
          seller_level?: 'new_seller' | 'trusted_vendor' | 'expert_seller' | 'glow_partner' | 'mithas_star';
          trust_score?: number;
          total_sales?: number;
          total_orders?: number;
          average_rating?: number;
          bank_account_number?: string | null;
          bank_ifsc_code?: string | null;
          bank_account_name?: string | null;
          upi_id?: string | null;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          slug: string | null;
          description: string | null;
          category: string;
          subcategory: string | null;
          gender: 'female' | 'male' | 'other' | null;
          price: number;
          original_price: number | null;
          currency: string;
          stock: number;
          sku: string | null;
          images: string[];
          video_url: string | null;
          has_ar_model: boolean;
          ar_model_url: string | null;
          tags: string[];
          bundle_tags: string[];
          search_keywords: string | null;
          as_seen_in_reels: boolean;
          is_featured: boolean;
          views: number;
          sales: number;
          average_rating: number;
          total_reviews: number;
          is_active: boolean;
          is_draft: boolean;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          seller_id: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          category: string;
          subcategory?: string | null;
          gender?: 'female' | 'male' | 'other' | null;
          price: number;
          original_price?: number | null;
          currency?: string;
          stock?: number;
          sku?: string | null;
          images?: string[];
          video_url?: string | null;
          has_ar_model?: boolean;
          ar_model_url?: string | null;
          tags?: string[];
          bundle_tags?: string[];
          search_keywords?: string | null;
          as_seen_in_reels?: boolean;
          is_featured?: boolean;
          is_active?: boolean;
          is_draft?: boolean;
          published_at?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          category?: string;
          subcategory?: string | null;
          price?: number;
          original_price?: number | null;
          stock?: number;
          images?: string[];
          video_url?: string | null;
          has_ar_model?: boolean;
          ar_model_url?: string | null;
          tags?: string[];
          bundle_tags?: string[];
          as_seen_in_reels?: boolean;
          is_featured?: boolean;
          is_active?: boolean;
          is_draft?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          buyer_id: string;
          seller_id: string;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          subtotal: number;
          tax: number;
          shipping_fee: number;
          discount: number;
          total: number;
          currency: string;
          shipping_address_id: string | null;
          billing_address_id: string | null;
          payment_method: string | null;
          payment_status: string;
          payment_id: string | null;
          tracking_number: string | null;
          estimated_delivery: string | null;
          delivered_at: string | null;
          notes: string | null;
          customer_notes: string | null;
          created_at: string;
          updated_at: string;
          cancelled_at: string | null;
          cancellation_reason: string | null;
        };
        Insert: {
          buyer_id: string;
          seller_id: string;
          subtotal: number;
          tax?: number;
          shipping_fee?: number;
          discount?: number;
          total: number;
          currency?: string;
          shipping_address_id?: string | null;
          billing_address_id?: string | null;
          payment_method?: string | null;
          payment_status?: string;
          payment_id?: string | null;
          notes?: string | null;
          customer_notes?: string | null;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          delivered_at?: string | null;
          payment_status?: string;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
        };
      };
      cart: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string | null;
          seller_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          variant_id?: string | null;
          seller_id?: string | null;
          quantity?: number;
        };
        Update: {
          quantity?: number;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string | null;
          seller_id: string | null;
          order_id: string | null;
          rating: number;
          title: string | null;
          comment: string | null;
          images: string[];
          is_verified_purchase: boolean;
          helpful_count: number;
          is_approved: boolean;
          is_flagged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          product_id?: string | null;
          seller_id?: string | null;
          order_id?: string | null;
          rating: number;
          title?: string | null;
          comment?: string | null;
          images?: string[];
          is_verified_purchase?: boolean;
        };
        Update: {
          rating?: number;
          title?: string | null;
          comment?: string | null;
          images?: string[];
          helpful_count?: number;
          is_approved?: boolean;
          is_flagged?: boolean;
        };
      };
      chats: {
        Row: {
          id: string;
          chat_type: 'ai_stylist' | 'community' | 'vendor_dm';
          user_id: string;
          vendor_id: string | null;
          title: string | null;
          last_message: string | null;
          last_message_at: string | null;
          unread_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          chat_type: 'ai_stylist' | 'community' | 'vendor_dm';
          user_id: string;
          vendor_id?: string | null;
          title?: string | null;
        };
        Update: {
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          is_active?: boolean;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          content: string;
          message_type: string;
          attachments: Json | null;
          translated_content: Json | null;
          sentiment_score: number | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          chat_id: string;
          sender_id: string;
          content: string;
          message_type?: string;
          attachments?: Json | null;
          translated_content?: Json | null;
          sentiment_score?: number | null;
        };
        Update: {
          is_read?: boolean;
          read_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'order' | 'message' | 'promotion' | 'system' | 'review';
          title: string;
          message: string;
          related_id: string | null;
          action_url: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: 'order' | 'message' | 'promotion' | 'system' | 'review';
          title: string;
          message: string;
          related_id?: string | null;
          action_url?: string | null;
        };
        Update: {
          is_read?: boolean;
          read_at?: string | null;
        };
      };
      reels: {
        Row: {
          id: string;
          creator_id: string;
          seller_id: string | null;
          video_url: string;
          thumbnail_url: string | null;
          caption: string | null;
          hashtags: string[];
          tagged_products: string[];
          views: number;
          likes: number;
          shares: number;
          comments: number;
          creator_level: string | null;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          creator_id: string;
          seller_id?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          hashtags?: string[];
          tagged_products?: string[];
          creator_level?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
        };
        Update: {
          caption?: string | null;
          hashtags?: string[];
          tagged_products?: string[];
          views?: number;
          likes?: number;
          shares?: number;
          comments?: number;
          is_active?: boolean;
          is_featured?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'buyer' | 'seller' | 'admin';
      gender_type: 'female' | 'male' | 'other';
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
      seller_level: 'new_seller' | 'trusted_vendor' | 'expert_seller' | 'glow_partner' | 'mithas_star';
      chat_type: 'ai_stylist' | 'community' | 'vendor_dm';
      notification_type: 'order' | 'message' | 'promotion' | 'system' | 'review';
    };
  };
}
