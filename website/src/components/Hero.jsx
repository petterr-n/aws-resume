import { ArrowDown, Github, MapPin } from "lucide-react";
import AskBox from "./AskBox";
import cv from "../content/cv.json";

const ICONS = { github: Github };

export default function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* Ambient wash: a cool, low-contrast gradient standing in for northern
          summer light. Deliberately subtle — the type carries the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_15%_0%,var(--color-accent-wash)_0%,transparent_55%)]"
      />

      <div className="mx-auto grid max-w-5xl gap-10 px-5 pt-14 pb-10 sm:px-8 sm:pt-20 sm:pb-12 md:grid-cols-[1.35fr_1fr] md:items-center md:gap-14">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted">
            <MapPin size={13} strokeWidth={2} aria-hidden="true" />
            {cv.location}
          </p>

          <h1 className="mt-4 font-display text-[2.05rem] font-semibold leading-[1.04] tracking-tight text-ink xs:text-[2.5rem] sm:text-6xl">
            {cv.name.replace(/-/g, "\u2011")}
          </h1>

          <p className="mt-3 font-mono text-sm text-accent sm:text-[0.95rem]">
            {cv.role}
          </p>

          <p className="mt-6 max-w-[52ch] text-[1.02rem] leading-relaxed text-ink-soft">
            {cv.intro}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#cv"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors duration-200 hover:bg-accent-hover"
            >
              Se CV
              <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
            </a>

            {cv.links.map((link) => {
              const Icon = ICONS[link.icon];
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:border-accent hover:text-accent"
                >
                  {Icon && <Icon size={16} strokeWidth={1.9} aria-hidden="true" />}
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="order-first md:order-none md:justify-self-end">
          <div className="relative w-40 sm:w-48 md:w-full md:max-w-[17rem]">
            {/* Offset frame instead of a drop shadow — flatter, and it gives
                the portrait a deliberate edge on a light ground. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-card border border-accent/35"
            />
            <img
              src={cv.photo}
              alt={cv.name}
              width="272"
              height="272"
              className="relative aspect-square w-full rounded-card border border-line object-cover"
            />
          </div>
        </div>
      </div>

      {/* Three facts, scannable in a couple of seconds without opening anything. */}
      <div className="mx-auto max-w-5xl px-5 pb-10 sm:px-8 sm:pb-12">
        <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
          {cv.facts.map((fact) => (
            <div key={fact.label} className="bg-surface px-5 py-4">
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.13em] text-muted">
                {fact.label}
              </dt>
              <dd className="mt-1 text-[0.95rem] font-medium text-ink">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-12 sm:px-8 sm:pb-16">
        <AskBox />
      </div>
    </header>
  );
}
