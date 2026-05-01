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
import { Sparkles, AlertTriangle, Phone, Stethoscope } from "lucide-react";

const SEVERITY_COLORS: Record<string, string> = {
  mild: "bg-amber-50 border-amber-200 text-amber-900",
  moderate: "bg-orange-50 border-orange-200 text-orange-900",
  severe: "bg-rose-50 border-rose-300 text-rose-900",
};

export default function SymptomChecker() {
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [symptoms, setSymptoms] = useState("");
  const check = useAiSymptomCheck();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!symptoms.trim()) return;
    check.mutate({ data: { petType, symptoms } });
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium tracking-wider uppercase mb-4">
          <Sparkles className="h-3 w-3" />
          AI Tool
        </span>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-3">
          Symptom Checker
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Describe what you are observing and we will surface possible causes
          and immediate steps. This is a guide — not a diagnosis.
        </p>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl p-5 mb-8 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <strong>Medical disclaimer.</strong> This tool provides general
          information only and is not a substitute for professional veterinary
          diagnosis. If your pet shows severe or worsening symptoms, contact a
          licensed vet immediately.
        </div>
      </div>

      <form
        onSubmit={submit}
        className="bg-card border border-card-border rounded-2xl p-6 space-y-5 mb-8"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Pet Type</Label>
            <Select
              value={petType}
              onValueChange={(v) => setPetType(v as "dog" | "cat")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Dog</SelectItem>
                <SelectItem value="cat">Cat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2"></div>
        </div>
        <div className="space-y-2">
          <Label>Describe symptoms</Label>
          <Textarea
            rows={5}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. My dog has been vomiting since this morning and seems lethargic..."
            data-testid="symptom-input"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="rounded-full px-8 h-12"
          disabled={check.isPending || !symptoms.trim()}
        >
          {check.isPending ? "Analyzing..." : "Check Symptoms"}
        </Button>
      </form>

      {check.data && (
        <div className="space-y-6">
          {check.data.urgent && (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 flex gap-4">
              <AlertTriangle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-xl text-rose-900 mb-1">
                  Seek veterinary care soon
                </h3>
                <p className="text-sm text-rose-800">
                  These symptoms can indicate something serious. Please contact
                  a vet today.
                </p>
                <a
                  href="https://wa.me/923001234567?text=Urgent%20vet%20consultation%20needed"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
                >
                  <Phone className="h-4 w-4" />
                  Contact a vet on WhatsApp
                </a>
              </div>
            </div>
          )}

          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h3 className="font-serif text-2xl mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Possible Causes
            </h3>
            <div className="space-y-3">
              {check.data.possibleCauses.map((c, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-4 ${SEVERITY_COLORS[c.severity]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{c.name}</h4>
                    <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60">
                      {c.severity}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h3 className="font-serif text-2xl mb-4">Suggested Actions</h3>
            <ul className="space-y-2">
              {check.data.suggestedActions.map((a, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm bg-secondary/40 rounded-xl px-3 py-2.5"
                >
                  <span className="font-serif text-primary">{i + 1}.</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <strong>Reminder:</strong> {check.data.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
