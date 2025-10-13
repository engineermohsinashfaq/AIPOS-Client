import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminProfile() {
  // Dummy initial admin profile
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
    // Validate before saving
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(form.email)) return toast.error("Invalid email");
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic))
      return toast.error("CNIC must be 13 digits in 5-7-1 format");
    if (!form.password.trim()) return toast.error("Password cannot be empty");

    // Save profile
    setProfile(form);
    localStorage.setItem("admin_profile", JSON.stringify(form));
    notifySuccess("Profile updated successfully");
    setIsModalOpen(false);
    setConfirmModalOpen(false);
  }

  function openModal() {
    setForm(profile); // Load current profile into form
    setShowPassword(false); // Hide password by default
    setIsModalOpen(true);
  }

  return (
    <div className="p-4 min-h-screen text-white">
      <ToastContainer />
      <div className="max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-4">Profile</h2>
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>

        <button
          onClick={openModal}
          className="mt-5 px-4 py-2 bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer rounded"
        >
          Edit Profile
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-full max-w-md text-white">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmModalOpen(true); // Open confirm modal instead of saving directly
              }}
              className="space-y-3"
            >
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="cnic"
                value={form.cnic}
                onChange={handleChange}
                placeholder="CNIC"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  id="showPassword"
                  className="accent-green-500 hover:cursor-pointer"
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
                  className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
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
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
            <h3 className="text-lg font-semibold mb-4">Confirm Save</h3>
            <p className="mb-4">Are you sure you want to save changes?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
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
