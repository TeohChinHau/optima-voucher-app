import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Eye, EyeOff } from "lucide-react";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
} from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";
import { API_BASE_URL } from "../api/client";
import { validatePassword } from "../utils/validatePassword";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState("");
  const [gender, setGender] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token, login: setAuth } = useAuth();
  const { showToast } = useToast();

  const loadProfile = () => {
    getProfile()
      .then((res) => {
        if (res.data.success && res.data.data) {
          setFullName(res.data.data.fullName);
          setEmail(res.data.data.email);
          setPoints(res.data.data.points);
          setTier(res.data.data.membershipTier);
          setGender(res.data.data.gender || "");
          setPictureUrl(res.data.data.profilePictureUrl || "");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    await updateProfile(fullName, gender);
    if (token) setAuth(token, fullName, points);
    showToast("Profile updated successfully!");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadProfilePicture(file);
    if (res.data.success && res.data.data) {
      setPictureUrl(res.data.data.url);
      showToast("Profile picture updated!");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showToast(passwordError, "error");
      return;
    }
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.data.success) {
        showToast("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to change password",
        "error",
      );
    }
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
        <Link
          to="/dashboard"
          className="text-sm text-orange-400 hover:underline"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-bold">My Profile</h1>
        <span className="w-10" />
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        {/* Avatar */}
        <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center">
              {pictureUrl ? (
                <img
                  src={`${API_BASE_URL}${pictureUrl}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-slate-400">
                  {fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 hover:bg-orange-400"
            >
              <Camera size={14} className="text-slate-900" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="mt-3 font-semibold">{fullName}</p>
          <p className="text-sm text-slate-400">{tier}</p>
        </div>

        {/* Profile details */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Personal Details</h2>

          <label className="text-sm text-slate-400 mb-1 block">Email</label>
          <p className="mb-4 text-slate-300">{email}</p>

          <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-orange-400"
          />

          <label className="text-sm text-slate-400 mb-1 block">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-orange-400"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label className="text-sm text-slate-400 mb-1 block">
            Points Balance
          </label>
          <p className="mb-6 font-bold text-orange-400">
            {points.toLocaleString()} pts
          </p>

          <Button onClick={handleSave}>Save Changes</Button>
        </div>

        {/* Change password */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Change Password</h2>

          <div className="relative mb-3">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-orange-400"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((s) => !s)}
              aria-label={showCurrent ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative mb-4">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-orange-400"
            />
            <button
              type="button"
              onClick={() => setShowNew((s) => !s)}
              aria-label={showNew ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button onClick={handleChangePassword} variant="secondary">
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}
