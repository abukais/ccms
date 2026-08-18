import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = (import.meta.env.VITE_SUPABASE_URL     as string | undefined) ?? "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";

export const SUPABASE_CONFIGURED =
  supabaseUrl.startsWith("https://") &&
  !supabaseUrl.includes("YOUR_PROJECT_REF") &&
  supabaseAnonKey.length > 20;

if (!SUPABASE_CONFIGURED) {
  console.error(
    "[CSC] ⚠️  Supabase is NOT configured!\n" +
    "1. Copy .env.example → .env\n" +
    "2. Set VITE_SUPABASE_URL  = https://YOUR_REF.supabase.co\n" +
    "3. Set VITE_SUPABASE_ANON_KEY = your anon/public key\n" +
    "4. Restart the dev server (Ctrl+C, then bun run dev)"
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key-not-real"
);

export type SubmissionType     = "complaint" | "suggestion";
export type SubmissionStatus   = "submitted" | "under_review" | "forwarded" | "resolved";
export type SubmissionCategory = "Infrastructure" | "Academics" | "Hostel" | "Cafeteria" | "Faculty" | "Events" | "Other";

export interface StatusEvent {
  status: SubmissionStatus;
  timestamp: string;
  note?: string;
}

export interface AdminNote {
  text: string;
  timestamp: string;
}

export interface Submission {
  id: string;
  ticket_id: string;
  type: SubmissionType;
  category: SubmissionCategory;
  subject: string;
  description: string;
  name: string | null;
  roll_number: string | null;
  department: string | null;
  is_anonymous: boolean;
  status: SubmissionStatus;
  status_history: StatusEvent[];
  admin_notes: AdminNote[];
  image_urls: string[];
  upvotes: number;
  created_at: string;
  updated_at: string;
}
