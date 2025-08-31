const { useState, useEffect } = React;
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, LineChart, MapPin, Sparkles, ShieldCheck, Building2, Phone, Mail, Landmark, DollarSign, Users, Handshake, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// ---- Helper Components ----
const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
);

const Stat = ({ label, value }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-semibold tracking-tight">{value}</div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </div>
);

const Pill = ({ children }) => (
  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm bg-background/60 backdrop-blur shadow-sm">
    <Sparkles className="h-4 w-4" /> {children}
  </div>
);

// ---- Main Page ----
export default function LuxuryLanding() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ---- Simple CRM adapter ----
  // Pick ONE of: "hubspot" | "formspree" | "webhook" | "mailto"
  const CRM_CONFIG = {
    mode: "formspree", // change as needed
    // HubSpot
    portalId: "YOUR_PORTAL_ID",
    formGuid: "YOUR_FORM_GUID",
    // Formspree
    formspreeEndpoint: "https://formspree.io/f/YOUR_ID",
    // Webhook (Apps Script / Zapier / Make)
    webhookEndpoint: "/api/lead" // replace with your deployed endpoint
  } ;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submitToHubSpot(payload) {
    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${CRM_CONFIG.portalId}/${CRM_CONFIG.formGuid}`;
    const body = {
      fields: [
        { objectTypeId: "0-1", name: "email", value: payload.email },
        { objectTypeId: "0-1", name: "firstname", value: payload.name },
        { objectTypeId: "0-1", name: "phone", value: payload.phone },
        { objectTypeId: "0-1", name: "message", value: `${payload.interest} — ${payload.message}` },
      ],
      context: { pageUri: typeof window !== 'undefined' ? window.location.href : '', pageName: "Hunt Luxury Investments Landing" }
    };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`HubSpot error ${res.status}`);
  }

  async function submitToFormspree(payload) {
    const res = await fetch(CRM_CONFIG.formspreeEndpoint, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Formspree error ${res.status}`);
  }

  async function submitToWebhook(payload) {
    const res = await fetch(CRM_CONFIG.webhookEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Webhook error ${res.status}`);
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const payload = { ...form, source: "HLI Landing", ts: new Date().toISOString() };

    try {
      if (CRM_CONFIG.mode === "hubspot") await submitToHubSpot(payload);
      else if (CRM_CONFIG.mode === "formspree") await submitToFormspree(payload);
      else if (CRM_CONFIG.mode === "webhook") await submitToWebhook(payload);
      else {
        // mailto fallback
        const params = new URLSearchParams({ subject: `New Inquiry — ${payload.name}`, body: JSON.stringify(payload, null, 2) });
        window.location.href = `mailto:concierge@huntluxuryinvestments.com?${params.toString()}`;
      }
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", interest: "", message: "" });
    } catch (err) {
      console.error(err);
      setErrorMsg("We couldn’t submit the form. Please try again or email concierge@huntluxuryinvestments.com.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- SMOKE TESTS (run after mount) ----
  useEffect(() => {
    try {
      const formEl = document.querySelector('form[data-testid="lead-form"]');
      const submitBtnsInside = formEl ? formEl.querySelectorAll('button[type="submit"]').length : 0;
      const submitBtnsOutside = document.querySelectorAll('section#contact button[type="submit"]').length - submitBtnsInside;
      console.group("Landing Page Smoke Tests");
      console.log("[TEST] Lead form exists:", !!formEl ? "PASS" : "FAIL");
      console.log("[TEST] Exactly one submit button inside form:", submitBtnsInside === 1 ? "PASS" : `FAIL (${submitBtnsInside})`);
      console.log("[TEST] No submit buttons outside the form in contact section:", submitBtnsOutside === 0 ? "PASS" : `FAIL (${submitBtnsOutside})`);
      console.groupEnd();
    } catch (e) {
      console.warn("Smoke tests skipped:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30 text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <Section className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-black text-white grid place-items-center shadow-sm">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold leading-tight">Hunt Luxury Investments</p>
              <p className="text-xs text-muted-foreground -mt-0.5">VA • DC • MD • PA</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="hover:opacity-80">Services</a>
            <a href="#coaching" className="hover:opacity-80">Coaching</a>
            <a href="#markets" className="hover:opacity-80">Markets</a>
            <a href="#process" className="hover:opacity-80">Process</a>
            <a href="#contact" className="hover:opacity-80">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">Associate Broker • Long & Foster</Badge>
            <Button asChild className="rounded-full">
              <a href="#contact">Start Your Strategy <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>
        </Section>
      </header>

      {/* HERO */}
      <Section className="pt-10 md:pt-16 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Pill>Ultimate Luxury Service • Investment-Grade Strategy</Pill>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Find. Negotiate. Own with Intention.
            </h1>
            <p className="mt-4 text-muted-foreground text-base md:text-lg">
              We help discerning buyers and investors in VA, DC, MD, and PA acquire luxury properties and build wealth through 
              data‑driven strategy, elite negotiation, equipment rentals for show‑ready prep, and one‑on‑one coaching.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="rounded-full" asChild>
                <a href="#contact">Get My Options</a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <a href="#insights">See Market Signals</a>
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-6">
              <Stat label="Closed & Advised" value="$250M+" />
              <Stat label="Avg. Negotiation Gain" value="$35k" />
              <Stat label="Client 5★ Reviews" value="150+" />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Fiduciary • Boutique • Discreet
              <Users className="h-4 w-4" /> By‑referral, high‑touch
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[5/4] rounded-3xl overflow-hidden shadow-xl border bg-gradient-to-br from-zinc-100 to-zinc-50">
              {/* Replace with brand photography if available */}
              <div className="absolute inset-0 grid grid-rows-2 grid-cols-2">
                <div className="bg-[url('https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="bg-[url('https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="bg-[url('https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center" />
              </div>
            </div>
            <div className="absolute -bottom-6 left-6 right-6">
              <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <LineChart className="h-6 w-6" />
                    <div>
                      <p className="text-sm font-medium">This Week’s Signal</p>
                      <p className="text-xs text-muted-foreground">Northern VA: luxury DOM trending ↓, cash share ↑</p>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full" asChild>
                    <a href="#insights">View</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* TRUST BAR */}
      <Section className="py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Building2, text: "Luxury Resales & New Dev." },
            { icon: Landmark, text: "1031 & Portfolio Strategy" },
            { icon: Handshake, text: "Elite Negotiation Coaching" },
            { icon: DollarSign, text: "Equipment Rental for Prep" },
          ].map((item, i) => (
            <Card key={i} className="rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.text}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* SERVICES */}
      <Section id="services" className="py-6 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Luxury Home & Estate Search</CardTitle>
              <CardDescription>Off‑market access, private tours, discreet representation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Curated inventory across VA/DC/MD/PA",
                "Architectural and lifestyle matching",
                "Vendor network: staging, lighting, AV, wine rooms",
              ].map((t, i) => (
                <div className="flex items-start gap-2" key={i}>
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  <p>{t}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <a href="#contact">Request Access</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Investment Strategy & Analysis</CardTitle>
              <CardDescription>Market‑backed models for ROI, risk, and timing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Hold/Sell/1031 exchange scenarios",
                "Rent vs. Buy vs. Develop financials",
                "$ / SqFt, DOM, absorption, cash share trends",
              ].map((t, i) => (
                <div className="flex items-start gap-2" key={i}>
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  <p>{t}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <a href="#insights">See a Sample</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Negotiation Coaching + Prep Rentals</CardTitle>
              <CardDescription>Sharpen your edge and present flawlessly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "1:1 strategy sessions for offers & counters",
                "Luxury prep equipment rentals (pro lighting, decor, open‑house kits)",
                "Agent‑to‑agent positioning & scripts",
              ].map((t, i) => (
                <div className="flex items-start gap-2" key={i}>
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  <p>{t}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <a href="#contact">Book a Session</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* COACHING CTA */}
      <Section id="coaching" className="py-6 md:py-12">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Master the Art & Science of the Deal</h2>
            <p className="mt-3 text-muted-foreground">
              From anchoring and concessions to timeline leverage and escalation terms—learn the systems behind winning offers, 
              minimizing risk, and protecting long‑term value in competitive luxury markets.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Offer architecture & appraisal buffers",
                "Counter‑moves, walk‑away points, and scripts",
                "Vendor readiness to reduce uncertainty and boost price",
              ].map((t, i) => (
                <li key={i} className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> {t}</li>
              ))}
            </ul>
            <div className="mt-5 flex gap-3">
              <Button className="rounded-full" asChild>
                <a href="#contact">Schedule Coaching</a>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <a href="#process">See Our Process</a>
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="rounded-3xl overflow-hidden border shadow-xl aspect-[4/3] bg-[url('https://images.unsplash.com/photo-1582401656171-2963caa6d7a4?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
        </div>
      </Section>

      {/* MARKETS */}
      <Section id="markets" className="py-6 md:py-12">
        <div className="grid lg:grid-cols-4 gap-6">
          {[
            { title: "Virginia", desc: "Northern VA, Arlington, Great Falls, McLean, Alexandria.", tag: "NOVA" },
            { title: "District of Columbia", desc: "Georgetown, Kalorama, West End, Cathedral Heights.", tag: "DC" },
            { title: "Maryland", desc: "Bethesda, Chevy Chase, Potomac, Annapolis.", tag: "MD" },
            { title: "Pennsylvania", desc: "Philadelphia Main Line, Rittenhouse, Chestnut Hill.", tag: "PA" },
          ].map((m, i) => (
            <Card key={i} className="rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{m.title}</CardTitle>
                  <Badge variant="secondary">{m.tag}</Badge>
                </div>
                <CardDescription>{m.desc}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <a href="#contact">Explore {m.tag}</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      {/* INSIGHTS */}
      <Section id="insights" className="py-6 md:py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Luxury Inventory Pulse",
              desc: "Weekly update on new-to-market estates, DOM, and price‑improvement velocity.",
            },
            {
              title: "Cash vs. Financed Share",
              desc: "How liquidity shifts negotiation power by sub‑market and price band.",
            },
            {
              title: "Rent vs. Hold vs. 1031",
              desc: "Scenario analysis with cap‑rate bands and tax impact view.",
            },
          ].map((x, i) => (
            <Card key={i} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg">{x.title}</CardTitle>
                <CardDescription>{x.desc}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <a href="#contact">Request Sample</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      {/* PROCESS */}
      <Section id="process" className="py-6 md:py-12">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: MapPin, title: "Discover", text: "Define goals, lifestyle, risk and time horizon." },
            { icon: LineChart, title: "Model", text: "Market comps, absorption, and scenario planning." },
            { icon: Handshake, title: "Negotiate", text: "Terms, timing, buffers, and win‑win positioning." },
            { icon: Building2, title: "Close & Grow", text: "Vendors, leasing, and portfolio optimization." },
          ].map((step, i) => (
            <Card key={i} className="rounded-3xl">
              <CardHeader className="space-y-3">
                <step.icon className="h-6 w-6" />
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* TESTIMONIAL */}
      <Section className="py-6 md:py-12">
        <Card className="rounded-3xl overflow-hidden">
          <CardContent className="p-6 md:p-10 grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <p className="text-xl md:text-2xl font-medium leading-relaxed">
                “They don’t just show homes—they architect outcomes. Our Great Falls purchase landed under appraised value with seller credits, and their post‑close plan turned it into a cash‑flowing asset within 90 days.”
              </p>
              <p className="mt-3 text-sm text-muted-foreground">Private Client • Great Falls, VA</p>
            </div>
            <div className="rounded-2xl border p-5">
              <p className="text-sm font-medium">Proof Points</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> $47k average net improvement via negotiation</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> 12‑day median DOM (luxury band)</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> 150+ 5★ client reviews</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* CONTACT / LEAD FORM */}
      <Section id="contact" className="py-10 md:py-16">
        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Get Your Options</CardTitle>
                <CardDescription>
                  Share a few details and we’ll send a personalized path—listings, off‑market access, investment models, and a clear next step.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!submitted ? (
                  <form data-testid="lead-form" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" required placeholder="Jane Doe" value={form.name} onChange={onChange} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={onChange} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" placeholder="(202) 555‑0123" value={form.phone} onChange={onChange} />
                    </div>
                    <div>
                      <Label htmlFor="interest">Interest</Label>
                      <Input id="interest" name="interest" placeholder="Georgetown condo • McLean estate • 1031"
                        value={form.interest} onChange={onChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="message">Anything else?</Label>
                      <Textarea id="message" name="message" placeholder="Timeline, budget, neighborhoods, goals" rows={4}
                        value={form.message} onChange={onChange} />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground">By submitting, you agree to be contacted about your inquiry.</div>
                      <div className="flex items-center gap-2">
                        {submitting && <span className="text-xs">Submitting…</span>}
                        <Button data-testid="submit-btn" type="submit" disabled={submitting} className="rounded-full">Send My Plan <ArrowRight className="ml-2 h-4 w-4" /></Button>
                      </div>
                    </div>
                    {errorMsg && <p className="md:col-span-2 text-sm text-red-600">{errorMsg}</p>}
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-lg font-medium">Thanks—your request is in.</p>
                    <p className="text-sm text-muted-foreground">We’ll follow up shortly with tailored options for you.</p>
                    <Button className="rounded-full" onClick={() => setSubmitted(false)}>Submit Another</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Concierge Contact</CardTitle>
                <CardDescription>Discreet, by‑appointment only.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> (703) 555‑0187</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> concierge@huntluxuryinvestments.com</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Tysons • Georgetown • Bethesda • Philadelphia</div>
                <div className="pt-2">
                  <p className="font-medium">Compliance</p>
                  <ul className="mt-2 space-y-2 text-muted-foreground">
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> Licensed in VA, DC, MD, PA</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> Long & Foster • Associate Broker (VA)</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" /> Equal Housing Opportunity</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-6 md:py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              q: "Do you work with off‑market or private listings?",
              a: "Yes—through our network we often access private opportunities and whisper listings across VA/DC/MD/PA.",
            },
            {
              q: "How does the equipment rental work?",
              a: "We maintain curated kits (lighting, decor, signage) to elevate showings and listings; concierge delivery available.",
            },
            {
              q: "What does coaching cover?",
              a: "Offer design, tactical concessions, agent‑to‑agent strategy, and timing—tailored to your specific property goals.",
            },
          ].map((f, i) => (
            <Card key={i} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">{f.q}</CardTitle>
                <CardDescription>{f.a}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="border-t mt-12">
        <Section className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4" /> Hunt Luxury Investments — Luxury Real Estate & Investment Advisory
          </div>
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} HLI</span>
            <span>•</span>
            <a href="#contact" className="hover:opacity-80">Privacy & Disclosures</a>
          </div>
        </Section>
      </footer>
    </div>
  );
}
