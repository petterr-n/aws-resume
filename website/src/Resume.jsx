import React from "react";
import VisitorCounter from "./components/VisitorCounter";
import "./resume.css";
import 'flowbite';
import Modal from "./components/modal";
import ProjectSection from "./components/projects";
import ExpandableCard from "./components/card";

export default function Resume() {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center p-2 sm:p-4">
        <div className="border-4 bg-slate-500 border-slate-500 p-6 rounded-lg w-full max-w-4xl h-full">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 text-center">
                {/* Image */}
                <img
                    src="profile.jpg"
                    alt="Petter Rønning-Nyvold"
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-600 shadow-lg"
                />

                {/* Name Box */}
                <div className="border-4 border-slate-600 bg-slate-700 rounded-xl px-6 py-4 shadow-xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center drop-shadow-md">
                    Petter Rønning-Nyvold
                    </h1>
                </div>
            </div>


            <div className="flex flex-col items-center gap-3 sm:gap-4 w-full mt-4">
                
                {/* Top Row */}
                {/* --- UTDANNING --- */}
                <ExpandableCard
                    title="Utdanning"
                    icon="student.svg"
                    gradient="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-900"
                >
                    <div>
                    <h4 className="font-semibold text-white mb-1">Master i programvareutvikling</h4>
                    <p className="text-gray-200 mb-2">
                        Universitetet i Bergen og Høgskulen på Vestlandet<br />
                        <span className="italic text-gray-400">2024 – 2026</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                        <li>Fokus på moderne programvareutvikling, maskinsyn og AI.</li>
                        <li>
                        Masterprosjekt: <strong>FishWatch</strong> – utviklet system for å detektere individuelle laks i merder og visualisere bevegelsesmønstre.
                        </li>
                    </ul>
                    </div>

                    <div>
                    <h4 className="font-semibold text-white mb-1">Bachelor i Informatikk</h4>
                    <p className="text-gray-200 mb-2">
                        Universitetet i Tromsø<br />
                        <span className="italic text-gray-400">2020 – 2024</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                        <li>Grunnleggende programmering, algoritmer og systemutvikling.</li>
                        <li>Prosjekter i Kotlin, Java, Python og C.</li>
                    </ul>
                    </div>
                </ExpandableCard>

                {/* --- EGENSKAPER --- */}
                <ExpandableCard
                    title="Egenskaper"
                    icon="person-thinking.svg"
                    gradient="bg-gradient-to-br from-purple-900 to-purple-700 border-purple-900"
                >
                    <p>
                    Jeg trives godt i team og ser verdien av samarbeid for å finne gode løsninger.
                    </p>
                    <p>
                    Jeg setter meg raskt inn i ny teknologi og motiveres av kontinuerlig læring.
                    </p>
                    <p>
                    Jeg liker å bidra aktivt i diskusjoner og problemløsning, og setter pris på et arbeidsmiljø der man kan støtte og lære av hverandre – og ha det gøy på jobb.
                    </p>
                </ExpandableCard>

                {/* --- ERFARING --- */}
                <ExpandableCard
                    title="Erfaring"
                    icon="person-ability.svg"
                    gradient="bg-gradient-to-br from-blue-800 to-blue-700 border-blue-900"
                >
                    <div>
                    <h4 className="font-semibold text-white mb-1">Nordlaks – OT/IT</h4>
                    <p className="text-gray-200 mb-2">
                        Stokmarknes | <span className="italic text-gray-400">2025</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                        <li>Innsyn i hvordan en av Norges største oppdrettsbedrifter drives teknologisk.</li>
                        <li>Erfaring med maskinsyn, kommunikasjon mellom operasjonssentral og røktere, samt IT- og OT-systemer.</li>
                    </ul>
                    </div>

                    <div>
                    <h4 className="font-semibold text-white mb-1">Stokmarknes Sykehus – Sjåfør</h4>
                    <p className="text-gray-200 mb-2">
                        <span className="italic text-gray-400">2019 – 2024</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                        <li>Sommer- og feriejobb.</li>
                        <li>Ansvar for logistikk og pasienttransport under tidspress med høy grad av service.</li>
                    </ul>
                    </div>

                    <div>
                    <h4 className="font-semibold text-white mb-1">Circle K Stokmarknes – Deltidsjobb</h4>
                    <p className="text-gray-200 mb-2">
                        <span className="italic text-gray-400">2015 – 2018</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                        <li>Kundebehandling, salg og drift i et hektisk miljø.</li>
                    </ul>
                    </div>
                </ExpandableCard>

                {/* --- OM MEG --- */}
                <ExpandableCard
                    title="Om meg"
                    icon="person-wave.svg"
                    gradient="bg-gradient-to-br from-yellow-700 to-orange-700 border-yellow-700"
                >
                    <p>
                    Jeg trives godt i team og ser verdien av samarbeid for å finne gode løsninger.
                    </p>
                    <p>
                    Jeg setter meg raskt inn i ny teknologi og motiveres av kontinuerlig læring.
                    </p>
                    <p>
                    Jeg liker å bidra aktivt i diskusjoner og problemløsning, og setter pris på et arbeidsmiljø der man kan støtte og lære av hverandre – og ha det gøy på jobb.
                    </p>
                </ExpandableCard>
                </div>

            <div className="flex justify-center my-10">
                <div className="w-full h-1 bg-gray-900 rounded-full"></div>
            </div>
            <ProjectSection/>
        </div>
      </div>
    );
  }
