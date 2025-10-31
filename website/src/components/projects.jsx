import Modal from "./modal";
import ResultsPanel from "./ResultsPanel";

export default function ProjectSection() {
  const projects = [
    {
      title: "AWS Resume Project",
      img: "aws.svg",
      desc: "Et prosjekt som viser DevOps og AWS-ferdigheter.",
      link: "https://github.com/petterr-n/aws-resume",
    },
    {
      title: "Fish Watch",
      img: "computer-vision.svg",
      desc: "Masteroppgave som omhandler maskinsyn og oppdrett",
      link: null,
    },
  ];

  return (
    <section className="">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((proj) => (
          <div
            key={proj.title}
            className="bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 transform transition duration-300"
          >
            <img
              src={proj.img}
              alt={proj.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-white">{proj.title}</h3>
              <p className="text-gray-300 text-sm mt-2">{proj.desc}</p>

              {proj.title === "Fish Watch" ? (
                <Modal title="Fish Watch" triggerText="Mer info">
                  <p>
                    Dette prosjektet er en masteroppgave som omhandler
                    maskinsyn og oppdrett. Den fokuserer på å bruke
                    <strong> computer vision </strong> for å overvåke fiskens
                    helse og bevegelse i oppdrettsanlegg.
                  </p>

                  <p className="mt-3">
                    Det ble utviklet en løsning som kombinerer
                    bildeanalyse og maskinlæring for å gi innsikt i
                    fiskeatferd, med potensial for å redusere svinn og
                    forbedre bærekraften i oppdrettsnæringen.
                  </p>

                  <img
                    src="fishwatch-preview.jpg"
                    alt="Fish Watch project preview"
                    className="mt-4 rounded-lg"
                  />
                </Modal>
              ) : (

              <a
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Se prosjekt
              </a>
              )}
            </div>
          </div>
        ))}
        <ResultsPanel />
      </div>
    </section>
  );
}
