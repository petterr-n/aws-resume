import React, { useState, useEffect } from "react";
import Resume from "./Resume"; // your grid component
import { initFlowbite } from "flowbite";

export default function App() {
  const [showResume, setShowResume] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    initFlowbite();
  });

  // Need to reinitialize flowbite because its not React-aware.
  useEffect(() => {
    if (showResume) {
      setTimeout(() => {
        setVisible(true);
        initFlowbite();
    }, 50);
    }
  }, [showResume]);

  return (
    <div>
      {!showResume && (
        <section className="bg-center bg-no-repeat bg-gray-700 bg-blend-multiply h-screen">
          <div className="px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
              Petter Rønning-Nyvold 
            </h1>
            <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">
              Les litt om meg, min utdanning, min erfaring og noen av mine prosjekter.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
              <button
                onClick={() => setShowResume(true)}
                className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
              >
                Se CV
              </button>

              
            </div>
          </div>
        </section>
      )}

        {showResume && (
        <div
            className={`transition-opacity duration-700 ease-in-out ${
            visible ? "opacity-100" : "opacity-0"
            } bg-slate-400 min-h-screen`}
        >
            <Resume />
        </div>
        )}

    </div>
  );
}
