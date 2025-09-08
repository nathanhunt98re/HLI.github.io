// Luxury Real Estate & Investment Landing Page — React 18 (v16)
// Purpose: Eliminate React #130 by ensuring the default export is a
// valid function component and every rendered element is a valid type.
// Changes from v15:
// - Export a component named `App` as the default (some hosts look for App).
// - Avoid importing `Fragment`; use JSX <>…</> to prevent odd symbol mismatches.
// - No globals, no manual createRoot — the canvas/bundler mounts default export.
// - Kept/expanded smoke tests (console.assert) to catch regressions.

import React, { useEffect, useMemo, useState } from "react";

// ---------- UI primitives ----------
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs backdrop-blur">
      ✨ {children}
    </span>
  );
}

function Button({
  variant = "solid",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed";
  const kind =
    variant === "outline"
      ? "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
      : "bg-black text-white hover:opacity-90";
  return <button className={`${base} ${kind} ${className}`} {...props} />;
}

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  );
}

function Section({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`py-7 md:py-12 ${className}`}>
      <div className="container mx-auto max-w-5xl px-4">{children}</div>
    </section>
  );
}

// ---------- Lead form ----------
function LeadForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      // Default: mailto capture. Swap to webhook/CRM when ready.
      const payload = {
        ...form,
        source: "HLI Landing",
        ts: new Date().toISOString(),
      };
      const params = new URLSearchParams({
        subject: `New Inquiry — ${payload.name || "(no name)"}`,
        body: JSON.stringify(payload, null, 2),
      });
      if (typeof window !== "undefined") {
        window.location.href = `mailto:concierge@huntluxuryinvestments.com?${params.toString()}`;
      }
      onSubmitted?.();
      setForm({ name: "", email: "", phone: "", interest: "", message: "" });
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not submit. Try again or email concierge@huntluxuryinvestments.com.");
    } finally {
      setSubmitting(false);
    }
  }

  // Smoke tests
  useEffect(() => {
    try {
      const formEl = document.querySelector('form[data-testid="lead-form"]');
      console.group("Component Smoke Tests");
      console.assert(!!formEl, "Lead form should exist");
      if (formEl) {
        const inBtn = formEl.querySelectorAll('button[type="submit"]').length;
        const outBtn = document.querySelectorAll('#contact button[type="submit"]').length - inBtn;
        console.assert(inBtn === 1, "Exactly one submit button in form");
        console.assert(outBtn === 0, "No submit buttons outside form");
        const nameReq = document.getElementById("name")?.hasAttribute("required");
        const emailReq = document.getElementById("email")?.hasAttribute("required");
        console.assert(!!nameReq && !!emailReq, "Name and Email are required");
      }
      const ctas = document.querySelectorAll("button");
      console.assert(ctas.length >= 3, "At least three CTA buttons exist");
      console.groupEnd();
    } catch (e) {
      console.warn("Smoke tests skipped:", e);
    }
  }, []);

  return (
    <form data-testid="lead-form" onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      <div>
        <label htmlFor="name" className="mb-1 block text-xs text-gray-800">Full Name</label>
        <input id="name" name="name" required value={form.name} onChange={onChange} placeholder="Jane Doe" className="w-full rounded-lg border border-gray-200 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-xs text-gray-800">Email</label>
        <input id="email" name="email" type="email" required value={form.email} onChange={onChange} placeholder="you@example.com" className="w-full rounded-lg border border-gray-200 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-xs text-gray-800">Phone</label>
        <input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="(202) 555‑0123" className="w-full rounded-lg border border-gray-200 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="interest" className="mb-1 block text-xs text-gray-800">Interest</label>
        <input id="interest" name="interest" value={form.interest} onChange={onChange} placeholder="Georgetown condo • McLean estate • 1031" className="w-full rounded-lg border border-gray-200 px-3 py-2" />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="message" className="mb-1 block text-xs text-gray-800">Anything else?</label>
        <textarea id="message" name="message" value={form.message} onChange={onChange} placeholder="Timeline, budget, neighborhoods, goals" className="w-full min-h-[110px] rounded-lg border border-gray-200 px-3 py-2" />
      </div>
      <div className="md:col-span-2 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">By submitting, you agree to be contacted about your inquiry.</p>
        <div className="flex items-center gap-2">
          {submitting && <span className="text-xs text-gray-500">Submitting…</span>}
          <Button type="submit" disabled={submitting}>Send My Plan →</Button>
        </div>
      </div>
      {errorMsg && <div className="md:col-span-2 text-sm text-red-600">{errorMsg}</div>}
    </form>
  );
}

