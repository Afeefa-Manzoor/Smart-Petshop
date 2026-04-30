import { Phone, Clock, ShieldCheck, MessageCircle } from "lucide-react";

const WHATSAPP_LINK =
  "https://wa.me/923001234567?text=Hi%2C%20I%20need%20a%20vet%20consultation%20for%20my%20pet";

export default function VetConsult() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="bg-gradient-to-br from-primary/15 via-card to-card border border-card-border rounded-3xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <span className="inline-block px-3 py-1 rounded-full bg-background text-xs font-medium tracking-wider uppercase text-foreground mb-5 self-start">
              Vet on WhatsApp
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight mb-4">
              A licensed vet, one tap away.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Skip the waiting room. Message us on WhatsApp for non-emergency
              consults — diet, behavior, vaccinations, or a quick second
              opinion. Average reply under 30 minutes during clinic hours.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 h-14 rounded-full bg-[#25D366] text-white font-medium shadow-lg hover:bg-[#1faa54] transition-colors text-lg w-full sm:w-auto"
              data-testid="whatsapp-button"
            >
              <MessageCircle className="h-6 w-6" />
              Chat on WhatsApp
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              +92 300 1234567 — Clinic hours: 9am–9pm, every day
            </p>
          </div>
          <div className="bg-secondary/40 p-10 md:p-14 space-y-6">
            <div className="flex gap-4">
              <div className="h-11 w-11 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Direct line to a real vet</h3>
                <p className="text-sm text-muted-foreground">
                  No bots — every message is answered by a Pakistan-licensed
                  veterinarian.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-11 w-11 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Replies within 30 minutes</h3>
                <p className="text-sm text-muted-foreground">
                  During clinic hours. After-hours messages are queued for the
                  morning.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-11 w-11 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Private and secure</h3>
                <p className="text-sm text-muted-foreground">
                  Conversations stay between you and our vet team — never
                  shared.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { title: "Diet questions", body: "What food, how much, and when." },
          { title: "Behavior advice", body: "Training, anxiety, socializing." },
          { title: "Mild symptoms", body: "Quick second opinion before a clinic visit." },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-card border border-card-border rounded-2xl p-5"
          >
            <h4 className="font-serif text-lg mb-1">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground italic text-center mt-10 max-w-2xl mx-auto">
        For life-threatening emergencies (severe bleeding, breathing trouble,
        suspected poisoning), please go to your nearest 24-hour veterinary
        clinic immediately.
      </p>
    </div>
  );
}
