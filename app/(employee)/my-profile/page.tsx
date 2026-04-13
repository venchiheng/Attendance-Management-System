"use client";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function MyProfilePage() {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/employees/me");
        if (res.ok) {
          const data = await res.json();
          setEmployee(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 1. Local UI Preview
  setImagePreview(URL.createObjectURL(file));

  // 2. Prepare Form Data
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/employees/upload-pfp", {
      method: "POST",
      body: formData, // Send as multipart/form-data
    });

    if (res.ok) {
      const data = await res.json();
      setEmployee({
        ...employee,
        profiles: { ...employee.profiles, pfp_url: data.url }
      });
    }
  } catch (err) {
    console.error("Upload failed:", err);
  }
};

  const calculateTimeWithCompany = (hireDate: string) => {
    if (!hireDate) return "---";
    const start = new Date(hireDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const yearStr = years > 0 ? `${years} year` : "";
    const monthStr = months > 0 ? `${months} months` : "";

    if (yearStr && monthStr) return `${yearStr} ${monthStr}`;
    return yearStr || monthStr || "New Joiner";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!employee) {
    return <div className="p-6 text-center">Profile not found.</div>;
  }

  return (
    <div
      className={`flex flex-col ${
        isEditing ? "items-start" : "lg:flex-row"
      } gap-8 p-4 md:p-0 transition-all duration-300`}
    >
      {/* Left side - Profile Overview */}
      <div
        className={`flex flex-col w-full ${
          isEditing ? "max-w-2xl" : "lg:max-w-[320px]"
        } bg-white rounded-2xl border border-gray-100 h-fit shadow-sm`}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 p-6 md:p-8 rounded-t-2xl bg-blue-100">
          <div className="relative group">
            {!isEditing ? (
              /* 1. VIEW MODE: Show Initials */
              <div className="bg-blue-600 text-primary-content flex items-center justify-center rounded-full w-20 h-20 md:w-24 md:h-24 shadow-lg overflow-hidden">
                <span className="text-2xl md:text-3xl font-semibold">
                  {employee.full_name
                    ? employee.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U"}
                </span>
              </div>
            ) : (
              /* 2. EDIT MODE: Show Preview OR Upload Icon */
              <label className="relative flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer overflow-hidden group">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay to allow re-uploading */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Icon
                        icon="solar:camera-linear"
                        className="text-white text-xl"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Icon
                      icon="solar:camera-add-bold"
                      className="text-blue-600 text-2xl"
                    />
                    <span className="text-[10px] font-bold text-blue-600 mt-1 uppercase">
                      Upload
                    </span>
                  </>
                )}

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Create a temporary URL for the selected file
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {employee.full_name}
            </h2>
            <p className="text-blue-600 font-medium text-sm md:text-base">
              {employee.positions?.name || "No Position Assigned"}
            </p>
          </div>
        </div>

        {/* Detail */}
        <div className="flex flex-col gap-6 p-6">
          {!isEditing ? (
            <>
              <DetailItem
                label="Department"
                value={employee.departments?.name || "---"}
              />
              <DetailItem
                label="Work Mode"
                value={employee.work_mode}
                isCapitalize
              />
              <DetailItem
                label="Employment Type"
                value={employee.employment_type?.replace("_", " ")}
                isCapitalize
              />
              <DetailItem
                label="Joined Date"
                value={employee.hire_date || "---"}
              />
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors p-3 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
              >
                <Icon icon="solar:pen-new-square-linear" />
                Edit Profile
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Icon
                    icon="solar:lock-password-linear"
                    className="text-blue-600"
                  />
                  Change Password
                </h3>

                <div className="form-control">
                  <label className="label pt-0">
                    <span className="label-text text-xs font-bold text-gray-400 uppercase">
                      Old Password
                    </span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:outline-blue-500"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label pt-0">
                      <span className="label-text text-xs font-bold text-gray-400 uppercase">
                        New Password
                      </span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:outline-blue-500"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label pt-0">
                      <span className="label-text text-xs font-bold text-gray-400 uppercase">
                        Confirm Password
                      </span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:outline-blue-500"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="text-blue-600 text-sm font-semibold hover:underline w-fit"
                  onClick={() => alert("Redirect to forgot password flow")}
                >
                  Forgot password?
                </button>
              </div>

              <div className="divider"></div>

              <div className="flex flex-row gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 btn btn-ghost rounded-2xl border-gray-200"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors p-3 rounded-2xl text-white font-semibold"
                  onClick={() => setIsEditing(false)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Content Sections */}
      {!isEditing && (
        <div className="flex flex-col flex-1 gap-6 md:gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm">
            <div className="flex flex-row items-center bg-blue-50 p-4 rounded-t-2xl gap-3">
              <div className="flex items-center bg-blue-600 p-2 rounded-xl text-white">
                <Icon icon="tabler:user" className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg font-semibold text-blue-900">
                Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-medium">
                  Email Address
                </span>
                <p className="font-semibold text-gray-800">{employee.email}</p>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-medium">
                  Phone Number
                </span>
                <p className="font-semibold text-gray-800">
                  {employee.phone_number || "---"}
                </p>
              </div>
            </div>
          </div>

          {/* Employment details */}
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm">
            <div className="flex flex-row items-center bg-green-100 p-4 rounded-t-2xl gap-3">
              <div className="flex items-center bg-green-600 p-2 rounded-xl text-white">
                <Icon
                  icon="majesticons:checkbox-list-detail-line"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
              </div>
              <h2 className="text-lg font-semibold text-green-900">
                Employment Details
              </h2>
            </div>

            {/* Changed grid-cols-2 to grid-cols-1 md:grid-cols-2 for better mobile fit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="flex flex-col gap-1 text-blue-800 bg-blue-50 p-5 rounded-2xl border border-blue-200">
                <div className="flex flex-row items-center gap-2 mb-1">
                  <Icon
                    icon={"mingcute:time-duration-line"}
                    className="w-4 h-4"
                  ></Icon>
                  <span className="text-sm font-medium">Time with Company</span>
                </div>
                <p className="text-xl font-semibold">
                  {calculateTimeWithCompany(employee.hire_date)}
                </p>
              </div>

              <div className="flex flex-col gap-1 text-purple-800 bg-purple-50 p-5 rounded-2xl border border-purple-200">
                <div className="flex flex-row items-center gap-2 mb-1">
                  <Icon icon={"solar:global-linear"} className="w-4 h-4"></Icon>
                  <span className="text-sm font-medium">Employment Status</span>
                </div>
                <p className="text-xl font-semibold capitalize">
                  {employee.employment_status || "---"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for detail items on the left side
const DetailItem = ({
  label,
  value,
  isCapitalize,
}: {
  label: string;
  value: string;
  isCapitalize?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
      {label}
    </p>
    <p
      className={`font-semibold text-gray-700 ${
        isCapitalize ? "capitalize" : ""
      }`}
    >
      {value || "---"}
    </p>
  </div>
);
