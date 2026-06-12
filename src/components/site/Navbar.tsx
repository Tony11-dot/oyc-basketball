"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SocialIcon } from "./SocialIcon";
import { cn } from "@/lib/cn";

type SectionId = "home" | "teams" | "highlights" | "gallery" | "register" | "contact";
const SECTIONS_DEFAULT = ["home", "teams", "highlights", "gallery", "register", "contact"];
const INSTAGRAM_URL = "https://instagram.com/oyc.nazareth";

export function Navbar({ sections = SECTIONS_DEFAULT }: { sections?: string[] }) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  // True while the navbar overlaps the dark full-bleed hero → use white text.
  // Once we scroll into the light sections below, switch to a solid light bar.
  const [overHero, setOverHero] = useState(true);
  const [active, setActive] = useState<SectionId>("home");
  const [menuOpen, setMenuOpen] = useState(false);

  // Nav tabs follow the admin's Sections order/visibility.
  const SECTIONS = sections as SectionId[];

  // Drive the scroll ourselves with a computed offset for reliable smooth scroll
  // (the native #anchor jump can be interrupted when the mobile menu collapses).
  const HEADER_OFFSET = 84; // matches scroll-padding-top in globals.css
  const goToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setMenuOpen(false);
    requestAnimationFrame(() => {
      const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
      history.replaceState(null, "", `#${id}`);
    });
  };

  const labels: Record<SectionId, string> = {
    home: t.nav.home,
    teams: t.nav.teams,
    highlights: t.nav.highlights,
    gallery: t.nav.gallery,
    register: t.nav.register,
    contact: t.nav.contact,
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // Over the hero while the bar still sits within it (minus its own height).
      const hero = document.getElementById("home");
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
      setOverHero(!!hero && y < heroBottom - HEADER_OFFSET);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Scroll spy: highlight the nav link for the section in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id as SectionId);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-1" : "py-2",
        // Solid light bar once past the hero; transparent (with a faint top
        // scrim for legibility) while overlapping the dark hero.
        overHero
          ? "bg-gradient-to-b from-black/25 to-transparent"
          : "bg-white/90 shadow-soft backdrop-blur-xl",
      )}
    >
      <nav className="container-x flex items-center justify-between gap-2">
        <a href="#home" aria-label="OYC Nazareth home" className="group relative transition hover:opacity-90">
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(18,48,110,0.18),transparent_70%)] blur-md"
          />
          <Logo className={cn("transition-all duration-300", scrolled ? "h-11" : "h-14")} />
        </a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition",
                  overHero
                    ? active === id
                      ? "text-white"
                      : "text-white/75 hover:text-white"
                    : active === id
                      ? "text-brand-dark"
                      : "text-ink/70 hover:text-brand-dark",
                )}
              >
                {labels[id]}
                {active === id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="-me-1 flex shrink-0 items-center gap-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            title="Instagram"
            className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-[0_8px_24px_rgba(214,41,118,0.3)] transition hover:-translate-y-0.5"
          >
            <SocialIcon label="Instagram" />
          </a>
          <div className="hidden md:block">
            <LanguageSwitcher light={overHero} />
          </div>
          <a
            href="#register"
            className="hidden rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(18,48,110,0.28)] transition hover:-translate-y-0.5 hover:bg-brand-dark sm:inline-flex"
          >
            {t.nav.register}
          </a>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className={cn(
              "grid size-10 place-items-center rounded-lg transition md:hidden",
              overHero ? "text-white hover:bg-white/10" : "text-ink hover:bg-brand-50",
            )}
          >
            <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 overflow-hidden border-t border-line bg-white md:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-3">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => goToSection(e, id)}
                    className={cn(
                      "block touch-manipulation rounded-lg px-3 py-3 text-sm font-semibold transition [-webkit-tap-highlight-color:transparent]",
                      active === id ? "bg-brand-50 text-brand-dark" : "text-ink/80 hover:bg-surface",
                    )}
                  >
                    {labels[id]}
                  </a>
                </li>
              ))}
              <li className="px-3 py-2">
                <LanguageSwitcher />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* admin shortcut kept discreet */}
      <Link href="/admin" className="sr-only">
        Admin
      </Link>
    </header>
  );
}
