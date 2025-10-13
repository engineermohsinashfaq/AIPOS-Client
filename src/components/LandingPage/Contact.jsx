// |===============================| Import React, Formik, Yup, Framer Motion, and Icons |===============================|
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// |===============================| Animation Variants |===============================|
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};
const cardVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// |===============================| Contact Component |===============================|
const Contact = () => {
  // |===============================| Formik Setup |===============================|
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      subject: Yup.string().required("Subject is required"),
      message: Yup.string().required("Message is required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const response = await fetch("https://formspree.io/f/mwprpprr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (response.ok) {
          alert("Thanks for your message!");
          resetForm();
        } else {
          alert("Submission failed. Please try again.");
        }
      } catch (error) {
        alert("An error occurred. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <motion.section
      id="contact"
      className="relative py-30 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10">
          {/* |===============================| Section Header |===============================| */}
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get In Touch
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Visit our store or contact us today. We're here to help you find
              the perfect electronics with the best payment plans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* |===============================| Contact Info Section |===============================| */}
            <motion.div
              className="space-y-8 lg:space-y-12"
              variants={staggerContainer}
            >
              {/* |===============================| Contact Info Cards |===============================| */}
              <motion.div
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                variants={cardVariant}
              >
                <h3 className="text-2xl font-semibold text-white mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      icon: LocationOnIcon,
                      title: "Store Location",
                      text: "Tipu Sultan Rd, Peshawar Cantonment, Peshawar, Pakistan",
                      gradient: "from-blue-500 to-purple-500",
                    },
                    {
                      icon: PhoneIcon,
                      title: "Phone",
                      text: "+92 (332) 9094396 \n+92 (318) 9239614",
                      gradient: "from-green-500 to-teal-500",
                    },
                    {
                      icon: MailIcon,
                      title: "Email",
                      text: "info.zubielectronics@gmail.com",
                      gradient: "from-orange-500 to-red-500",
                    },
                    {
                      icon: AccessTimeIcon,
                      title: "Business Hours",
                      text: "Mon-Sat: 09:00 AM - 09:00 PM\nSun: 10:00 AM - 07:00 PM",
                      gradient: "from-purple-500 to-pink-500",
                    },
                  ].map((info, idx) => {
                    const Icon = info.icon;
                    return (
                      <motion.div
                        className="flex items-center space-x-4"
                        key={idx}
                        variants={fadeInUp}
                      >
                        <div
                          className={`p-3 bg-gradient-to-r ${info.gradient} rounded-lg text-white`}
                        >
                          <Icon sx={{ width: 24, height: 24 }} />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {info.title}
                          </div>
                          <div className="text-white/90 text-[13px] whitespace-pre-line">
                            {info.text}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* |===============================| Google Map Card |===============================| */}
              <motion.div
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                variants={cardVariant}
              >
                <h3 className="text-2xl font-semibold text-white mb-6">
                  Locate Us
                </h3>
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2781.5261585458175!2d71.53724329612466!3d33.997395804267576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917ab3f41fdc7%3A0xa5152a9b8582e87a!2sZubi%20electronics!5e0!3m2!1sen!2s!4v1758749602920!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </motion.div>
            </motion.div>

            {/* |===============================| Contact Form Section |===============================| */}
            <motion.div
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-sm"
              variants={cardVariant}
            >
              <h3 className="text-xl font-semibold text-white mb-6">
                Send us a Message
              </h3>

              <form className="space-y-6" onSubmit={formik.handleSubmit}>
                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-white font-medium mb-2 text-sm">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      {...formik.getFieldProps("firstName")}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First Name"
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors.firstName}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-white font-medium mb-2 text-sm">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      {...formik.getFieldProps("lastName")}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Last Name"
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors.lastName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    {...formik.getFieldProps("email")}
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@info.com"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    {...formik.getFieldProps("subject")}
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Inquiry about installment plans"
                  />
                  {formik.touched.subject && formik.errors.subject && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.subject}
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Message
                  </label>
                  <textarea
                    name="message"
                    {...formik.getFieldProps("message")}
                    rows={13}
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                  {formik.touched.message && formik.errors.message && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.message}
                    </div>
                  )}
                </div>

                {/* Submit Button with SignIn Style */}
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/10 text-white px-8 py-4 rounded-md font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:bg-white/20 hover:cursor-pointer flex items-center justify-center"
                >
                  {formik.isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// |===============================| Export Contact Component |===============================|
export default Contact;