// ---------- Page ----------
export default function App() {
  const [submitted, setSubmitted] = useState(false);

  const scrollTo = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const markets = useMemo(
    () => [
      { title: "Virginia", desc: "Northern VA, Arlington, Great Falls, McLean, Alexandria.", tag: "NOVA" },
      { title: "District of Columbia", desc: "Georgetown, Kalorama, West End, Cathedral Heights.", tag: "DC" },
      { title: "Maryland", desc: "Bethesda, Chevy Chase, Potomac, Annapolis.", tag: "MD" },
      { title: "Pennsylvania", desc: "Philadelphia Main Line, Rittenhouse, Chestnut Hill.", tag: "PA" },
    ],
    []
  );

  // Bootstrap smoke tests (page-level)
  useEffect(() => {
    try {
      console.group("Bootstrap Tests");
      const required = ["services", "coaching", "markets", "insights", "process", "contact"];
      required.forEach((id) => console.assert(!!document.getElementById(id), `Section #${id} exists`));
      const h1s = document.querySelectorAll("h1");
      console.assert(h1s.length >= 1, "At least one <h1> present");
      console.groupEnd();
    } catch (e) {
      console.warn("Bootstrap tests skipped:", e);
    }
  }, []);

  return (
    <>
      {/* Nav */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white font-bold">H</div>
              <div>
                <div className="font-semibold">Hunt Luxury Investments</div>
                <div className="mt-0.5 text-xs text-gray-500">VA • DC • MD • PA</div>
              </div>
            </div>
            <nav className="hidden gap-5 md:flex text-sm">
              <a href="#services">Services</a>
              <a href="#coaching">Coaching</a>
              <a href="#markets">Markets</a>
              <a href="#process">Process</a>
              <a href="#contact">Contact</a>
            </nav>
            <Button onClick={scrollTo("contact")}>Start Your Strategy →</Button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <Section className="pt-10">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <Pill>Ultimate Luxury Service • Investment‑Grade Strategy</Pill>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">Find. Negotiate. Own with Intention.</h1>
            <p className="mt-3 text-[17px] text-gray-600">
              We help discerning buyers and investors in VA, DC, MD, and PA acquire luxury properties and build wealth through
              data‑driven strategy, elite negotiation, equipment rentals for show‑ready prep, and one‑on‑one coaching.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={scrollTo("contact")}>Get My Options</Button>
              <Button variant="outline" onClick={scrollTo("insights")}>See Market Signals</Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Stat value="$250M+" label="Closed & Advised" />
              <Stat value="$35k" label="Avg. Negotiation Gain" />
              <Stat value="150+" label="Client 5★ Reviews" />
            </div>
            <div className="mt-3 flex gap-3 text-xs text-gray-500">
              <span>✔ Fiduciary • Boutique • Discreet</span>
              <span>✔ By‑referral, high‑touch</span>
            </div>
          </div>
          <div>
            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=1400&auto=format&fit=crop)" }} />
                <div className="bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop)" }} />
                <div className="bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1400&auto=format&fit=crop)" }} />
                <div className="bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1400&auto=format&fit=crop)" }} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Quick value tiles */}
      <Section>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["🏙️", "Luxury Resales & New Dev."],
            ["🏛️", "1031 & Portfolio Strategy"],
            ["🤝", "Elite Negotiation Coaching"],
            ["🧰", "Equipment Rental for Prep"],
          ].map(([icon, text], i) => (
            <Card key={i}>
              <div className="flex items-center gap-2">
                <div className="text-lg">{icon}</div>
                <div>{text}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section id="services" className="md:py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <h3 className="text-lg font-semibold">Luxury Home & Estate Search</h3>
            <p className="mt-1 text-gray-600">Off‑market access, private tours, discreet representation.</p>
            {[
              "Curated inventory across VA/DC/MD/PA",
              "Architectural and lifestyle matching",
              "Vendor network: staging, lighting, AV, wine rooms",
            ].map((t, i) => (
              <div key={i} className="mt-2 flex items-start gap-2">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-black text-[10px] text-white">✓</span>
                <span>{t}</span>
              </div>
            ))}
            <div className="mt-3"><Button variant="outline" onClick={scrollTo("contact")}>Request Access</Button></div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Investment Strategy & Analysis</h3>
            <p className="mt-1 text-gray-600">Market‑backed models for ROI, risk, and timing.</p>
            {[
              "Hold/Sell/1031 exchange scenarios",
              "Rent vs. Buy vs. Develop financials",
              "$ / SqFt, DOM, absorption, cash share trends",
            ].map((t, i) => (
              <div key={i} className="mt-2 flex items-start gap-2">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-black text-[10px] text-white">✓</span>
                <span>{t}</span>
              </div>
            ))}
            <div className="mt-3"><Button variant="outline" onClick={scrollTo("insights")}>See a Sample</Button></div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Negotiation Coaching + Prep Rentals</h3>
            <p className="mt-1 text-gray-600">Sharpen your edge and present flawlessly.</p>
            {[
              "1:1 strategy sessions for offers & counters",
              "Luxury prep equipment rentals (lighting, decor, open‑house kits)",
              "Agent‑to‑agent positioning & scripts",
            ].map((t, i) => (
              <div key={i} className="mt-2 flex items-start gap-2">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-black text-[10px] text-white">✓</span>
                <span>{t}</span>
              </div>
            ))}
            <div className="mt-3"><Button variant="outline" onClick={scrollTo("contact")}>Book a Session</Button></div>
          </Card>
        </div>
      </Section>

      {/* Coaching */}
      <Section id="coaching" className="md:py-12">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Master the Art & Science of the Deal</h2>
            <p className="mt-2 text-gray-600">From anchoring and concessions to timeline leverage and escalation terms—learn the systems behind winning offers, minimizing risk, and protecting long‑term value in competitive luxury markets.</p>
            {[
              "Offer architecture & appraisal buffers",
              "Counter‑moves, walk‑away points, and scripts",
              "Vendor readiness to reduce uncertainty and boost price",
            ].map((t, i) => (
              <div key={i} className="mt-2 flex items-start gap-2">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-black text-[10px] text-white">✓</span>
                <span>{t}</span>
              </div>
            ))}
            <div className="mt-3 flex gap-3">
              <Button onClick={scrollTo("contact")}>Schedule Coaching</Button>
              <Button variant="outline" onClick={scrollTo("process")}>See Our Process</Button>
            </div>
          </div>
          <div>
            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1582401656171-2963caa6d7a4?q=80&w=1400&auto=format&fit=crop)" }} />
                <div className="bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=1400&auto=format&fit=crop)" }} />
                <div className="bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop)" }} />
                <div className="bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1400&auto=format&fit=crop)" }} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Markets */}
      <Section id="markets" className="md:py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {markets.map((m, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs">{m.tag}</span>
              </div>
              <p className="mt-1 text-gray-600">{m.desc}</p>
              <Button variant="outline" className="mt-2 w-full" onClick={scrollTo("contact")}>Explore {m.tag}</Button>
            </Card>
          ))}
        </div>
      </Section>

      {/* Insights */}
      <Section id="insights" className="md:py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Luxury Inventory Pulse", desc: "Weekly update on new‑to‑market estates, DOM, and price‑improvement velocity." },
            { title: "Cash vs. Financed Share", desc: "How liquidity shifts negotiation power by sub‑market and price band." },
            { title: "Rent vs. Hold vs. 1031", desc: "Scenario analysis with cap‑rate bands and tax impact view." },
          ].map((x, i) => (
            <Card key={i}>
              <h3 className="text-lg font-semibold">{x.title}</h3>
              <p className="mt-1 text-gray-600">{x.desc}</p>
              <Button variant="outline" className="mt-2 w-full" onClick={scrollTo("contact")}>Request Sample</Button>
            </Card>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section id="process" className="md:py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["📍", "Discover", "Define goals, lifestyle, risk and time horizon."],
            ["📈", "Model", "Market comps, absorption, and scenario planning."],
            ["🤝", "Negotiate", "Terms, timing, buffers, and win‑win positioning."],
            ["🏢", "Close & Grow", "Vendors, leasing, and portfolio optimization."],
          ].map(([icon, title, desc], i) => (
            <Card key={i}>
              <div className="text-2xl">{icon}</div>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-gray-600">{desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Social proof */}
      <Section>
        <Card>
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <p className="text-[19px] font-semibold leading-snug">“They don’t just show homes—they architect outcomes. Our Great Falls purchase landed under appraised value with seller credits, and their post‑close plan turned it into a cash‑flowing asset within 90 days.”</p>
              <p className="mt-1 text-gray-500">Private Client • Great Falls, VA</p>
            </div>
            <div>
              <p className="font-semibold">Proof Points</p>
              <ul className="mt-1 list-disc pl-5 text-gray-600">
                <li>$47k average net improvement via negotiation</li>
                <li>12‑day median DOM (luxury band)</li>
                <li>150+ 5★ client reviews</li>
              </ul>
            </div>
          </div>
        </Card>
      </Section>

      {/* Contact */}
      <Section id="contact" className="md:py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Get Your Options</h3>
            <p className="mt-1 text-gray-600">Share a few details and we’ll send a personalized path—listings, off‑market access, investment models, and a clear next step.</p>
            {!submitted ? (
              <LeadForm onSubmitted={() => setSubmitted(true)} />
            ) : (
              <div className="mt-2">
                <p className="font-semibold">Thanks—your request is in.</p>
                <p className="text-gray-600">We’ll follow up shortly with tailored options for you.</p>
                <div className="mt-2"><Button onClick={() => setSubmitted(false)}>Submit Another</Button></div>
              </div>
            )}
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Concierge Contact</h3>
            <p className="mt-1 text-gray-600">Discreet, by‑appointment only.</p>
            <div className="mt-2 flex items-start gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[11px] text-white">☎</span><span>(703) 555‑0187</span></div>
            <div className="mt-2 flex items-start gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[11px] text-white">✉</span><span>concierge@huntluxuryinvestments.com</span></div>
            <div className="mt-2 flex items-start gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[11px] text-white">📍</span><span>Tysons • Georgetown • Bethesda • Philadelphia</span></div>
            <div className="mt-3">
              <p className="font-semibold">Compliance</p>
              <ul className="mt-1 list-disc pl-5 text-gray-600">
                <li>Licensed in VA, DC, MD, PA</li>
                <li>Long & Foster • Associate Broker (VA)</li>
                <li>Equal Housing Opportunity</li>
              </ul>
            </div>
          </Card>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <Section className="py-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>Hunt Luxury Investments — Luxury Real Estate & Investment Advisory</div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>© {new Date().getFullYear()} HLI</span>
              <span>•</span>
              <a href="#contact" className="hover:underline">Privacy & Disclosures</a>
            </div>
          </div>
        </Section>
      </footer>
    </>
  );
}
