export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AttendanceStatus = "Present" | "Absent" | "Late";
export type WorkMode = "on-site" | "remote" | "hybrid";
export type EmploymentStatus = "active" | "inactive";
export type EmploymentType = "full_time" | "part_time";
export type UserRole = "employee" | "admin";
export type HolidayType = "Company" | "Public";

export interface Database {
  public: {
    Tables: {
      attendance_log: {
        Row: {
          id: string;
          employee_id: string | null;
          attendance_date: string;
          nfc_id: string | null;
          check_in_time: string | null;
          check_out_time: string | null;
          worked_minutes: number;
          attendance_status: AttendanceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["attendance_log"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["attendance_log"]["Row"]>;
      };
      requests: {
        Row: {
          id: string;
          employee_id: string | null;
          request_type: string;
          reason: string | null;
          status: string;
          start_date: string;
          end_date: string;
          reviewed_by: string | null;
          review_date: string | null;
          review_note: string | null;
          request_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["requests"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["requests"]["Row"]>;
      };
      employees: {
        Row: {
          id: string;
          nfc_id: string;
          full_name: string;
          email: string | null;
          phone_number: string | null;
          employee_code: string | null;
          department_id: string | null;
          position_id: string | null;
          shift_id: string | null;
          hire_date: string | null;
          work_mode: WorkMode;
          employment_status: EmploymentStatus;
          employment_type: EmploymentType;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["employees"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["employees"]["Row"]>;
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          phone_number: string | null;
          fullname: string | null;
          role: UserRole;
          pfp_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      departments: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["departments"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["departments"]["Row"]>;
      };
      positions: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["positions"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["positions"]["Row"]>;
      };
      shifts: {
        Row: {
          id: string;
          shift_name: string;
          start_shift: string;
          end_shift: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["shifts"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["shifts"]["Row"]>;
      };
      holidays: {
        Row: {
          id: string;
          holiday_date: string;
          holiday_type: HolidayType;
          holiday_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["holidays"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["holidays"]["Row"]>;
      };
    };
  };
}
