import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminProfile() {
  const initialProfile = {
    name: "Admin Name",
    email: "admin@example.com",
    cnic: "xxxxx-xxxxxxx-x",
    password: "mohsin@pakistani",
  };

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("admin_profile");
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [form, setForm] = useState(profile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function notifySuccess(msg) {
    toast.success(msg, { position: "top-right", autoClose: 2000 });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "cnic") {
      let digits = value.replace(/\D/g, "").slice(0, 13);
      let formatted = digits;
      if (digits.length > 5 && digits.length <= 12)
        formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      if (digits.length === 13)
        formatted = `${digits.slice(0, 5)}-${digits.slice(
          5,
          12
        )}-${digits.slice(12)}`;
      setForm((s) => ({ ...s, cnic: formatted }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleSave() {
    if (!form.name.trim())
      return toast.error("Name is required", { autoClose: 2000 });
    if (!form.email.trim())
      return toast.error("Email is required", { autoClose: 2000 });
    if (!/\S+@\S+\.\S+/.test(form.email))
      return toast.error("Invalid email", { autoClose: 2000 });
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic))
      return toast.error("CNIC must be 13 digits in 5-7-1 format", {
        autoClose: 2000,
      });
    if (!form.password.trim())
      return toast.error("Password cannot be empty", { autoClose: 2000 });

    setProfile(form);
    localStorage.setItem("admin_profile", JSON.stringify(form));
    notifySuccess("Profile updated successfully");
    setIsModalOpen(false);
    setConfirmModalOpen(false);
  }

  function openModal() {
    setForm(profile);
    setShowPassword(false);
    setIsModalOpen(true);
  }

  return (
    <div className="h-[100%] flex items-center justify-center text-white p-4">
      {/* ToastContainer with dark theme and 2s duration */}
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
      
      <div className="max-w-lg w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 shadow-2xl text-center transform  transition duration-300">
        <h2 className="text-4xl font-extrabold mb-6 tracking-wide">Profile</h2>
        <div className="text-left space-y-2 text-lg">
          <p>
            <strong className="font-bold text-white">Name:</strong>{" "}
            {profile.name}
          </p>
          <p>
            <strong className="font-bold text-white">Email:</strong>{" "}
            {profile.email}
          </p>
          <p>
            <strong className="font-bold text-white">CNIC:</strong>{" "}
            {profile.cnic}
          </p>
        </div>
        <button
          onClick={openModal}
          className="mt-8 px-8 py-3 bg-cyan-800/80 hover:bg-cyan-900 rounded-xl shadow-lg hover:shadow-cyan-900/50 transition cursor-pointer text-lg font-medium"
        >
          Edit
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-md z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl text-white animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Edit Profile
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmModalOpen(true);
              }}
              className="space-y-4"
            >
              {["name", "email", "cnic", "password"].map((field) => (
                <input
                  key={field}
                  name={field}
                  type={
                    field === "password"
                      ? showPassword
                        ? "text"
                        : "password"
                      : "text"
                  }
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full p-4 rounded-md bg-black/30 border border-white/20 outline-none placeholder-white/60 focus:ring-2 focus:ring-white/20 shadow-inner"
                />
              ))}

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  id="showPassword"
                  className="accent-cyan-400 hover:cursor-pointer"
                />
                <label
                  htmlFor="showPassword"
                  className="text-sm text-white/80 hover:cursor-pointer"
                >
                  Show Password
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-lg cursor-pointer bg-red-600 hover:bg-red-700 transition shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-800/80 hover:bg-cyan-900 cursor-pointer transition shadow-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-xl text-white text-center">
            <h3 className="text-xl font-semibold mb-4">Confirm Save</h3>
            <p className="mb-5">Are you sure you want to save changes?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-5 py-2 cursor-pointer rounded-lg bg-red-600 hover:bg-red-700 transition shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 cursor-pointer rounded-lg bg-cyan-800/80 hover:bg-cyan-900 transition shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
