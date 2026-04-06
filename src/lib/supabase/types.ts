// Manual types for Supabase — replace with auto-generated types when DB is live:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts

export type ProductCategory = 'flower' | 'hash' | 'extraction' | 'vape' | 'edible' | 'beverage' | 'accessory'

export type Database = {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string
          name: string
          legal_name: string | null
          tax_id: string | null
          address: string | null
          city: string | null
          country_code: string
          timezone: string
          default_locale: string
          receipt_locale: string
          currency: string
          default_daily_limit_grams: number
          default_monthly_limit_grams: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          legal_name?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          country_code?: string
          timezone?: string
          default_locale?: string
          receipt_locale?: string
          currency?: string
          default_daily_limit_grams?: number
          default_monthly_limit_grams?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          legal_name?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          country_code?: string
          timezone?: string
          default_locale?: string
          receipt_locale?: string
          currency?: string
          default_daily_limit_grams?: number
          default_monthly_limit_grams?: number
          updated_at?: string
        }
      }
      staff_users: {
        Row: {
          id: string
          shop_id: string
          full_name: string
          email: string | null
          pin_hash: string
          role: 'admin' | 'attendant'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          full_name: string
          email?: string | null
          pin_hash: string
          role: 'admin' | 'attendant'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          email?: string | null
          pin_hash?: string
          role?: 'admin' | 'attendant'
          active?: boolean
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          shop_id: string
          full_name: string
          document_type: 'dni' | 'nie' | 'passport'
          document_number: string
          date_of_birth: string
          phone: string | null
          email: string | null
          photo_url: string | null
          membership_start: string
          membership_end: string
          status: 'active' | 'expired' | 'suspended'
          daily_limit_grams: number
          monthly_limit_grams: number
          notes: string | null
          loyalty_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          full_name: string
          document_type: 'dni' | 'nie' | 'passport'
          document_number: string
          date_of_birth: string
          phone?: string | null
          email?: string | null
          photo_url?: string | null
          membership_start?: string
          membership_end: string
          status?: 'active' | 'expired' | 'suspended'
          daily_limit_grams: number
          monthly_limit_grams: number
          notes?: string | null
          loyalty_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          document_type?: 'dni' | 'nie' | 'passport'
          document_number?: string
          date_of_birth?: string
          phone?: string | null
          email?: string | null
          photo_url?: string | null
          membership_end?: string
          status?: 'active' | 'expired' | 'suspended'
          daily_limit_grams?: number
          monthly_limit_grams?: number
          notes?: string | null
          updated_at?: string
        }
      }
      subcategories: {
        Row: {
          id: string
          shop_id: string
          key: string
          category: ProductCategory
          sort_order: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          key: string
          category: ProductCategory
          sort_order?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          key?: string
          category?: ProductCategory
          sort_order?: number
          active?: boolean
        }
      }
      products: {
        Row: {
          id: string
          shop_id: string
          name: string
          category: ProductCategory
          subcategory_id: string | null
          unit_type: 'gram' | 'unit'
          price_per_unit: number
          stock_quantity: number
          low_stock_threshold: number
          counts_toward_limit: boolean
          gram_equivalent: number | null
          description: string | null
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          name: string
          category: ProductCategory
          subcategory_id?: string | null
          unit_type: 'gram' | 'unit'
          price_per_unit: number
          stock_quantity?: number
          low_stock_threshold?: number
          counts_toward_limit?: boolean
          gram_equivalent?: number | null
          description?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          category?: ProductCategory
          subcategory_id?: string | null
          unit_type?: 'gram' | 'unit'
          price_per_unit?: number
          stock_quantity?: number
          low_stock_threshold?: number
          counts_toward_limit?: boolean
          gram_equivalent?: number | null
          description?: string | null
          sort_order?: number
          active?: boolean
          updated_at?: string
        }
      }
      translations: {
        Row: {
          id: string
          shop_id: string
          entity_type: string
          entity_key: string
          locale: string
          label: string
        }
        Insert: {
          id?: string
          shop_id: string
          entity_type: string
          entity_key: string
          locale: string
          label: string
        }
        Update: {
          entity_type?: string
          entity_key?: string
          locale?: string
          label?: string
        }
      }
      transactions: {
        Row: {
          id: string
          shop_id: string
          member_id: string
          staff_user_id: string
          payment_method: 'cash' | 'card'
          total_amount: number
          cannabis_grams_total: number
          item_count: number
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          member_id: string
          staff_user_id: string
          payment_method: 'cash' | 'card'
          total_amount: number
          cannabis_grams_total?: number
          item_count: number
          created_at?: string
        }
        Update: {
          payment_method?: 'cash' | 'card'
          total_amount?: number
          cannabis_grams_total?: number
          item_count?: number
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string
          product_name: string
          product_category: ProductCategory
          unit_type: 'gram' | 'unit'
          quantity: number
          unit_price: number
          line_total: number
          cannabis_grams: number
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string
          product_name: string
          product_category: ProductCategory
          unit_type: 'gram' | 'unit'
          quantity: number
          unit_price: number
          line_total: number
          cannabis_grams?: number
        }
        Update: {
          product_name?: string
          product_category?: ProductCategory
          unit_type?: 'gram' | 'unit'
          quantity?: number
          unit_price?: number
          line_total?: number
          cannabis_grams?: number
        }
      }
      stock_adjustments: {
        Row: {
          id: string
          shop_id: string
          product_id: string
          adjustment_type: 'restock' | 'correction' | 'loss' | 'return'
          quantity: number
          reason: string | null
          performed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          product_id: string
          adjustment_type: 'restock' | 'correction' | 'loss' | 'return'
          quantity: number
          reason?: string | null
          performed_by: string
          created_at?: string
        }
        Update: {
          adjustment_type?: 'restock' | 'correction' | 'loss' | 'return'
          quantity?: number
          reason?: string | null
        }
      }
      daily_closes: {
        Row: {
          id: string
          shop_id: string
          close_date: string
          total_transactions: number
          total_revenue: number
          cash_total: number
          card_total: number
          cannabis_grams_dispensed: number
          unique_members_served: number
          expected_cash: number
          actual_cash: number | null
          cash_difference: number | null
          notes: string | null
          closed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          close_date: string
          total_transactions: number
          total_revenue: number
          cash_total: number
          card_total: number
          cannabis_grams_dispensed: number
          unique_members_served: number
          expected_cash: number
          actual_cash?: number | null
          cash_difference?: number | null
          notes?: string | null
          closed_by: string
          created_at?: string
        }
        Update: {
          actual_cash?: number | null
          cash_difference?: number | null
          notes?: string | null
        }
      }
      loyalty_ledger: {
        Row: {
          id: string
          shop_id: string
          member_id: string
          transaction_id: string | null
          type: 'earn' | 'redeem' | 'adjust'
          points: number
          balance_after: number
          description: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          member_id: string
          transaction_id?: string | null
          type: 'earn' | 'redeem' | 'adjust'
          points: number
          balance_after: number
          description?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          description?: string | null
        }
      }
      check_ins: {
        Row: {
          id: string
          shop_id: string
          member_id: string
          checked_in_by: string
          checked_in_at: string
          checked_out_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          member_id: string
          checked_in_by: string
          checked_in_at?: string
          checked_out_at?: string | null
          created_at?: string
        }
        Update: {
          checked_out_at?: string | null
        }
      }
    }
    Functions: {
      execute_checkout: {
        Args: {
          p_shop_id: string
          p_member_id: string
          p_staff_user_id: string
          p_payment_method: string
          p_total_amount: number
          p_cannabis_grams_total: number
          p_item_count: number
          p_items: string
        }
        Returns: string
      }
      get_member_dispensed_today: {
        Args: { p_member_id: string; p_shop_id: string }
        Returns: number
      }
      get_member_dispensed_month: {
        Args: { p_member_id: string; p_shop_id: string }
        Returns: number
      }
      compute_daily_summary: {
        Args: { p_shop_id: string; p_date: string }
        Returns: {
          total_transactions: number
          total_revenue: number
          cash_total: number
          card_total: number
          cannabis_grams_dispensed: number
          unique_members_served: number
        }[]
      }
    }
    Enums: {
      staff_role: 'admin' | 'attendant'
      member_status: 'active' | 'expired' | 'suspended'
      document_type: 'dni' | 'nie' | 'passport'
      product_category: ProductCategory
      unit_type: 'gram' | 'unit'
      payment_method: 'cash' | 'card'
      adjustment_type: 'restock' | 'correction' | 'loss' | 'return'
    }
  }
}

// Convenience type aliases
export type Shop = Database['public']['Tables']['shops']['Row']
export type StaffUser = Database['public']['Tables']['staff_users']['Row']
export type Member = Database['public']['Tables']['members']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionItem = Database['public']['Tables']['transaction_items']['Row']
export type StockAdjustment = Database['public']['Tables']['stock_adjustments']['Row']
export type DailyClose = Database['public']['Tables']['daily_closes']['Row']
export type Subcategory = Database['public']['Tables']['subcategories']['Row']
export type CheckIn = Database['public']['Tables']['check_ins']['Row']
export type LoyaltyLedger = Database['public']['Tables']['loyalty_ledger']['Row']
