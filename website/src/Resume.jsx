import React from "react";
import VisitorCounter from "./components/VisitorCounter";
import "./resume.css";
import 'flowbite';
import Modal from "./components/modal";

export default function Resume() {
    return (
      <div className="bg-slate-400 min-h-screen flex items-center justify-center">
        <div className="border-4 bg-slate-500 border-slate-500 p-6 rounded-lg w-full max-w-4xl h-screen">
        <h1 className="text-center text-5xl font-bold p-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent drop-shadow-lg">
            Petter Rønning-Nyvold
        </h1>


            <div className="grid grid-cols-2 gap-1">
                
                {/* Top Row */}
            <div className="justify-self-end w-sm p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 dark:from-gray-800 dark:to-gray-700 dark:border-gray-900">
                <img className="size-12 shrink-0 bg-blue-100 p-2 rounded-full mb-4" src="person-wave.svg" alt="ChitChat Logo" />
                <div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Utdanning
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">info...</p>

                    <Modal title="Utdanning" triggerText="Min utdanning">
                    <div className="space-y-6">
                        <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Master i programvareutvikling
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            Universitetet i Bergen og Høgskulen på Vestlandet<br />
                            <span className="italic text-gray-500 dark:text-gray-400">2024 – 2026</span>
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                            <li>Fokus på moderne programvareutvikling, maskinsyn og AI.</li>
                            <li>
                            Masterprosjekt: <strong>FishWatch</strong> – utviklet system for å detektere individuelle laks i merder og visualisere bevegelsesmønstre for å forbedre fiskehelse og fôring.
                            </li>
                        </ul>
                        </div>

                        <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Bachelor i Informatikk
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            Universitetet i Tromsø<br />
                            <span className="italic text-gray-500 dark:text-gray-400">2020 – 2024</span>
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                            <li>Grunnleggende programmering, algoritmer og systemutvikling.</li>
                            <li>Prosjekter i Kotlin, Java, Python og C.</li>
                        </ul>   
                        </div>
                    </div>
                    </Modal>
                </div>
                </div>

                <div className="justify-self-start w-sm p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 dark:from-purple-900 dark:to-purple-800 dark:border-purple-900">
                    <img className="size-12 shrink-0 bg-yellow-200 p-2 rounded-full mb-4 dark:bg-purple-200" src="person-thinking.svg" alt="ChitChat Logo" />
                    <div>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                        Egenskaper
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">info...</p>

                        <Modal title="Egenskaper" triggerText="Mine egenskaper">
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p>
                            Jeg trives godt i team og ser verdien av samarbeid for å finne gode løsninger.
                            </p>
                            <p>
                            Jeg setter meg raskt inn i ny teknologi og motiveres av kontinuerlig læring.
                            </p>
                            <p>
                            Jeg liker å bidra aktivt i diskusjoner og problemløsning, og setter pris på et arbeidsmiljø der man kan støtte og lære av hverandre – og ha det gøy på jobb.
                            </p>
                        </div>
                        </Modal>
                    </div>
                    </div>


                {/* Middle Row */}
                <div className="justify-self-end w-sm p-6 bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 dark:from-blue-800 dark:to-blue-700 dark:border-blue-900">
                    <img className="size-12 shrink-0 bg-teal-200 p-2 rounded-full mb-4 dark:bg-blue-200" src="person-ability.svg" alt="ChitChat Logo" />
                    <div>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                        Erfaring
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">info...</p>

                        <Modal title="Erfaring" triggerText="Min erfaring">
                        <div className="space-y-6">
                            <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Nordlaks – OT/IT
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                Sortland | <span className="italic text-gray-500 dark:text-gray-400">2025</span>
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                                <li>Innsyn i hvordan en av Norges største oppdrettsbedrifter drives teknologisk.</li>
                                <li>Erfaring med maskinsyn, kommunikasjon mellom operasjonssentral og røktere, samt IT- og OT-systemer.</li>
                            </ul>
                            </div>

                            <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Stokmarknes Sykehus – Sjåfør
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                <span className="italic text-gray-500 dark:text-gray-400">2019 – 2024</span>
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                                <li>Sommer- og feriejobb.</li>
                                <li>Ansvar for logistikk og pasienttransport under tidspress med høy grad av service.</li>
                            </ul>
                            </div>

                            <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Circle K Stokmarknes – Deltidsjobb
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                <span className="italic text-gray-500 dark:text-gray-400">2015 – 2018</span>
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                                <li>Kundebehandling, salg og drift i et hektisk miljø.</li>
                            </ul>
                            </div>
                        </div>
                        </Modal>
                    </div>
                    </div>

                    <div className="justify-self-start w-sm p-6 bg-gradient-to-br from-yellow-700 to-orange-700 border border-yellow-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img className="size-12 shrink-0 bg-yellow-100 p-2 rounded-full mb-4" src="person-thinking.svg" alt="ChitChat Logo" />
                    <div>
                        <div className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 drop-shadow-lg mb-2">
                        Om meg
                        </div>
                        <p className="text-gray-900 mb-4">info...</p>

                        <Modal title="Om meg" triggerText="litt om meg">
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p>
                            Jeg trives godt i team og ser verdien av samarbeid for å finne gode løsninger.
                            </p>
                            <p>
                            Jeg setter meg raskt inn i ny teknologi og motiveres av kontinuerlig læring.
                            </p>
                            <p>
                            Jeg liker å bidra aktivt i diskusjoner og problemløsning, og setter pris på et arbeidsmiljø der man kan støtte og lære av hverandre – og ha det gøy på jobb.
                            </p>
                        </div>
                        </Modal>
                    </div>
                    </div>



            </div>
        </div>
      </div>
    );
  }
