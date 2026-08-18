import { supabase } from "./supabase";
import type { Submission, SubmissionCategory, SubmissionType, SubmissionStatus, StatusEvent, AdminNote } from "./supabase";

// ── normalise jsonb fields from DB ────────────────────────────────────────
function toArr<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string") { try { return JSON.parse(v) as T[]; } catch { return []; } }
  return [];
}
function norm(row: Record<string, unknown>): Submission {
  return { ...(row as Submission), image_urls: toArr<string>(row.image_urls), status_history: toArr<StatusEvent>(row.status_history), admin_notes: toArr<AdminNote>(row.admin_notes) };
}

// ── ticket ID ─────────────────────────────────────────────────────────────
function genTicketId() {
  return `CSC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

// ── image upload ──────────────────────────────────────────────────────────
export async function uploadImages(files: File[], ticketId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${ticketId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("submission-images").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) { console.error("[CSC] upload failed:", error.message); continue; }
    const { data } = supabase.storage.from("submission-images").getPublicUrl(path);
    if (data?.publicUrl) urls.push(data.publicUrl);
  }
  return urls;
}

// ── create submission ─────────────────────────────────────────────────────
export interface SubmitPayload {
  type: SubmissionType; category: SubmissionCategory; subject: string; description: string;
  name?: string; roll_number?: string; department?: string; is_anonymous: boolean; images?: File[];
}

export async function createSubmission(payload: SubmitPayload): Promise<{ data: Submission | null; error: string | null }> {
  const ticket_id = genTicketId();
  const now = new Date().toISOString();
  const image_urls = payload.images?.length ? await uploadImages(payload.images, ticket_id) : [];

  const { data, error } = await supabase.from("submissions").insert([{
    ticket_id,
    type:           payload.type,
    category:       payload.category,
    subject:        payload.subject,
    description:    payload.description,
    name:           payload.is_anonymous ? null : (payload.name || null),
    roll_number:    payload.is_anonymous ? null : (payload.roll_number || null),
    department:     payload.department || null,
    is_anonymous:   payload.is_anonymous,
    status:         "submitted",
    status_history: [{ status: "submitted", timestamp: now }],
    admin_notes:    [],
    image_urls,
    upvotes:        0,
  }]).select().single();

  if (error) return { data: null, error: error.message };
  return { data: norm(data as Record<string, unknown>), error: null };
}

// ── get by ticket ID ──────────────────────────────────────────────────────
export async function getSubmissionByTicketId(ticket_id: string): Promise<{ data: Submission | null; error: string | null }> {
  const { data, error } = await supabase.from("submissions").select("*").eq("ticket_id", ticket_id.trim().toUpperCase()).single();
  if (error) return { data: null, error: error.code === "PGRST116" ? "No submission found with that ticket ID." : error.message };
  return { data: norm(data as Record<string, unknown>), error: null };
}

// ── get list ──────────────────────────────────────────────────────────────
export async function getSubmissions(filters?: { type?: SubmissionType; category?: string; status?: SubmissionStatus; search?: string }): Promise<{ data: Submission[]; error: string | null }> {
  let q = supabase.from("submissions").select("*").order("created_at", { ascending: false });
  if (filters?.type)                               q = q.eq("type", filters.type);
  if (filters?.category && filters.category !== "All") q = q.eq("category", filters.category);
  if (filters?.status)                             q = q.eq("status", filters.status);
  const { data, error } = await q;
  if (error) return { data: [], error: error.message };
  let result = ((data ?? []) as Record<string, unknown>[]).map(norm);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(r => r.subject.toLowerCase().includes(s) || r.description.toLowerCase().includes(s) || r.ticket_id.toLowerCase().includes(s) || (r.name ?? "").toLowerCase().includes(s));
  }
  return { data: result, error: null };
}

// ── upvote ────────────────────────────────────────────────────────────────
export async function upvoteSubmission(id: string, current: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from("submissions").update({ upvotes: current + 1 }).eq("id", id);
  return { error: error?.message ?? null };
}

// ── admin: update status ──────────────────────────────────────────────────
export async function adminUpdateStatus(id: string, newStatus: SubmissionStatus, history: StatusEvent[], note?: string): Promise<{ error: string | null }> {
  const event: StatusEvent = { status: newStatus, timestamp: new Date().toISOString(), ...(note ? { note } : {}) };
  const { error } = await supabase.from("submissions").update({ status: newStatus, status_history: [...history, event] }).eq("id", id);
  return { error: error?.message ?? null };
}

// ── admin: add note ───────────────────────────────────────────────────────
export async function adminAddNote(id: string, notes: AdminNote[], text: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("submissions").update({ admin_notes: [...notes, { text, timestamp: new Date().toISOString() }] }).eq("id", id);
  return { error: error?.message ?? null };
}

// ── labels ────────────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<SubmissionStatus, string> = { submitted: "Submitted", under_review: "Under Review", forwarded: "Forwarded to Dept.", resolved: "Resolved" };
export const STATUS_ORDER: SubmissionStatus[] = ["submitted", "under_review", "forwarded", "resolved"];
