export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          company_name: string
          technician_count: number
          plan_tier: string
          trial_end_date: string
          theme_preference: string
          user_role: string
          owned_by: string | null
          trial_start: string
          trial_expired: boolean
          demo_mode: boolean
          billing_status: string | null
          subscription_id: string | null
          stripe_customer_id: string | null
          subscription_start: string | null
          subscription_end: string | null
          grace_period_end: string | null
          account_status: string | null
          last_payment_reminder: string | null
          trial_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          company_name: string
          technician_count?: number
          plan_tier?: string
          trial_end_date?: string
          theme_preference?: string
          user_role?: string
          owned_by?: string | null
          trial_start?: string
          trial_expired?: boolean
          demo_mode?: boolean
          grace_period_end?: string | null
          account_status?: string | null
          last_payment_reminder?: string | null
          trial_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company_name?: string
          technician_count?: number
          plan_tier?: string
          trial_end_date?: string
          theme_preference?: string
          user_role?: string
          owned_by?: string | null
          trial_start?: string
          trial_expired?: boolean
          demo_mode?: boolean
          billing_status?: string | null
          subscription_id?: string | null
          stripe_customer_id?: string | null
          subscription_start?: string | null
          subscription_end?: string | null
          grace_period_end?: string | null
          account_status?: string | null
          last_payment_reminder?: string | null
          trial_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          slug: string
          price_monthly: number
          max_technicians: number | null
          analytics_days_limit: string[]
          can_export_reports: boolean
          support_level: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price_monthly: number
          max_technicians?: number | null
          analytics_days_limit?: string[]
          can_export_reports?: boolean
          support_level?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          price_monthly?: number
          max_technicians?: number | null
          analytics_days_limit?: string[]
          can_export_reports?: boolean
          support_level?: string
          created_at?: string
        }
      }
      technicians: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          technician_id: string | null
          title: string
          client_name: string
          client_address: string | null
          job_date: string
          hours_spent: number
          revenue: number
          cost: number
          status: string
          notes: string | null
          job_type: string
          callback_required: boolean
          scheduled_date: string | null
          completed_date: string | null
          gross_margin_percent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          technician_id?: string | null
          title: string
          client_name: string
          client_address?: string | null
          job_date: string
          hours_spent?: number
          revenue?: number
          cost?: number
          status?: string
          notes?: string | null
          job_type?: string
          callback_required?: boolean
          scheduled_date?: string | null
          completed_date?: string | null
          gross_margin_percent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          technician_id?: string | null
          title?: string
          client_name?: string
          client_address?: string | null
          job_date?: string
          hours_spent?: number
          revenue?: number
          cost?: number
          status?: string
          notes?: string | null
          job_type?: string
          callback_required?: boolean
          scheduled_date?: string | null
          completed_date?: string | null
          gross_margin_percent?: number
          created_at?: string
          updated_at?: string
        }
      }
      analytics_snapshots: {
        Row: {
          id: string
          user_id: string
          snapshot_date: string
          total_revenue: number
          total_jobs: number
          avg_hours_per_job: number
          gross_margin: number
          avg_job_revenue: number
          first_time_fix_rate: number
          avg_response_time: number
          revenue_per_technician: number
          jobs_per_tech_per_week: number
          maintenance_completion_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          snapshot_date: string
          total_revenue?: number
          total_jobs?: number
          avg_hours_per_job?: number
          gross_margin?: number
          avg_job_revenue?: number
          first_time_fix_rate?: number
          avg_response_time?: number
          revenue_per_technician?: number
          jobs_per_tech_per_week?: number
          maintenance_completion_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          snapshot_date?: string
          total_revenue?: number
          total_jobs?: number
          avg_hours_per_job?: number
          gross_margin?: number
          avg_job_revenue?: number
          first_time_fix_rate?: number
          avg_response_time?: number
          revenue_per_technician?: number
          jobs_per_tech_per_week?: number
          maintenance_completion_rate?: number
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          priority: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category?: string
          priority?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          priority?: string
          is_read?: boolean
          created_at?: string
        }
      }
      email_leads: {
        Row: {
          id: string
          email: string
          source_page: string
          created_at: string
          status: string
          lead_magnet: string | null
        }
        Insert: {
          id?: string
          email: string
          source_page: string
          created_at?: string
          status?: string
          lead_magnet?: string | null
        }
        Update: {
          id?: string
          email?: string
          source_page?: string
          created_at?: string
          status?: string
          lead_magnet?: string | null
        }
      }
      consultation_requests: {
        Row: {
          id: string
          name: string
          email: string
          company: string
          user_id: string | null
          message: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          company: string
          user_id?: string | null
          message?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string
          user_id?: string | null
          message?: string | null
          status?: string
          created_at?: string
        }
      }
    }
  }
}
