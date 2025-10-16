import React from "react";
import VisitorCounter from "./VisitorCounter";
import "./resume.css";
import 'flowbite';
import ModalUtdanning from "./components/modal-utdanning";
import ModalEgenskaper from "./components/modal-egenskaper";
import ModalErfaring from "./components/modal_erfaring";

export default function Resume() {
    return (
      <div className="bg-slate-400 min-h-screen p-6 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-1">
            
            {/* Top Row */}
          <div className="justify-self-end min-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-900">
            <img className="size-12 shrink-0" src="person-wave.svg" alt="ChitChat Logo" />
            <div>
              <div className="text-xl font-medium text-black dark:text-white">
                Utdanning
              </div>
              <p className="text-gray-500 dark:text-gray-400">info...</p>
              <ModalUtdanning />
            </div>
          </div>
          <div className="justify-self-start min-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-900">
            <img className="size-12 shrink-0" src="person-thinking.svg" alt="ChitChat Logo" />
            <div>
              <div className="text-xl font-medium text-black dark:text-white">
                Erfaring
              </div>
              <p className="text-gray-500 dark:text-gray-400">info...</p>
              <ModalErfaring />
            </div>
          </div>

            {/* Middle Row */}
          <div className="justify-self-end min-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-900">
            <img className="size-12 shrink-0" src="person-ability.svg" alt="ChitChat Logo" />
            <div>
              <div className="text-xl font-medium text-black dark:text-white">
                Egenskaper
              </div>
              <p className="text-gray-500 dark:text-gray-400">info...</p>
              <ModalEgenskaper />
            </div>
          </div>
          <div className="justify-self-start min-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-900">
            <img className="size-12 shrink-0" src="person-ability.svg" alt="ChitChat Logo" />
            <div>
              <div className="text-xl font-medium text-black dark:text-white">
                Egenskaper
              </div>
              <p className="text-gray-500 dark:text-gray-400">info...</p>
              <ModalEgenskaper />
            </div>
          </div>

            {/* Bottom Row */}
          <div className="justify-self-end min-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-900">
            <img className="size-12 shrink-0" src="person-ability.svg" alt="ChitChat Logo" />
            <div>
              <div className="text-xl font-medium text-black dark:text-white">
                Egenskaper
              </div>
              <p className="text-gray-500 dark:text-gray-400">info...</p>
              <ModalEgenskaper />
            </div>
          </div>
          <div className="justify-self-start min-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-900">
            <img className="size-12 shrink-0" src="person-ability.svg" alt="ChitChat Logo" />
            <div>
              <div className="text-xl font-medium text-black dark:text-white">
                Egenskaper
              </div>
              <p className="text-gray-500 dark:text-gray-400">info...</p>
              <ModalEgenskaper />
            </div>
          </div>
        </div>
      </div>
    );
  }
