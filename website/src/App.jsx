import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Projects from "./components/Projects";
import Section from "./components/Section";
import VisitorCounter from "./components/VisitorCounter";
import cv from "./content/cv.json";

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />

      {/* One page rather than two screens. The previous version hid everything
          behind a "Se CV" button, which meant nothing was linkable, nothing
          was indexable, and the first screen carried no information. */}
      <main id="cv" className="mx-auto max-w-5xl space-y-14 px-5 pb-20 sm:px-8">
        <section className="space-y-4">
          {cv.sections.map((section, i) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <Section section={section} defaultOpen={i === 0} />
            </div>
          ))}
        </section>

        <Projects projects={cv.projects} />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
          <p className="font-mono text-xs text-muted">
            Serverless på AWS · Lambda · DynamoDB · CloudFront
          </p>
          <VisitorCounter />
        </div>
      </footer>
    </div>
  );
}
