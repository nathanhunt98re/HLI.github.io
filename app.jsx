/*
  Zero-dependency React Landing Page (UMD/Babel-friendly)
  - Works on GitHub Pages with index.html loading React, ReactDOM, and Babel Standalone
  - No imports, no bundler, no Tailwind/shadcn — just lightweight CSS
  - Includes runtime smoke tests in console
  - Bootstrap supports React 18 (createRoot) with React 17 fallback (render)
  - NEW: Safe globals + better bootstrap to avoid build errors when createRoot is missing
*/

// ---------- Safe globals & early diagnostics ----------
const React = (typeof window !== 'undefined' && window.React) ? window.React : null;
const ReactDOM = (typeof window !== 'undefined' && window.ReactDOM) ? window.ReactDOM : null;

if (!React || !ReactDOM) {
  (function () {
    const msgLines = [
      'React and/or ReactDOM were not found on window.',
      'Ensure index.html includes:',
      '  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>',
      '  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>',
      '  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>',
      'And that this file is loaded with: <script type="text/babel" data-presets="env,react" src="app.jsx"></script>'
    ].join('\n');
    const rootEl = document.getElementById('root') || document.body;
    const pre = document.createElement('pre');
    pre.textContent = msgLines;
    pre.style.cssText = 'color:#b91c1c;background:#fff3f3;border:1px solid #fecaca;padding:12px;border-radius:8px;white-space:pre-wrap;';
    rootEl.appendChild(pre);
    console.error(msgLines);
  })();
  throw new Error('Missing React/ReactDOM globals');
}

const { useState, useEffect } = React;

// --------------------------- Styles ---------------------------
const GlobalStyles = () => (
  <style>{`
    :root{--bg:#fafafa;--fg:#111;--muted:#6b7280;--brand:#111;--accent:#0ea5e9;--card:#ffffff;--border:#e5e7eb}
    *{box-sizing:border-box} html,body,#root{height:100%}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--fg)}
    .container{max-width:1120px;margin:0 auto;padding:0 16px}
    .nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.8);backdrop-filter:saturate(180%) blur(8px);border-bottom:1px solid var(--border)}
    .nav-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0}
    .brand{display:flex;gap:12px;align-items:center}
    .logo{height:36px;width:36px;border-radius:12px;background:#000;color:#fff;display:grid;place-items:center;font-weight:700}
    .nav a{color:inherit;text-decoration:none}
    .menu{display:none;gap:20px}
    @media(min-width:768px){.menu{display:flex}}

    .btn{display:inline-flex;align-items:center;gap:8px;border-radius:9999px;border:1px solid var(--fg);padding:10px 16px;background:#111;color:#fff;cursor:pointer}
    .btn:hover{opacity:.9}
    .btn-outline{background:#fff;color:var(--fg);border-color:var(--border)}
    .btn:disabled{opacity:.6;cursor:not-allowed}

    .grid{display:grid;gap:24px}
    .grid-2{grid-template-columns:1fr}
    @media(min-width:900px){.grid-2{grid-template-columns:1fr 1fr}}
    .grid-3{grid-template-columns:1fr}
    @media(min-width:900px){.grid-3{grid-template-columns:1fr 1fr 1fr}}
    .grid-4{grid-template-columns:1fr}
    @media(min-width:900px){.grid-4{grid-template-columns:1fr 1fr 1fr 1fr}}

    .hero{padding:48px 0}
    .title{font-size:clamp(28px,4vw,44px);line-height:1.15;margin:12px 0 0;font-weight:700}
    .muted{color:var(--muted)}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:16px}
    .stat .v{font-size:28px;font-weight:600}
    .stat .l{color:var(--muted);font-size:12px;margin-top:2px}

    .card{background:var(--card);border:1px solid var(--border);border-radius:20px;box-shadow:0 2px 10px rgba(0,0,0,.03)}
    .card .p{padding:20px}
    .pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:9999px;padding:6px 12px;font-size:12px;background:rgba(255,255,255,.7);backdrop-filter:blur(4px)}

    .img-grid{position:relative;border-radius:24px;overflow:hidden;border:1px solid var(--border);aspect-ratio:5/4;background:#f6f6f6}
    .img-grid-inner{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
    .img{background-size:cover;background-position:center}

    .section{padding:28px 0}
    .section-lg{padding:48px 0}

    .list{display:flex;gap:8px;align-items:flex-start}
    .dot{height:18px;width:18px;border-radius:9999px;background:#111;display:inline-grid;place-items:center;color:#fff;font-size:12px;line-height:1}

    .form{display:grid;gap:14px}
    @media(min-width:900px){.form{grid-template-columns:1fr 1fr}}
    .form label{display:block;font-size:12px;margin-bottom:6px;color:#111}
    .form input,.form textarea{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font:inherit}
    .form textarea{min-height:110px;grid-column:1/-1}
    .form-row{display:flex;align-items:center;justify-content:space-between;gap:12px;grid-column:1/-1}

    footer{border-top:1px solid var(--border);margin-top:24px}
  `}</style>
);

