import { useState } from "react";
import { useAiSymptomCheck } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Phone,
  Stethoscope,
  X,
  ChevronRight,
} from "lucide-react";
import { AiHero } from "./_shared";

const QUICK_SYMPTOMS: Record<"dog" | "cat", string[]> = {
  dog: [
    "Vomiting", "Diarrhea", "Lethargy", "Loss of appetite",
    "Excessive thirst", "Limping", "Coughing", "Scratching",
    "Bloated stomach", "Trembling",
  ],
  cat: [
    "Vomiting", "Not eating", "Hiding", "Excessive grooming",
    "Sneezing", "Watery eyes", "Lethargy", "Diarrhea",
    "Difficulty breathing", "Urinating outside litter box",
  ],
};

const SEVERITY_CONFIG: Record<string, { bg: string; border: string; text: string; bar: string; label: string }> = {
  mild: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    bar: "bg-amber-400",
    label: "Mild",
  },
  moderate: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-900",
    bar: "bg-orange-500",
    label: "Moderate",
  },
  severe: {
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-900",
    bar: "bg-rose-600",
    label: "Severe",
  },
};

const SEVERITY_ORDER = ["mild", "moderate", "severe"];

function SeverityBar({ severity }: { severity: string }) {
  const idx = SEVERITY_ORDER.indexOf(severity);
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.mild;
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1 flex-1">
        {SEVERITY_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${i <= idx ? cfg.bar : "bg-secondary"}`}
          />
        ))}
      </div>
      <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.text}`}>
        {cfg.label}
      </span>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-4 mt-8 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-secondary/30 rounded-2xl" />
      ))}
    </div>
  );
}

export default function SymptomChecker() {
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [symptoms, setSymptoms] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const check = useAiSymptomCheck();

  function toggleChip(s: string) {
    setChips((prev) => {
      const next = prev.includes(s) ? prev.filter((c) => c !== s) : [...prev, s];
      setSymptoms(next.join(", "));
      return next;
    });
  }

  function removeChip(s: string) {
    const next = chips.filter((c) => c !== s);
    setChips(next);
    setSymptoms(next.length ? next.join(", ") : "");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = symptoms.trim();
    if (!text) return;
    check.mutate({ data: { petType, symptoms: text } });
  }

  const WHATSAPP_URGENT =
    "https://wa.me/923001234567?text=URGENT%3A%20My%20pet%20needs%20immediate%20vet%20attention";
  const WHATSAPP_NORMAL =
    "https://wa.me/923001234567?text=Hi%2C%20I%20have%20a%20question%20about%20my%20pet%27s%20health";

  return (
    <>
      <AiHero
        title="Symptom Checker"
        subtitle="Describe what you are observing and our AI will surface possible causes, severity levels, and suggested next steps. Always consult a vet for serious concerns."
      />

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-4xl">
        {/* Disclaimer */}
        <div className="mb-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>Medical disclaimer.</strong> This tool provides general guidance only
            and is not a substitute for professional veterinary diagnosis.
            For life-threatening emergencies, go to a 24-hour clinic immediately.
          </p>
        </div>

        <form onSubmit={submit} className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pet Type</Label>
              <Select value={petType} onValueChange={(v) => { setPetType(v as "dog" | "cat"); setChips([]); setSymptoms(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick-pick symptom chips */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Quick-pick symptoms
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SYMPTOMS[petType].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleChip(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    chips.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Selected chips summary */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {c}
                  <button type="button" onClick={() => removeChip(c)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Describe in your own words (optional)</Label>
            <Textarea
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. My dog has been vomiting since this morning and is less playful than usual..."
              data-testid="symptom-input"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full h-12"
            disabled={check.isPending || !symptoms.trim()}
          >
            {check.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Analysing symptoms...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Check Symptoms
              </span>
            )}
          </Button>
        </form>

        {check.isPending && <ResultSkeleton />}

        {check.data && !check.isPending && (
          <div className="mt-8 space-y-6">
            {/* Urgent alert */}
            {check.data.urgent ? (
              <div className="bg-rose-600 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl mb-1">Seek vet care now</h3>
                    <p className="text-rose-100 text-sm mb-4">
                      These symptoms may indicate a serious condition. Please contact a vet immediately.
                    </p>
                    <a
                      href={WHATSAPP_URGENT}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-rose-700 font-semibold text-sm hover:bg-rose-50 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Emergency WhatsApp Vet
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    No immediate danger detected — monitor closely and consult your vet if symptoms persist.
                  </p>
                </div>
                <a
                  href={WHATSAPP_NORMAL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1faa54] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Ask a vet
                </a>
              </div>
            )}

            {/* Possible causes */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h3 className="font-serif text-xl mb-4">Possible Causes</h3>
              <div className="space-y-4">
                {check.data.possibleCauses.map((c, i) => {
                  const cfg = SEVERITY_CONFIG[c.severity] ?? SEVERITY_CONFIG.mild;
                  return (
                    <div key={i} className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4`}>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className={`font-medium ${cfg.text}`}>{c.name}</h4>
                        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 ${cfg.text} flex-shrink-0`}>
                          {c.severity}
                        </span>
                      </div>
                      <p className={`text-sm mt-1.5 ${cfg.text} opacity-80`}>{c.description}</p>
                      <SeverityBar severity={c.severity} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggested actions */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h3 className="font-serif text-xl mb-4">Suggested Steps</h3>
              <ol className="space-y-3">
                {check.data.suggestedActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground">{a}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-6 pt-5 border-t border-card-border">
                <a
                  href={WHATSAPP_NORMAL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1faa54] transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Discuss with a vet on WhatsApp
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">
              {check.data.disclaimer}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
