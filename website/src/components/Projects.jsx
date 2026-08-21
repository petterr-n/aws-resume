import { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import ResultsPanel from "./ResultsPanel";

function Details({ project, onClose }) {
  // Escape and backdrop-click both close. The previous modal had neither, so
  // the close button was the only way out.
  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onKeyDown={onKeyDown}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold text-ink">
            {project.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            autoFocus
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-muted hover:bg-raised hover:text-ink"
          >
            <X size={17} />
          </button>
        </div>
        {project.subtitle && (
          <p className="mt-1 font-mono text-xs text-muted">{project.subtitle}</p>
        )}

        <div className="mt-4 space-y-3">
          {project.details.map((paragraph) => (
            <p key={paragraph} className="text-[0.95rem] leading-relaxed text-ink-soft">
              {paragraph}
            </p>
          ))}
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors duration-200 hover:bg-accent-hover"
          >
            {project.linkLabel ?? "Les mer"}
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors duration-200 hover:border-accent">
      <div className="flex h-32 items-center justify-center bg-raised">
        <img
          src={project.image}
          alt=""
          className="h-14 w-14 opacity-80 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold text-ink">
          {project.title}
        </h3>
        {project.subtitle && (
          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted">
            {project.subtitle}
          </p>
        )}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
          {project.description}
        </p>

        {project.details ? (
          <>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-4 inline-flex items-center gap-1 self-start text-sm font-medium text-accent hover:text-accent-hover"
            >
              Mer info
              <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
            </button>
            {open && <Details project={project} onClose={() => setOpen(false)} />}
          </>
        ) : (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 self-start text-sm font-medium text-accent hover:text-accent-hover"
          >
            Se prosjekt
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

export default function Projects({ projects }) {
  const [ref, revealClass] = useReveal();

  return (
    <section id="prosjekter" ref={ref} className={`scroll-mt-24 ${revealClass}`}>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Prosjekter
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        <ResultsPanel />
      </div>
    </section>
  );
}
