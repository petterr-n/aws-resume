import Modal from "./modal";
import ResultsPanel from "./ResultsPanel";

export default function ProjectSection({ projects }) {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 transform transition duration-300"
          >
            <img
              src={project.image}
              alt=""
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-white">
                {project.title}
              </h3>
              <p className="text-gray-300 text-sm mt-2">{project.description}</p>

              {project.details ? (
                <Modal title={project.title} triggerText="Mer info">
                  {project.details.map((paragraph) => (
                    <p key={paragraph} className="mt-3 first:mt-0">
                      {paragraph}
                    </p>
                  ))}
                </Modal>
              ) : (
                <a
                  href={project.link}
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
