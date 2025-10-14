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
    toast.success(msg, { position: "top-right" });
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
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(form.email)) return toast.error("Invalid email");
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic))
      return toast.error("CNIC must be 13 digits in 5-7-1 format");
    if (!form.password.trim()) return toast.error("Password cannot be empty");

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
    <div className="p-4 min-h-screen bg-gradient-to-br text-white flex ">
      <ToastContainer />
      <div className="max-w-md w-full  h-55 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Profile</h2>
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>

        <button
          onClick={openModal}
          className="mt-5 px-6 py-2 cursor-pointer bg-cyan-800/80 hover:bg-cyan-900 rounded-lg shadow-md transition"
        >
          Edit
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-xl text-white">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmModalOpen(true);
              }}
              className="space-y-3"
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
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/20 outline-none placeholder-white/70 shadow-inner"
                />
              ))}

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  id="showPassword"
                  className="accent-green-400 hover:cursor-pointer"
                />
                <label
                  htmlFor="showPassword"
                  className="text-sm text-white/80 hover:cursor-pointer"
                >
                  Show Password
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 cursor-pointer py-2 rounded-lg bg-red-600 hover:bg-red-700 transition shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 cursor-pointer rounded-lg bg-cyan-800/80 hover:bg-cyan-900 transition shadow-md"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-xl text-white">
            <h3 className="text-lg font-semibold mb-4">Confirm Save</h3>
            <p className="mb-4">Are you sure you want to save changes?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-cyan-800/80 hover:bg-cyan-900 transition shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-cyan-800/80 hover:bg-cyan-900 transition shadow-md"
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
