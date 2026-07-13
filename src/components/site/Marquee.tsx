"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// Seamless, gap-free infinite marquee ("train"). It measures one copy of the
// content plus the container, then renders enough copies to always overflow, and
// shifts by exactly one copy's width so the last item sits flush against the
// first — no empty spots regardless of how few items there are. Hovering the
// track pauses it (see globals.css `.mq:hover .mq-track`).
export function Marquee({
  children,
  pxPerSecond = 40,
  reverse = false,
  fade = true,
  className = "",
}: {
  children: ReactNode;
  pxPerSecond?: number;
  reverse?: boolean;
  fade?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const unitRef = useRef<HTMLDivElement | null>(null);
  const [copies, setCopies] = useState(2);
  const [unitWidth, setUnitWidth] = useState(0);

  const measure = useCallback(() => {
    const unit = unitRef.current;
    const container = containerRef.current;
    if (!unit || !container) return;
    const w = unit.scrollWidth;
    if (!w) return;
    const containerW = container.clientWidth;
    // Enough copies that (copies-1) sets already fill the container → shifting by
    // one set width always keeps content on screen. +2 as a safety margin.
    const needed = Math.max(3, Math.ceil(containerW / w) + 2);
    setUnitWidth(w);
    setCopies(needed);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, children]);

  useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (containerRef.current) ro.observe(containerRef.current);
    if (unitRef.current) ro.observe(unitRef.current);

    // Re-measure once fonts / late media settle, so the copy count is never short.
    const onLoad = () => measure();
    window.addEventListener("load", onLoad);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }
    const t = window.setTimeout(measure, 500);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", onLoad);
      window.clearTimeout(t);
    };
  }, [measure]);

  const duration = unitWidth > 0 ? unitWidth / pxPerSecond : 30;

  return (
    <div ref={containerRef} className={`mq ${fade ? "mq-fade" : ""} ${className}`}>
      <div
        className="mq-track"
        style={
          {
            "--mq-w": `${unitWidth}px`,
            animationDuration: `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
            animationPlayState: unitWidth > 0 ? "running" : "paused",
          } as React.CSSProperties
        }
      >
        {Array.from({ length: copies }, (_, i) => (
          <div className="mq-group" key={i} ref={i === 0 ? unitRef : undefined} aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
