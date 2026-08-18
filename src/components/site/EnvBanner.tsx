import { SUPABASE_CONFIGURED } from "@/lib/supabase";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function EnvBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (SUPABASE_CONFIGURED || dismissed) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] bg-red-600 text-white px-4 py-3 flex items-start gap-3 shadow-2xl">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm leading-relaxed">
        <strong>Supabase not configured — all DB operations will fail.</strong>
        <br />
        Create a <code className="bg-white/20 px-1 rounded">.env</code> file in the project root with{" "}
        <code className="bg-white/20 px-1 rounded">VITE_SUPABASE_URL</code> and{" "}
        <code className="bg-white/20 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 hover:bg-white/20 rounded p-0.5">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