// --------------------------- UI bits ---------------------------
const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`section ${className}`}><div className="container">{children}</div></section>
);

const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}><div className="p">{children}</div></div>
);

const Stat = ({ value, label }) => (
  <div className="stat"><div className="v">{value}</div><div className="l">{label}</div></div>
);

const Pill = ({ children }) => <span className="pill">✨ {children}</span>;

const Button = ({ variant, className = "", children, ...props }) => (
  <button className={`btn ${variant === 'outline' ? 'btn-outline' : ''} ${className}`} {...props}>{children}</button>
);

// --------------------------- App ---------------------------
function LandingPage(){
  const [form, setForm] = useState({ name:"", email:"", phone:"", interest:"", message:"" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const CRM_CONFIG = {
    mode: "mailto", // 'mailto' | 'formspree' | 'webhook'
    formspreeEndpoint: "",
    webhookEndpoint: ""
  };

  async function submitLead(payload){
    if(CRM_CONFIG.mode === 'mailto'){
      const params = new URLSearchParams({
        subject: `New Inquiry — ${payload.name}`,
        body: JSON.stringify(payload, null, 2)
      });
      window.location.href = `mailto:concierge@huntluxuryinvestments.com?${params.toString()}`;
      return;
    }
    const url = CRM_CONFIG.mode==='formspree'? CRM_CONFIG.formspreeEndpoint : CRM_CONFIG.webhookEndpoint;
    const res = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json', 'Accept':'application/json'}, body: JSON.stringify(payload)});
    if(!res.ok) throw new Error('Submit failed');
  }

  const onSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setErrorMsg("");
    try{
      await submitLead({ ...form, source:'HLI Landing', ts:new Date().toISOString() });
      setSubmitted(true); setForm({ name:"", email:"", phone:"", interest:"", message:"" });
    }catch(err){
      console.error(err); setErrorMsg('Could not submit. Try again or email concierge@huntluxuryinvestments.com.');
    }finally{ setSubmitting(false); }
  };

  // ---------------- Tests (component-level smoke) ----------------
  useEffect(()=>{
    const formEl = document.querySelector('form[data-testid="lead-form"]');
    console.group('Component Smoke Tests');
    console.assert(!!formEl, 'Lead form should exist');
    if(formEl){
      const inBtn = formEl.querySelectorAll('button[type="submit"]').length;
      const outBtn = document.querySelectorAll('#contact button[type="submit"]').length - inBtn;
      console.assert(inBtn===1, 'Exactly one submit button in form');
      console.assert(outBtn===0, 'No submit buttons outside form in contact section');
      const nameReq = document.getElementById('name')?.hasAttribute('required');
      const emailReq = document.getElementById('email')?.hasAttribute('required');
      console.assert(!!nameReq && !!emailReq, 'Name and Email are required');
    }
    console.groupEnd();
  },[]);

  return (
    <>
      <GlobalStyles />
      <div className="nav">
        <div className="container nav-row">
          <div className="brand">
            <div className="logo">H</div>
            <div>
              <div style={{fontWeight:600}}>Hunt Luxury Investments</div>
              <div className="muted" style={{fontSize:12,marginTop:2}}>VA • DC • MD • PA</div>
            </div>
          </div>
          <nav className="menu">
            <a href="#services">Services</a>
            <a href="#coaching">Coaching</a>
            <a href="#markets">Markets</a>
            <a href="#process">Process</a>
            <a href="#contact">Contact</a>
          </nav>
          <Button onClick={()=>document.getElementById('contact').scrollIntoView({behavior:'smooth'})}>Start Your Strategy →</Button>
        </div>
      </div>

      <Section className="hero">
        <div className="grid grid-2" style={{alignItems:'center'}}>
          <div>
            <Pill>Ultimate Luxury Service • Investment‑Grade Strategy</Pill>
            <h1 className="title">Find. Negotiate. Own with Intention.</h1>
            <p className="muted" style={{fontSize:18,marginTop:12}}>
              We help discerning buyers and investors in VA, DC, MD, and PA acquire luxury properties and build wealth through
              data‑driven strategy, elite negotiation, equipment rentals for show‑ready prep, and one‑on‑one coaching.
            </p>
            <div style={{display:'flex',gap:12,marginTop:16,flexWrap:'wrap'}}>
              <Button onClick={()=>document.getElementById('contact').scrollIntoView({behavior:'smooth'})}>Get My Options</Button>
              <Button variant="outline" onClick={()=>document.getElementById('insights').scrollIntoView({behavior:'smooth'})}>See Market Signals</Button>
            </div>
            <div className="stats">
              <Stat value="$250M+" label="Closed & Advised"/>
              <Stat value="$35k" label="Avg. Negotiation Gain"/>
              <Stat value="150+" label="Client 5★ Reviews"/>
            </div>
            <div className="muted" style={{display:'flex',gap:12,marginTop:14,fontSize:12}}>
              <s
