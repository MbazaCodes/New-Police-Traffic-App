// ============================================================
// SUPABASE DATABASE TYPES — Auto-generated shape
// Mirrors the schema in supabase/migrations/
// Update this file when schema changes.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "officer-traffic" | "officer-general" | "admin" | "commander";
export type OfficerStatus = "active" | "break" | "off-duty" | "patrol";
export type CitationStatus = "paid" | "unpaid";
export type IncidentStatus = "urgent" | "active" | "resolved" | "investigating";
export type PriorityLevel = "high" | "medium" | "low";
export type PatrolStatus = "active" | "completed" | "cancelled";
export type AlertPriority = "normal" | "important" | "urgent";
export type Pf3Status = "draft" | "submitted" | "approved";
export type InspectionResult = "pass" | "fail";
export type MissingType = "person" | "car" | "device";
export type MissingStatus = "active" | "found" | "closed";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          short_name: string | null;
          rank: string | null;
          rank_short: string | null;
          role: UserRole;
          badge_no: string;
          username: string;
          mobile: string;
          email: string;
          station_id: string | null;
          region: string | null;
          unit: string | null;
          photo_url: string | null;
          status: OfficerStatus;
          auth_user_id: string | null;
          joined_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      stations: {
        Row: {
          id: string;
          name: string;
          station_code: string;
          region: string;
          district: string;
          address: string;
          phone: string | null;
          commissioner_user_id: string | null;
          officers_count: number;
          posts_count: number;
          status: string;
          established: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["stations"]["Insert"]>;
      };
      posts: {
        Row: {
          id: string;
          name: string;
          station_id: string;
          location: string;
          type: string;
          officers_count: number;
          status: string;
          shift: string | null;
          officer_in_charge: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["posts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
      citizens: {
        Row: {
          id: string;
          nida: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          date_of_birth: string;
          gender: "M" | "F";
          mobile: string | null;
          email: string | null;
          address: string | null;
          region_code: string | null;
          occupation: string | null;
          photo_url: string | null;
          risk_score: number;
          has_criminal_record: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["citizens"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["citizens"]["Insert"]>;
      };
      vehicles: {
        Row: {
          id: string;
          plate_number: string;
          make: string;
          model: string;
          color: string;
          type: string;
          manufacture_year: number;
          chassis_number: string | null;
          engine_number: string | null;
          owner_citizen_id: string | null;
          insurance_company: string | null;
          insurance_policy: string | null;
          insurance_expires: string | null;
          inspection_expires: string | null;
          registration_expires: string | null;
          accident_involved: boolean;
          outstanding_fines: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vehicles"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Insert"]>;
      };
      devices: {
        Row: {
          id: string;
          serial_no: string;
          imei: string | null;
          description: string;
          category: string;
          owner_citizen_id: string | null;
          status: "clean" | "stolen" | "found";
          report_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["devices"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["devices"]["Insert"]>;
      };
      citations: {
        Row: {
          id: string;
          citation_number: string;
          officer_id: string;
          citizen_id: string | null;
          vehicle_id: string | null;
          plate: string;
          offense: string;
          fine_amount: number;
          location: string;
          date: string;
          time: string;
          status: CitationStatus;
          type: "traffic" | "general";
          points_deducted: number;
          station_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["citations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["citations"]["Insert"]>;
      };
      incidents: {
        Row: {
          id: string;
          incident_number: string;
          officer_id: string;
          type: string;
          severity: string;
          location: string;
          description: string;
          casualties: number;
          date: string;
          time: string;
          status: IncidentStatus;
          priority: PriorityLevel;
          station_id: string | null;
          citizen_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["incidents"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["incidents"]["Insert"]>;
      };
      arrests: {
        Row: {
          id: string;
          arrest_number: string;
          officer_id: string;
          suspect_name: string;
          suspect_nida: string | null;
          suspect_phone: string | null;
          offense: string;
          location: string;
          arrest_date: string;
          arrest_time: string;
          status: "held" | "released" | "charged";
          station_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["arrests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["arrests"]["Insert"]>;
      };
      patrols: {
        Row: {
          id: string;
          patrol_number: string;
          officer_id: string;
          area: string;
          patrol_type: "gari" | "miguu" | "baiskeli";
          start_time: string;
          end_time: string | null;
          duration_secs: number;
          events: string | null;
          photos_count: number;
          status: PatrolStatus;
          station_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["patrols"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["patrols"]["Insert"]>;
      };
      missing_records: {
        Row: {
          id: string;
          case_no: string;
          type: MissingType;
          title: string;
          identifier: string;
          details: string;
          photo_url: string | null;
          last_seen: string;
          last_seen_location: string;
          reported_by: string;
          reported_date: string;
          station_id: string | null;
          status: MissingStatus;
          reward_amount: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["missing_records"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["missing_records"]["Insert"]>;
      };
      pf3_reports: {
        Row: {
          id: string;
          pf3_number: string;
          officer_id: string;
          accident_date: string;
          accident_time: string;
          location: string;
          vehicles_involved: string[];
          casualties: number;
          description: string;
          status: Pf3Status;
          station_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pf3_reports"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["pf3_reports"]["Insert"]>;
      };
      vehicle_inspections: {
        Row: {
          id: string;
          inspection_number: string;
          officer_id: string;
          vehicle_id: string | null;
          plate: string;
          inspection_date: string;
          result: InspectionResult;
          notes: string | null;
          items_checked: Json;
          station_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vehicle_inspections"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["vehicle_inspections"]["Insert"]>;
      };
      alerts: {
        Row: {
          id: string;
          title: string;
          message: string;
          priority: AlertPriority;
          category: string;
          target_role: string | null;
          target_station_id: string | null;
          target_region: string | null;
          is_read: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["alerts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
      };
      otp_codes: {
        Row: {
          id: string;
          identifier: string;
          code: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["otp_codes"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["otp_codes"]["Insert"]>;
      };
    };
    Functions: {
      get_dashboard_stats: {
        Args: { p_role: string; p_region?: string; p_station_id?: string };
        Returns: Json;
      };
      search_citizen: {
        Args: { p_query: string; p_type: "name" | "nida" | "mobile" | "license" };
        Returns: Json;
      };
      search_vehicle: {
        Args: { p_plate: string };
        Returns: Json;
      };
      search_device: {
        Args: { p_query: string };
        Returns: Json;
      };
    };
  };
}
