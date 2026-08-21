import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import cv from "../content/cv.json";

const LINKS = [
  ...cv.sections.map((s) => ({ id: s.id, label: s.title })),
  { id: "prosjekter", label: "Prosjekter" },
];

function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Private browsing can reject writes; the toggle still works this session.
    }
  }, [theme]);

  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

/** Highlights the section currently in view. */
function useActiveSection() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const targets = LINKS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // A band near the top of the viewport: the active item is what the
      // reader is looking at, not merely what happens to be on screen.
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Nav() {
  const [theme, toggleTheme] = useTheme();
  const [stuck, setStuck] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="#cv"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2 focus:text-sm focus:text-on-accent"
      >
        Hopp til innhold
      </a>

      <nav
        aria-label="Seksjoner"
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          stuck
            ? "border-b border-line bg-ground/85 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3 sm:px-8">
          <span
            aria-hidden="true"
            className={`hidden flex-none font-display text-base font-semibold tracking-tight transition-opacity duration-300 sm:block ${
              stuck ? "opacity-100" : "opacity-0"
            }`}
          >
            {cv.name.split(" ")[0]}
          </span>

          {/* Scrolls horizontally on narrow screens rather than collapsing into
              a hamburger — five short items fit fine and stay one tap away. */}
          <ul className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={active === link.id ? "true" : undefined}
                  className={`inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors duration-200 ${
                    active === link.id
                      ? "bg-accent-wash font-medium text-accent"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>
    </>
  );
}
