import React from "react";
import VisitorCounter from "./components/VisitorCounter";
import ExpandableCard from "./components/card";
import ProjectSection from "./components/projects";
import cv from "./content/cv.json";
import "./resume.css";

function Entry({ entry }) {
  return (
    <div>
      <h4 className="font-semibold text-white mb-1">{entry.heading}</h4>
      {(entry.org || entry.period) && (
        <p className="text-gray-200 mb-2">
          {entry.org}
          {entry.org && entry.period && <br />}
          {entry.period && (
            <span className="italic text-gray-400">{entry.period}</span>
          )}
        </p>
      )}
      {entry.bullets?.length > 0 && (
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          {entry.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionBody({ section }) {
  if (section.paragraphs) {
    return (
      <>
        {section.paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </>
    );
  }

  return (
    <>
      {section.entries.map((entry) => (
        <Entry key={entry.heading} entry={entry} />
      ))}
    </>
  );
}

export default function Resume() {
  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center p-2 sm:p-4">
      <div className="border-4 bg-slate-500 border-slate-500 p-6 rounded-lg w-full max-w-4xl h-full">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 text-center">
          <img
            src={cv.photo}
            alt={cv.name}
            width="160"
            height="160"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-600 shadow-lg"
          />

          <div className="border-4 border-slate-600 bg-slate-700 rounded-xl px-6 py-4 shadow-xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center drop-shadow-md">
              {cv.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:gap-4 w-full mt-4">
          {cv.sections.map((section) => (
            <ExpandableCard
              key={section.id}
              title={section.title}
              icon={section.icon}
              gradient={section.gradient}
            >
              <SectionBody section={section} />
            </ExpandableCard>
          ))}
        </div>

        <div className="flex justify-center my-10">
          <div className="w-full h-1 bg-gray-900 rounded-full"></div>
        </div>

        <ProjectSection projects={cv.projects} />

        <footer className="mt-10 pt-6 border-t border-slate-600 flex justify-center">
          <VisitorCounter />
        </footer>
      </div>
    </div>
  );
}
