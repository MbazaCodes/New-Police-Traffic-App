// ============================================================
// SUPABASE DATABASE TYPES — Auto-generated shape
// Mirrors the schema in supabase/migrations/
// Update this file when schema changes.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "officer-traffic" | "officer-general" | "officer-post" | "admin" | "commander" | "investigator" | "clerk" | "viewer" | "system" | string;
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
          role: string;
          badge_no: string;
          username: string;
          mobile: string;
          phone: string | null;
          email: string;
          station_id: string | null;
          region: string | null;
          unit: string | null;
          photo_url: string | null;
          status: string;
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
      bail_requests: {
        Row: {
          id: string;
          arrest_id: string;
          suspect_name: string;
          suspect_nida: string | null;
          offense: string;
          arrest_date: string;
          cell_number: string | null;
          bail_amount: number;
          guarantor_name: string | null;
          guarantor_phone: string | null;
          guarantor_nida: string | null;
          guarantor_relation: string | null;
          payment_method: string | null;
          payment_ref: string | null;
          paid_at: string | null;
          status: string;
          officer_id: string | null;
          officer_name: string | null;
          station: string | null;
          region: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bail_requests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bail_requests"]["Insert"]>;
      };
      cases: {
        Row: {
          id: string;
          case_no: string;
          title: string;
          type: string;
          status: string;
          officer: string | null;
          region: string | null;
          district: string | null;
          station: string | null;
          date: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cases"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["cases"]["Insert"]>;
      };
      general_incidents: {
        Row: {
          id: string;
          incident_number: string;
          type: string;
          title: string;
          status: string;
          priority: string;
          location: string;
          date: string;
          time: string;
          officer: string | null;
          station: string | null;
          region: string | null;
          description: string | null;
          casualties: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["general_incidents"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["general_incidents"]["Insert"]>;
      };
      citizen_fines: {
        Row: {
          id: string;
          driver_name: string;
          driver_phone: string | null;
          driver_nida: string | null;
          plate: string;
          offense: string;
          base_amount: number;
          penalty_amount: number;
          total_amount: number;
          weeks_overdue: number;
          due_date: string;
          status: string;
          officer_id: string | null;
          officer_name: string | null;
          station: string | null;
          region: string | null;
          payment_method: string | null;
          payment_ref: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["citizen_fines"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["citizen_fines"]["Insert"]>;
      };
      officer_requests: {
        Row: {
          id: string;
          type: string;
          officer_id: string | null;
          station_id: string | null;
          status: string;
          response: string | null;
          new_station: string | null;
          responded_by: string | null;
          responded_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["officer_requests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["officer_requests"]["Insert"]>;
      };
      warnings: {
        Row: {
          id: string;
          warning_number: string;
          citizen_name: string;
          citizen_nida: string | null;
          plate: string | null;
          offense: string;
          warning_type: string;
          location: string;
          notes: string | null;
          acknowledged: boolean;
          officer_id: string | null;
          officer_name: string | null;
          station: string | null;
          region: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["warnings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["warnings"]["Insert"]>;
      };
      officers: {
        Row: {
          id: string;
          name: string;
          short_name: string | null;
          rank: string | null;
          rank_short: string | null;
          role: string;
          badge_no: string;
          username: string;
          mobile: string;
          email: string;
          station_id: string | null;
          region: string | null;
          unit: string | null;
          photo_url: string | null;
          status: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["officers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["officers"]["Insert"]>;
      };
      assignments: {
        Row: {
          id: string;
          officer_id: string;
          station_id: string;
          post_id: string | null;
          role: string;
          status: string;
          officer_name: string | null;
          station_name: string | null;
          post_name: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["assignments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["assignments"]["Insert"]>;
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
