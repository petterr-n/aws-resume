export default function ProjectSection() {
  const projects = [
    {
      title: "AWS Resume Project",
      img: "/images/aws-resume.png",
      desc: "Et prosjekt som viser DevOps og AWS-ferdigheter.",
      link: "https://github.com/petter/aws-resume",
    },
    {
      title: "Fish Watch",
      img: "/images/react-portfolio.png",
      desc: "Masteroppgave som omhandler maskinsyn og oppdrett",
      link: "https://github.com/petter/react-portfolio",
    },
    {
      title: "Automation Script",
      img: "/images/automation.png",
      desc: "Et Python-prosjekt som automatiserer arbeidsflyter.",
      link: "https://github.com/petter/automation-script",
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
              <a
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Se prosjekt
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
