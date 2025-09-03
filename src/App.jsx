// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Rocket,
  Code2,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Search,
  Zap,
  Menu,
  X,
  CheckCircle2,
  Star,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Helmet } from "react-helmet";

/* =========================
   Scroll suave para anchors
   ========================= */
// Scroll con compensación de header sticky
function smoothScrollToY(targetY, duration = 480) {
  const startY = window.scrollY || window.pageYOffset;
  const diff = targetY - startY;
  if (Math.abs(diff) < 1) return;

  const start = performance.now();
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const y = startY + diff * ease(p);
    window.scrollTo(0, y);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Intercepta clicks en <a href="#..."> y aplica scroll suave con offset del header
function useSmoothAnchors() {
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;

      const el = document.querySelector(href);
      if (!el) return;

      e.preventDefault();

      // Calcula offset por header sticky (~96px según CSS)
      const header = document.querySelector("header");
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - (headerH + 12);

      smoothScrollToY(targetY, 480);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

/* =========================
   UI base / helpers
   ========================= */

const COLORS = { night: "#0b0f2b", glow: "#e4e89e", white: "#ffffff", wa: "#25D366" };
const LOGO_SRC = "/logo.png"; // tu logo en public/logo.png

function RivoLogo({ className = "h-14 md:h-16 w-auto" }) {
  return <img src={LOGO_SRC} alt="Rivo" className={`${className} object-contain`} />;
}

function GradientWord({ children }) {
  return (
    <span className="bg-[radial-gradient(100%_100%_at_50%_0%,#e4e89e_0%,#fff_35%,#e4e89e_100%)] bg-clip-text text-transparent">
      {children}
    </span>
  );
}

function Title({ children }) {
  return (
    <h2 className="text-balance text-3xl font-semibold md:text-4xl">
      <GradientWord>{children}</GradientWord>
    </h2>
  );
}

function CTA({ children, href, variant = "primary" }) {
  const base =
    "interact inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-transform focus:outline-none focus:ring-2 focus:ring-[color:var(--rivo-glow)] focus:ring-offset-2 focus:ring-offset-[color:var(--rivo-bg)]";
  const styles =
    variant === "primary"
      ? "bg-[color:var(--rivo-glow)] text-[color:var(--rivo-night)] hover:-translate-y-[2px]"
      : "bg-white/5 text-white hover:bg-white/10 hover:-translate-y-[2px]";
  return (
    <a href={href || "#contacto"} className={`${base} ${styles}`}>
      {children}
      <ArrowRight className="size-4" />
    </a>
  );
}

function Card({ className = "", children }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] transition duration-200 ${className}`}>
      {children}
    </div>
  );
}

function AnimatedBorder({ children, className = "" }) {
  return (
    <div className={`relative ${className}`} data-plan-card>
      <div className="pointer-events-none absolute -inset-[2px] rounded-3xl bg-[color:var(--rivo-glow)]/50 blur-[10px]" />
      <div className="relative rounded-3xl border border-[color:var(--rivo-glow)] bg-[color:var(--rivo-bg)]/92">
        {children}
      </div>
    </div>
  );
}

function PriceText({ value }) {
  const str = String(value || "");
  let currency = ""; let amount = str;
  if (str.startsWith("USD ")) { currency = "USD"; amount = str.replace("USD ", ""); }
  const long = amount.length > 8;
  const size = long ? "text-4xl md:text-5xl" : "text-5xl md:text-6xl";
  return (
    <div className="inline-flex items-baseline gap-2">
      <span className={`${size} font-semibold leading-none text-white`}>{amount}</span>
      {currency && <span className="text-sm font-semibold tracking-wide text-[color:var(--rivo-glow)]">{currency}</span>}
    </div>
  );
}

/* =========================
   Hooks utilitarios / efectos
   ========================= */

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && setInView(true)),
      { threshold: 0.25 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function Counter({ to = 100, suffix = "", duration = 1500 }) {
  const el = useRef(null);
  const inView = useInView(el);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVal(to); return; }
    let start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [inView, to, duration]);
  return <div ref={el} className="text-5xl font-semibold text-[color:var(--rivo-glow)]">{val}{suffix}</div>;
}

function useParallaxHero(ref) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", (x * 6).toFixed(2));
      el.style.setProperty("--py", (y * 6).toFixed(2));
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [ref]);
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <a href="#top" aria-label="Volver arriba" className="interact fixed bottom-5 right-20 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition hover:-translate-y-[2px]">
      <ChevronUp className="size-5" />
    </a>
  );
}

/* =========================
   Visual del héroe (Orbe con logo)
   ========================= */
// --- HeroOrb v4 (suave + pro) ---
function HeroOrb() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Estado interno suavizado
    let raf = 0;
    const target = { x: 0, y: 0, lx: 50, ly: 50 }; // destino
    const state  = { x: 0, y: 0, lx: 50, ly: 50 }; // valor actual
    const MAX_ROT = 6;   // grados máximos de rotación (más sutil que 10)
    const EASE    = 0.08; // factor de suavizado (0..1)

    function loop() {
      state.x  += (target.x  - state.x)  * EASE;
      state.y  += (target.y  - state.y)  * EASE;
      state.lx += (target.lx - state.lx) * EASE;
      state.ly += (target.ly - state.ly) * EASE;

      el.style.setProperty("--rx", (-state.y * MAX_ROT).toFixed(3) + "deg");
      el.style.setProperty("--ry", ( state.x * MAX_ROT).toFixed(3) + "deg");
      el.style.setProperty("--lx", state.lx.toFixed(2) + "%");
      el.style.setProperty("--ly", state.ly.toFixed(2) + "%");

      raf = requestAnimationFrame(loop);
    }

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2; // -1..1
      const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      target.x = Math.max(-1, Math.min(1, nx));
      target.y = Math.max(-1, Math.min(1, ny));
      target.lx = ((nx + 1) / 2) * 100;
      target.ly = ((ny + 1) / 2) * 100;
    }

    function onLeave() {
      target.x = 0; target.y = 0;
      target.lx = 50; target.ly = 50;
    }

    if (!prefersReduced) {
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      if (!prefersReduced) {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[450px] [perspective:1200px]"
      style={{
        // valores iniciales
        "--rx": "0deg",
        "--ry": "0deg",
        "--lx": "50%",
        "--ly": "50%",
      }}
    >
      {/* Contenedor 3D */}
      <div
        className="
          relative aspect-square rounded-[28px]
          border border-white/12 bg-white/[0.035] backdrop-blur-sm
          shadow-[0_18px_70px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(255,255,255,0.04)]
          overflow-hidden
          will-change-transform
        "
        style={{
          transform: "rotateX(var(--rx)) rotateY(var(--ry))",
          transition: "transform 80ms linear",
        }}
      >
        {/* Glow volumétrico + spotlight SUAVE */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(18rem 18rem at var(--lx) var(--ly), rgba(228,232,158,0.22) 0%, rgba(228,232,158,0.10) 35%, transparent 60%)",
            filter: "blur(22px)",
            opacity: 0.8,
          }}
        />

        {/* Brillos radiales concéntricos */}
        <div className="absolute inset-0 opacity-70 mix-blend-screen">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(closest-side, rgba(228,232,158,0.18), transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(closest-side, rgba(228,232,158,0.10), transparent 45%)",
              mask:
                "radial-gradient(closest-side, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)",
            }}
          />
        </div>

        {/* Patrón de puntos sutil */}
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.55) 0.55px, transparent 0.55px)",
            backgroundSize: "14px 14px",
            transform: "translateZ(0)", // evita shimmer
          }}
        />

        {/* “Beams” suaves que giran MUY lento */}
        <div
          className="absolute -inset-10 opacity-[0.18] [mask-image:radial-gradient(circle_at_center,black_50%,transparent_80%)]"
          style={{
            background:
              "conic-gradient(from 200deg at 50% 50%, rgba(255,255,255,0.20), transparent 25%, rgba(255,255,255,0.12) 35%, transparent 60%, rgba(255,255,255,0.12) 75%, transparent 95%)",
            animation: "rivo-spin 28s linear infinite",
          }}
        />

        {/* Borde interno con glass */}
        <div className="absolute inset-3 rounded-[22px] border border-white/10 bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />

        {/* Logo centrado */}
        <div className="absolute inset-0 grid place-items-center">
          <img
            src={LOGO_SRC}
            alt="RIVO"
            className="h-40 md:h-48 lg:h-56 w-auto object-contain drop-shadow-[0_2px_8px_rgba(228,232,158,0.35)]"
            style={{
              transform: "translateZ(30px)",
              willChange: "transform",
            }}
          />
        </div>
      </div>

      {/* Sombra suave debajo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -bottom-8 h-24 rounded-[40px] blur-2xl"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(0,0,0,0.55), transparent 70%)",
          opacity: 0.8,
        }}
      />

      {/* Keyframes locales */}
      <style>{`
        @keyframes rivo-spin { 
          from { transform: rotate(0deg) } 
          to   { transform: rotate(360deg) } 
        }
        @media (prefers-reduced-motion: reduce) {
          [data-rivo-anim] { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}



/* =========================
   App principal (completo)
   ========================= */
export default function App() {
  const year = new Date().getFullYear();
  const WHATSAPP = "https://wa.me/5491164423999";
  const heroRef = useRef(null); useParallaxHero(heroRef);
  const [menuOpen, setMenuOpen] = useState(false);

  // SEO
  const SITE_URL = "https://rivowebs.com";
  const OG_IMAGE = "/og-image.jpg";
  const LOGO_ABS = `${SITE_URL}/logo.png`;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Rivo",
    url: SITE_URL,
    logo: LOGO_ABS,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "rivowebs@gmail.com",
        telephone: "+54-9-11-6442-3999",
        areaServed: "AR",
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RIVO – Hacemos webs que venden",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const faqSeo = [
    {
      q: "¿Trabajan con plantillas?",
      a: "No usamos plantillas. Todo es código a medida con arquitectura, UI y micro-interacciones pensadas para tu negocio.",
    },
    {
      q: "¿Incluyen copy y estructura?",
      a: "Sí, ayudamos con copy y estructura: mapa del sitio, UX writing, CTAs y jerarquía orientada a conversión.",
    },
    {
      q: "¿Cómo optimizan SEO?",
      a: "SEO técnico: meta tags, OpenGraph/Twitter, sitemap y robots, schema JSON-LD y performance real.",
    },
    { q: "¿Qué tan rápido entregan?", a: "Una landing en 7 días; otros proyectos dependen del alcance, con hitos claros e iteraciones cortas." },
    { q: "¿Qué integraciones hacen?", a: "Integraciones a medida: pagos, CRM, chats, redes y automatizaciones simples." },
    { q: "¿Hay garantía?", a: "Sí, 7 días de ajustes post-entrega con correcciones menores y soporte de puesta en marcha." },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSeo.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // Bloquea scroll cuando el menú está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [menuOpen]);

  // Activar scroll suave global para anchors
  useSmoothAnchors();

  const plans = [
    {
      name: "Landing Page Avanzada",
      price: "USD 299",
      highlight: "5 secciones · entrega en 7 días",
      items: [
        "Diseño responsive",
        "Integración con redes sociales",
        "Formulario de contacto",
        "Optimización SEO base",
        "Diseño y personalizado",
        "Certificado SSL Gratuito",
        "Landing Page Profesional",
      ],
      cta: "Quiero mi landing",
    },
    {
      name: "Catálogo Online",
      price: "USD 599",
      highlight: "Catálogo filtrable + panel simple",
      items: [
        "Diseño responsive",
        "Integración con redes sociales",
        "Formulario de contacto",
        "Optimización SEO base",
        "Diseño y personalizado",
        "Certificado SSL Gratuito",
        "Landing Page Profesional",
        "Hasta 50 productos/servicios",
        "Búsqueda y filtros",
        "SEO técnico + schema",
      ],
      cta: "Armar mi catálogo",
    },
    {
      name: "A medida",
      price: "Consulta",
      highlight: "E-commerce / MVPs / WebApp",
      items: ["Pagos (MercadoPago/Stripe)", "CMS / Autogestión", "Automatizaciones y APIs", "Soporte y métricas", "Escalabilidad y seguridad"],
      cta: "Hablemos",
    },
  ];

  return (
    <div className="min-h-screen w-full scroll-smooth bg-[color:var(--rivo-bg)] text-white antialiased">
      <style>{`:root{--rivo-bg:${COLORS.night};--rivo-glow:${COLORS.glow};--rivo-night:${COLORS.night};--wa:${COLORS.wa}}
html{color-scheme:dark}
section{scroll-margin-top:96px}
@keyframes titleShift{0%{background-position:0% 50%}100%{background-position:100% 50%}}
.animate-title{animation:titleShift 6s linear infinite;background-size:200% 100%}
.hero-parallax{transform:translate3d(var(--px,0px),var(--py,0px),0)}
@keyframes sheetIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes linkStagger{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
/* ===== Animaciones suaves ===== */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
/* Acordeón fluido para FAQ */
.accordion{display:grid;grid-template-rows:0fr;transition:grid-template-rows 280ms ease,opacity 280ms ease;opacity:0}
details[open] .accordion{grid-template-rows:1fr;opacity:1}
.accordion>.inner{min-height:0}
/* Micro-feedback al click */
.interact:active{transform:translateY(1px) scale(0.99)}
/* Respeto a reduce-motion */
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important}
}
  html, body { overflow-x: hidden; }
#root { overflow-x: hidden; }

`}</style>

      <Helmet>
  {/* Idioma */}
  <html lang="es" />

  {/* Title y descripción */}
  <title>RivoWebs</title>
  <meta
    name="description"
    content="RivoWebs diseña y desarrolla webs minimalistas que venden: copy claro, velocidad y SEO técnico. Todo con código a medida."
  />
  <meta
    name="keywords"
    content="RivoWebs, diseño web, landing page, desarrollo a medida, seo técnico, sitios que venden, páginas web"
  />
  <meta name="author" content="RivoWebs" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  {/* Favicons */}
  <link rel="apple-touch-icon" sizes="180x180" href="/logo-completo.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/logo-completo.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/logo-completo.png" />
  <link rel="shortcut icon" href="/logo-completo.png" type="image/png" />
  {/* Safari pinned tab (lo ideal es .svg, pero usamos PNG como pediste) */}
  <link rel="mask-icon" href="/logo-completo.png" color="#0b0f2b" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="msapplication-TileColor" content="#0b0f2b" />
  <meta name="theme-color" content="#0b0f2b" />

  {/* Canonical + hreflang */}
  <link rel="canonical" href={`${SITE_URL}/`} />
  <link rel="alternate" href={`${SITE_URL}/`} hrefLang="es" />
  <link rel="alternate" href={`${SITE_URL}/`} hrefLang="x-default" />

  {/* Open Graph */}
  <meta property="og:site_name" content="RivoWebs" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="RivoWebs – Hacemos webs que venden" />
  <meta
    property="og:description"
    content="Webs minimalistas que convierten: copy claro, velocidad y SEO técnico. Código a medida."
  />
  <meta property="og:url" content={`${SITE_URL}/`} />
  <meta property="og:image" content={`${SITE_URL}/logo-completo.png`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="es_AR" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="RivoWebs – Hacemos webs que venden" />
  <meta
    name="twitter:description"
    content="Webs minimalistas que convierten: copy claro, velocidad y SEO técnico. Código a medida."
  />
  <meta name="twitter:image" content={`${SITE_URL}/logo-completo.png`} />

  {/* JSON-LD */}
  <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
  <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
  <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
</Helmet>


      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--rivo-bg)]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#top" className="interact flex items-center gap-3" aria-label="Ir al inicio">
            <RivoLogo className="h-18 md:h-20 w-auto" />
          </a>
          <nav className="hidden items-center gap-6 md:flex" aria-label="principal">
            {[
              ["#servicios", "Servicios"],
              ["#proceso", "Proceso"],
              ["#proyectos", "Proyectos"],
              ["#diferenciales", "¿Por qué RIVO?"],
              ["#precios", "Planes"],
              ["#faq", "FAQ"],
              ["#contacto", "Contacto"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="interact text-sm text-white/80 transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <button
            className="interact md:hidden rounded-xl border border-white/10 bg-white/10 p-2 active:translate-y-[1px]"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* SHEET MOBILE */}
      {menuOpen && (
        <div className="md:hidden">
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] grid grid-rows-[auto_1fr_auto]
                       bg-[color:var(--rivo-bg)]/95 backdrop-blur-xl
                       animate-[sheetIn_250ms_ease] [animation:fadeIn_250ms_ease]"
          >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <RivoLogo className="h-8 w-auto" />
                <span className="text-sm text-white/60">Menú</span>
              </div>
              <button
                aria-label="Cerrar menú"
                className="interact rounded-xl border border-white/10 bg-white/10 p-2 active:translate-y-[1px]"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mx-auto w-full max-w-6xl px-4 overflow-y-auto">
              <div className="grid gap-3">
                {[
                  ["#servicios", "Servicios"],
                  ["#proceso", "Proceso"],
                  ["#proyectos", "Proyectos"],
                  ["#diferenciales", "¿Por qué RIVO?"],
                  ["#precios", "Planes"],
                  ["#faq", "Preguntas frecuentes"],
                  ["#contacto", "Contacto"],
                ].map(([href, label], i) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="interact flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg text-white/90 shadow hover:bg-white/10 transition animate-[linkStagger_280ms_ease_forwards] opacity-0"
                    style={{ animationDelay: `${70 * i}ms` }}
                  >
                    <span>{label}</span>
                    <ArrowRight className="size-5" />
                  </a>
                ))}
              </div>
            </nav>

            <div className="mx-auto mt-4 w-full max-w-6xl px-4 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={WHATSAPP}
                  className="interact inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--rivo-glow)] px-4 py-3 text-sm font-medium text-[color:var(--rivo-night)]"
                >
                  <Phone className="size-4" /> WhatsApp
                </a>
                <a
                  href="mailto:rivowebs@gmail.com"
                  className="interact inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10"
                >
                  <Mail className="size-4" /> Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4">
        {/* HERO */}
        <section id="top" className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24" ref={heroRef}>
          <div>
            <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
              <span className="animate-title bg-[linear-gradient(90deg,#e4e89e,#fff,#e4e89e)] bg-clip-text text-transparent [background-size:200%_100%]">
                Hacemos Webs que venden.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-white/80">
              Lanzá tu web en días, no en meses. Diseño y desarrollo <b>100% a medida</b>, sin plantillas.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <CTA variant="primary">Quiero mi propuesta</CTA>
              <CTA variant="ghost" href="#proyectos">Ver trabajos</CTA>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/70 md:flex md:flex-wrap md:gap-4">
              <li className="flex items-center gap-2"><Rocket className="size-4" /> Online en días</li>
              <li className="flex items-center gap-2"><Code2 className="size-4" /> Código a medida</li>
              <li className="flex items-center gap-2"><ShieldCheck className="size-4" /> SEO técnico</li>
              <li className="flex items-center gap-2"><Sparkles className="size-4" /> Micro-interacciones</li>
            </ul>
          </div>

          {/* Orbe con logo grande */}
          <HeroOrb />
        </section>

        {/* MÉTRICAS */}
        <section id="metricas" className="py-10">
          <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 md:grid-cols-4">
            {[
              { to: 45, label: "Proyectos lanzados" },
              { to: 100, label: "Satisfacción de clientes", suffix: "%" },
              { to: 7, label: "Días para tu landing" },
              { to: 24, label: "Soporte en horas", suffix: "h" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <Counter to={m.to} suffix={m.suffix || ""} />
                <div className="mt-1 text-sm text-white/70">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICIOS */}
        <section id="servicios" className="py-20">
          <div className="mb-10 flex items-end justify-between">
            <Title>Qué hacemos</Title>
            <div className="text-sm text-white/60">Landings · MVPs · UI a medida</div>
          </div>
          <div className="grid gap-8 md:grid-cols-3 items-stretch">
            <Card className="group p-8 hover:-translate-y-[2px] transition-transform duration-200">
              <div className="mb-5 flex items-center gap-3 text-[color:var(--rivo-glow)]">
                <Globe className="size-6" />
                <span className="text-lg font-semibold uppercase tracking-wider">Sitios que convierten</span>
              </div>
              <p className="text-base text-white/80">Estructura, mensajes y llamados a la acción pensados para vender. Performance real y jerarquía clara.</p>
              <ul className="mt-6 grid gap-2 text-sm text-white/75">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Arquitectura de información</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Copy y CTAs efectivos</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Animaciones sutiles</li>
              </ul>
            </Card>

            <Card className="group p-8 hover:-translate-y-[2px] transition-transform duration-200">
              <div className="mb-5 flex items-center gap-3 text-[color:var(--rivo-glow)]">
                <Code2 className="size-6" />
                <span className="text-lg font-semibold uppercase tracking-wider">Integraciones reales</span>
              </div>
              <p className="text-base text-white/80">Formularios, pagos, chat, CRM, redes y más. Todo integrado con código a medida.</p>
              <ul className="mt-6 grid gap-2 text-sm text-white/75">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Pagos (MercadoPago/Stripe)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Chats y CRM</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Redes sociales</li>
              </ul>
            </Card>

            <Card className="group p-8 hover:-translate-y-[2px] transition-transform duration-200">
              <div className="mb-5 flex items-center gap-3 text-[color:var(--rivo-glow)]">
                <Sparkles className="size-6" />
                <span className="text-lg font-semibold uppercase tracking-wider">Experiencia sutil</span>
              </div>
              <p className="text-base text-white/80">Micro-interacciones que elevan la marca sin distraer. Sensación premium.</p>
              <ul className="mt-6 grid gap-2 text-sm text-white/75">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Hovers y transiciones</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Reveal on-scroll</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[color:var(--rivo-glow)]" /> Parallax sutil</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* PROCESO */}
        <section id="proceso" className="py-20">
          <Title>Proceso</Title>
          <ol className="relative mt-10 grid items-stretch gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              { t: "Descubrimiento", d: "Entendemos tu negocio y definimos objetivos medibles." },
              { t: "Arquitectura & copy", d: "Mapa del sitio y mensajes que venden." },
              { t: "UI a medida", d: "Diseño limpio, responsive y micro-interacciones." },
              { t: "Release & mejora", d: "Deploy, métricas y ajustes para crecer." },
            ].map((s, i) => (
              <li key={s.t} className="group">
                <Card className="flex h-full flex-col p-8 hover:-translate-y-[2px] transition-transform duration-200">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[color:var(--rivo-glow)]/20 text-sm font-semibold text-[color:var(--rivo-glow)]">{i + 1}</div>
                    <div className="text-xl font-medium text-white">{s.t}</div>
                  </div>
                  <p className="text-white/80">{s.d}</p>
                  <div className="mt-auto pt-5">
                    <div className="h-[2px] w-full bg-gradient-to-r from-[color:var(--rivo-glow)]/40 to-transparent" />
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* TESTIMONIOS */}
        <section id="testimonios" className="py-20">
          <Title>Testimonios</Title>
          <div className="mt-10 grid items-stretch gap-8 md:grid-cols-3">
            {[
              { n: "Guido Iano", r: 5, rol: "Fundador de Padi", org: "Padi", q: "Con Rivo lanzamos la landing de Padi en días. Claridad en el copy y una performance impecable. Nos ayudó a validar más rápido." },
              { n: "Eze G", r: 5, rol: "Fundador de Payfolio", org: "Payfolio", q: "El equipo entendió perfecto el MVP. El diseño transmite confianza y el flujo de prueba de producto quedó clarísimo." },
              { n: "Claudio C.", r: 5, rol: "Gerente", org: "Quilmeño SRL", q: "Nuestra web ahora se ve profesional y carga rapidísimo. Aumentaron los contactos desde el sitio en la primer semana." },
            ].map((c) => (
              <Card key={c.n} className="p-8 bg-white/8 border-white/15 hover:-translate-y-[2px] transition-transform duration-200">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[color:var(--rivo-glow)]/20 text-[color:var(--rivo-glow)] font-semibold">
                    {c.n.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-[color:var(--rivo-glow)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-5 ${i < c.r ? "" : "opacity-25"}`} />
                    ))}
                  </div>
                </div>
                <blockquote className="relative mt-5 text-lg leading-relaxed text-white/90">
                  <span className="absolute -left-2 -top-2 text-5xl/none text-white/10 select-none">“”</span>
                  “{c.q}”
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div>
                    <div className="font-semibold text-white/95">{c.n}</div>
                    <div className="text-sm text-white/70">{c.rol} · {c.org}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-[12px] text-green-400"><CheckCircle2 className="size-4" /> Usuario Verificado</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* PROYECTOS */}
        <section id="proyectos" className="py-20">
          <div className="mb-10 flex items-end justify-between">
            <Title>Algunos Proyectos que hicimos</Title>
            <div className="text-sm text-white/60">Selección reciente</div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 items-stretch">
            {[
              { title: "Multiscope", url: "https://multiscope.com.ar/", tag: "WordPress/Corp" },
              { title: "Payfolio", url: "https://payfolioapp.com/", tag: "SaaS/MVP" },
              { title: "Padi Clases", url: "https://padiclases.netlify.app/", tag: "Edu/Landing" },
              { title: "Quilmeño SRL", url: "https://xn--quilmeosrl-y9a.com/", tag: "Comercial" },
            ].map((p) => (
              <a key={p.url} href={p.url} target="_blank" rel="noreferrer noopener" className="group interact">
                <Card className="p-7 hover:-translate-y-[3px] transition-transform duration-200">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[color:var(--rivo-glow)]">
                    <Sparkles className="size-3" /> {p.tag}
                  </div>
                  <div className="mb-4 h-36 w-full overflow-hidden rounded-2xl border border-white/10">
                    <div className="h-full w-full" style={{ background: "radial-gradient(120% 120% at 80% 0%, hsl(50 70% 60%) 0%, transparent 50%), linear-gradient(135deg, hsl(220 70% 30%), transparent)" }} />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-balance text-2xl font-semibold text-white/95">{p.title}</h3>
                      <p className="truncate text-xs text-white/60">{p.url.replace(/^https?:\/\//, "")}</p>
                    </div>
                    <div className="shrink-0 rounded-lg border border-white/10 p-2 text-white/70 transition group-hover:translate-y-[-1px]">↗</div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* DIFERENCIALES */}
        <section id="diferenciales" className="py-20">
          <Title>¿Por qué RIVO?</Title>
          <div className="mt-10 grid gap-8 md:grid-cols-3 items-stretch">
            {[
              { icon: <ShieldCheck className="size-6" />, t: "Código a medida", d: "Nada de plantillas: cada detalle pensado para tu negocio." },
              { icon: <Zap className="size-6" />, t: "Rápido y estable", d: "Arquitectura ligera y métricas verdes." },
              { icon: <Search className="size-6" />, t: "SEO que posiciona", d: "Semántica, schema y contenido que se encuentra." },
            ].map((f) => (
              <Card key={f.t} className="p-8 transition-transform duration-200 hover:-translate-y-[2px]">
                <div className="mb-3 flex items-center gap-3 text-[color:var(--rivo-glow)]">
                  {f.icon}<span className="text-lg font-medium uppercase tracking-wider">{f.t}</span>
                </div>
                <p className="text-base text-white/80">{f.d}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* PLANES */}
        <section id="precios" className="py-20">
          <Title>Nuestros Planes</Title>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 items-stretch">
            {plans.map((p) => (
              <AnimatedBorder key={p.name} className="rounded-3xl h-full">
                <div className="flex h-[760px] flex-col items-center rounded-3xl p-10 text-center">
                  <div className="flex h-10 items-center">
                    <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--rivo-glow)]">{p.name}</div>
                  </div>
                  <div className="mt-4 flex h-24 items-center justify-center">
                    <PriceText value={p.price} />
                  </div>
                  <div className="mt-6 text-sm text-white/70">{p.highlight}</div>
                  <ul className="mt-6 grid flex-1 w-full grid-cols-1 gap-2 text-[15px] text-white/85 text-left overflow-auto pr-1">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-[color:var(--rivo-glow)]" />
                        <span className="leading-tight">{it}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#contacto" className="interact mt-8 inline-flex items-center justify-center rounded-2xl bg-[color:var(--rivo-glow)] px-7 py-3.5 text-sm font-semibold text-[color:var(--rivo-night)] shadow-[0_6px_20px_rgba(228,232,158,0.35)] transition hover:translate-y-[-2px]">{p.cta}</a>
                </div>
              </AnimatedBorder>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <Title>Preguntas frecuentes</Title>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                q: "¿Trabajan con plantillas?",
                a: (
                  <>
                    <p>NO. Todo lo construimos <b>con código a medida</b>. Nada de temas genéricos.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
                      <li>Arquitectura, UI y micro-interacciones pensadas para tu negocio.</li>
                      <li>Entrega versionada y limpia.</li>
                    </ul>
                  </>
                ),
              },
              {
                q: "¿Incluyen copy y estructura?",
                a: (
                  <>
                    <p>Sí. Te guiamos en el mensaje y la jerarquía para <b>convertir</b>.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
                      <li>Mapa del sitio y UX writing.</li>
                      <li>CTAs y secciones clave.</li>
                    </ul>
                  </>
                ),
              },
              {
                q: "¿Cómo optimizan SEO?",
                a: (
                  <>
                    <p>Base técnica sólida y semántica correcta.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
                      <li>Meta tags, OG/Twitter.</li>
                      <li>Sitemap, robots y schema JSON-LD.</li>
                      <li>Performance real (carga rápida).</li>
                    </ul>
                  </>
                ),
              },
              {
                q: "¿Qué tan rápido entregan?",
                a: (
                  <>
                    <p><b>Landing en 7 días</b>. El resto depende del alcance.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
                      <li>Plan de hitos y avances visibles.</li>
                      <li>Iteraciones cortas.</li>
                    </ul>
                  </>
                ),
              },
              {
                q: "¿Qué integraciones hacen?",
                a: (
                  <>
                    <p>Las que tu negocio necesite.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
                      <li>Pagos, CRM, chats, redes.</li>
                      <li>Automatizaciones simples.</li>
                    </ul>
                  </>
                ),
              },
              {
                q: "¿Hay garantía?",
                a: (
                  <>
                    <p>Tenés <b>7 días</b> de ajuste post-entrega.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
                      <li>Correcciones menores incluidas.</li>
                      <li>Soporte para puesta en marcha.</li>
                    </ul>
                  </>
                ),
              },
            ].map((f, idx) => (
              <details
                key={f.q}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-0 open:border-[color:var(--rivo-glow)]/50 open:shadow-[0_0_0_1px_rgba(228,232,158,0.35),0_12px_40px_rgba(0,0,0,0.35)] transition"
              >
                <summary className="interact flex cursor-pointer select-none items-center justify-between gap-4 rounded-2xl px-6 py-5 text-lg text-white/90 hover:bg-white/10">
                  <span className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[color:var(--rivo-glow)]/20 text-sm font-semibold text-[color:var(--rivo-glow)]">{idx + 1}</span>
                    {f.q}
                  </span>
                  <ChevronDown className="size-5 transition group-open:rotate-180" />
                </summary>

                {/* Acordeón fluido */}
                <div className="mx-6 mb-6 mt-0 rounded-2xl border border-white/10 bg-white/5 p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="accordion">
                    <div className="inner p-5 text-sm text-white/80">
                      {f.a}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="py-24">
          <Card className="p-10 text-center">
            <h3 className="text-3xl font-semibold md:text-4xl">¿Hacemos tu <GradientWord>sitio</GradientWord>?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-white/70">Contame tu idea y te envío una propuesta con tiempos, alcance y precio.</p>
            <div className="mx-auto mt-8 grid max-w-xl gap-4 md:grid-cols-2">
              <a href={WHATSAPP} className="interact inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--rivo-glow)] px-5 py-3.5 font-medium text-[color:var(--rivo-night)] shadow-[0_6px_20px_rgba(228,232,158,0.35)] transition hover:translate-y-[-1px]">
                <Phone className="size-4" /> WhatsApp
              </a>
              <a href="mailto:rivowebs@gmail.com" className="interact inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-5 py-3.5 font-medium text-white hover:bg-white/10 hover:translate-y-[-1px]">
                <Mail className="size-4" /> Email
              </a>
            </div>
          </Card>
        </section>

        {/* Botón flotante WhatsApp */}
        <a
          href={WHATSAPP}
          aria-label="WhatsApp"
          className="interact fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--wa)] text-[color:var(--rivo-night)] shadow-lg transition hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--wa)]"
        >
          <Phone className="size-5" />
        </a>

        <BackToTop />
      </main>

      {/* FOOTER COMPLETO */}
      <footer className="border-t border-white/10 bg-[color:var(--rivo-bg)]/90">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="flex items-center">
  <RivoLogo className="h-22 md:h-24 w-auto -ml-4" />
  <span className="sr-only">Rivo</span>
</div>

              <p className="mt-3 text-sm text-white/70">Hacemos webs que venden. Diseño y desarrollo <b>a medida</b>, sin plantillas.</p>
              <div className="mt-4 flex gap-2 text-xs text-white/70">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Código a medida</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">SEO técnico</span>
              </div>
            </div>
            <div className="md:col-span-3">
              <div className="text-sm font-semibold text-white/90">Enlaces rápidos</div>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li><a href="#servicios" className="interact hover:text-white">Servicios</a></li>
                <li><a href="#proceso" className="interact hover:text-white">Proceso</a></li>
                <li><a href="#proyectos" className="interact hover:text-white">Proyectos</a></li>
                <li><a href="#faq" className="interact hover:text-white">Preguntas frecuentes</a></li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <div className="text-sm font-semibold text-white/90">Soporte</div>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li><a href="#contacto" className="interact hover:text-white">Contacto</a></li>
                <li className="flex items-center gap-2"><Mail className="size-4" /> rivowebs@gmail.com</li>
                <li className="flex items-center gap-2"><Phone className="size-4" /> +54 9 11 6442 3999</li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-semibold text-white/90">Legal</div>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li><a href="#" className="interact hover:text-white">Política de privacidad</a></li>
                <li><a href="#" className="interact hover:text-white">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mt-4 flex flex-col items-start justify-between gap-3 text-xs text-white/60 md:flex-row">
            <div>© {year} Rivo. Todos los derechos reservados.</div>
            <div className="flex items-center gap-4">
              <span>Español</span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-400" /> Todos los sistemas operativos
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
