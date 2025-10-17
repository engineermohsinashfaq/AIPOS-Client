import React, { useState } from "react";
import { X, Mail, MessageCircle } from "lucide-react"; // MessageCircle = WhatsApp-like icon
import devImage1 from "../../../../assets/developer-images/engineer-mohsin-image.webp";

const Developers = () => {
  const [developers] = useState([
    {
      name: "Mohsin",
      role: "Full Stack Developer",
      description:
        "Mohsin is a fullstack developer specializing in React, UI/UX design, and backend development, crafting seamless and intuitive web applications.",
      image: devImage1,
      email: "mohsin@example.com",
      whatsapp: "+1234567890", // 👈 use full international format, e.g., +923001234567
    },
    {
      name: "Ahsan",
      role: "Frontend Engineer",
      description:
        "Ahsan focuses on building pixel-perfect, high-performance React and Next.js applications with clean UI/UX design.",
      image: devImage1,
      email: "ahsan@example.com",
      whatsapp: "+1234567890",
    },
    {
      name: "Sara",
      role: "Backend Developer",
      description:
        "Sara is a backend expert specializing in Node.js, Express, and database optimization for scalable systems.",
      image: devImage1,
      email: "sara@example.com",
      whatsapp: "+1234567890",
    },
  ]);

  const [selectedDev, setSelectedDev] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="px-4 sm:px-6 md:px-10 py-10 text-white h-[100%] flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-2">
            About the Developers
          </h1>
          <p className="text-white/90 text-base sm:text-lg">
            Meet the team and contributors behind the project.
          </p>
        </div>

        {/* Developer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
          {developers.map((dev, id) => (
            <div
              key={id}
              onClick={() => {
                setSelectedDev(dev);
                setIsModalOpen(true);
              }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center shadow-md hover:scale-105 transition-transform cursor-pointer w-full max-w-xs sm:max-w-sm md:max-w-md"
            >
              <img
                src={dev.image}
                alt={dev.name}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-white/30 mb-3"
              />
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                {dev.name}
              </h2>
              <p className="text-white/90 text-sm sm:text-base md:text-lg">
                {dev.role}
              </p>
              <p className="text-white/70 text-sm sm:text-base mt-2">
                {dev.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedDev && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm p-4">
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg text-white shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-white/80 hover:bg-white/20 transition p-1 cursor-pointer bg-white/10 rounded-full"
              aria-label="Close modal"
            >
              <X size={22} />
            </button>

            {/* Developer Info */}
            <img
              src={selectedDev.image}
              alt={selectedDev.name}
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full object-cover border-2 border-white/30 mx-auto mb-4"
            />
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
              {selectedDev.name}
            </h2>
            <p className="text-center text-base sm:text-lg text-white/80 mb-2">
              {selectedDev.role}
            </p>
            <p className="text-white/70 text-center text-sm sm:text-base mb-6">
              {selectedDev.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {/* Email Button */}
              <a
                href={`mailto:${selectedDev.email}`}
                className="flex border border-white/40  items-center justify-center gap-2 bg-blue-500/70 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium transition w-full sm:w-auto"
              >
                Email
              </a>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${selectedDev.whatsapp.replace(
                  /[^\d+]/g,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex border border-white/40 items-center justify-center gap-2 bg-green-500/70 hover:bg-green-500 text-white px-4 py-2 rounded-md font-medium transition w-full sm:w-auto"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Developers;
