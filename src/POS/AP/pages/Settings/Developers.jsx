import React, { useState } from "react";
import devImage1 from "../../../../assets/developer-images/engineer-mohsin-image.webp";
const Developers = () => {
  const [developers, setDevelopers] = useState([
    {
      id: "DEV01",
      name: "Mohsin",
      role: "Full Stack Developer",
      description:
        "Mohsin is a fullstack developer specializing in React, UI/UX design, and backend development, crafting seamless and intuitive web applications.",
      image: devImage1,
    },
    {
      id: "DEV02",
      name: "Mohsin",
      role: "Full Stack Developer",
      description:
        "Mohsin is a fullstack developer specializing in React, UI/UX design, and backend development, crafting seamless and intuitive web applications.",
      image: devImage1,
    },
    {
      id: "DEV03",
      name: "Mohsin",
      role: "Full Stack Developer",
      description:
        "Mohsin is a fullstack developer specializing in React, UI/UX design, and backend development, crafting seamless and intuitive web applications.",
      image: devImage1,
    },
    
  ]);

  const [selectedDev, setSelectedDev] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBranchSelect = (branch) => {
    setDevelopers((prev) =>
      prev.map((dev) => (dev.id === selectedDev.id ? { ...dev, branch } : dev))
    );
    setSelectedDev((prev) => ({ ...prev, branch }));
  };

  return (
    <div className="p-4 min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">About the Developers</h1>
          <p className="text-white/90">
            Meet the team and contributors behind the project.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {developers.map((dev) => (
            <div
              key={dev.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 flex flex-col items-center gap-3 shadow-md hover:scale-105 transition-transform cursor-pointer"
              onClick={() => {
                setSelectedDev(dev);
                setIsModalOpen(true);
              }}
            >
              <img
                src={dev.image}
                alt={dev.name}
                className="w-36 h-36 rounded-full object-cover border-2 border-white/30"
              />
              <h2 className="text-2xl font-semibold">{dev.name}</h2>
              <p className="text-white/90">{dev.role}</p>
              <p className="text-white/70 text-center">{dev.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedDev && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md text-white">
            <img
              src={selectedDev.image}
              alt={selectedDev.name}
              className="w-48 h-48 rounded-full object-cover border-2 border-white/30 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold mb-2 text-center">
              {selectedDev.name}
            </h2>
            <p className="text-center text-lg text-white/80 mb-2">
              {selectedDev.role}
            </p>
            <p className="text-white/70 mb-4 text-center">
              {selectedDev.description}
            </p>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Developers;
