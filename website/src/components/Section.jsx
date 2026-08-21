import { useId, useRef, useState } from "react";
import { ChevronDown, GraduationCap, Sparkles, Briefcase, User } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const ICONS = {
  graduation: GraduationCap,
  spark: Sparkles,
  briefcase: Briefcase,
  user: User,
};

function Entry({ entry }) {
  return (
    <div className="relative pl-5 sm:pl-6">
      {/* A timeline rule rather than a card: entries are a sequence in time,
          and the line says so without needing a box around each one. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 h-2 w-2 rounded-full bg-accent"
      />
      <span
        aria-hidden="true"
        className="absolute left-[3px] top-5 bottom-0 w-px bg-line"
      />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h4 className="font-display text-lg font-semibold text-ink">
          {entry.heading}
        </h4>
        {entry.period && (
          <span className="font-mono text-xs text-muted tabular-nums">
            {entry.period}
          </span>
        )}
      </div>
      {entry.org && <p className="mt-0.5 text-sm text-ink-soft">{entry.org}</p>}
      {entry.bullets?.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {entry.bullets.map((bullet) => (
            // flex rather than a ::before marker, so wrapped lines hang
            // under the text instead of sliding back under the dash.
            <li key={bullet} className="flex gap-2.5">
              <span aria-hidden="true" className="flex-none text-line-strong">
                —
              </span>
              <span className="text-[0.95rem] leading-relaxed text-ink-soft">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Section({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const contentRef = useRef(null);
  const [ref, revealClass] = useReveal();
  const Icon = ICONS[section.icon] ?? Sparkles;

  return (
    <div ref={ref} className={revealClass}>
      <div
        className="overflow-hidden rounded-card border border-line bg-surface transition-colors duration-200 hover:border-line-strong"
      >
        {/* A real <button>: focusable, space/enter activated, and announcing
            its expanded state. The previous version was a div with onClick,
            which keyboard and screen-reader users could not operate at all. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent-wash text-accent">
            <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="flex-1 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {section.title}
          </h3>
          <ChevronDown
            size={20}
            aria-hidden="true"
            className={`flex-none text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Animating grid-template-rows to 1fr handles content of unknown
            height, which a max-height guess cannot do without either clipping
            long sections or making short ones lag. */}
        <div
          id={panelId}
          role="region"
          aria-label={section.title}
          hidden={!open}
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div
              ref={contentRef}
              className="space-y-6 px-5 pb-6 sm:px-6 sm:pb-7"
            >
              {section.paragraphs
                ? section.paragraphs.map((text) => (
                    <p
                      key={text}
                      className="max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-soft"
                    >
                      {text}
                    </p>
                  ))
                : section.entries.map((entry) => (
                    <Entry key={entry.heading} entry={entry} />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
