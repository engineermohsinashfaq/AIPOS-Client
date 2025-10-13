import engineerMohsinImage from "../assets/developer-image/engineer-mohsin-image.jpg";
import engineerAmjadImage from "../assets/developer-image/engineer-mohsin-image.jpg";
import engineerAbdulHaseebImage from "../assets/developer-image/engineer-mohsin-image.jpg"; 

const developers = [
  {
    name: "MOHSIN ASHFAQ",
    role: "Full-stack Developer",
    description:
      "Passionate about creating beautiful, modern, and functional web applications & solutions.",
    image: engineerMohsinImage,
    email: "developer@example.com",
    whatsapp: "1234567890",
  },
  {
    name: "AMJAD ALI",
    role: "Backend Developer",
    description:
      "Specializes in building scalable backend systems and APIs for modern web applications.",
    image: engineerAmjadImage,
    email: "ali@example.com",
    whatsapp: "0987654321",
  },
];

const supervisor = {
  name: "SYED ABDUL HASEEB",
  role: "Project Supervisor",
  description:
    "Oversees development progress and ensures quality across all projects.",
  image: engineerAbdulHaseebImage,
  email: "supervisor@example.com",
  whatsapp: "1122334455",
};

export default { developers, supervisor };
