import React, { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  metadata: any;
  mode: string;
  onSuccess: () => void;
};

const WORK_MODES = ["on-site", "remote", "hybrid"];
const EMPLOYMENT_TYPES = ["full_time", "part_time"];
const EMPLOYMENT_STATUSES = ["active", "inactive"];

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm font-semibold text-gray-400 mb-2">
    {children} <span className="text-red-500">*</span>
  </p>
);

export default function CreateEmployee({
  isOpen,
  onClose,
  initialData,
  metadata,
  onSuccess,
  mode = "add",
}: Props) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false); // Added loading state
  // const isEdit = !!initialData?.id;
  const isEdit = mode === "edit";
  const isView = mode === "view";

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        work_mode: "on-site",
        employment_type: "full_time",
        employment_status: "active",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // UI Helper for refined "View" mode styling
  const inputClass = (custom?: string) =>
    `w-full ${
      isView
        ? "bg-white border-none focus:outline-none cursor-default font-medium text-black"
        : "input input-bordered w-full"
    } ${custom || ""}`;
  const selectClass = `w-full ${
    isView
      ? "bg-white border-none focus:outline-none cursor-default appearance-none font-medium text-black"
      : "select-bordered"
  }`;
  const labelClass = "text-sm font-semibold text-gray-400 mb-2";

  // Helper to format text (e.g. full_time -> Full Time)
  const formatLabel = (str: string) => {
    return (
      str?.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "---"
    );
  };

  const handleSave = async () => {
    // 1. Define all fields that must be filled
    const requiredFields = [
      { key: "full_name", label: "Full Name" },
      { key: "email", label: "Email Address" },
      { key: "phone_number", label: "Phone Number" },
      { key: "position_id", label: "Position" },
      { key: "department_id", label: "Department" },
      { key: "shift_id", label: "Shift Type" },
      { key: "hire_date", label: "Hire Date" },
      { key: "work_mode", label: "Work Mode" },
      { key: "employment_type", label: "Employment Type" },
    ];

    // 2. Check for missing values
    for (const field of requiredFields) {
      if (
        !formData[field.key] ||
        formData[field.key].toString().trim() === ""
      ) {
        alert(`${field.label} is required.`);
        return;
      }
    }

    // Optional: Basic Email Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? "/api/employees" : "/api/employees/invite";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert(result.error || "Failed to save employee.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box bg-white max-w-2xl">
        <h3 className="font-bold text-lg text-[#1A77F2]">
          {isView
            ? "Employee Details"
            : isEdit
            ? "Edit Employee"
            : "Add Employee"}
        </h3>
        <span className="text-sm text-gray-400">
          {isView
            ? `Viewing records for ${formData.employee_code || "New Employee"}`
            : "Fill in the employee details below."}
        </span>

        {/* PERSONAL INFO */}
        <h4 className="font-bold text-md text-gray-700 mt-6">
          Personal Information
        </h4>
        <div className="divider mt-1"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <RequiredLabel>Full Name</RequiredLabel>{" "}
            {isView ? (
              <div className="py-2 text-black font-medium">
                {formData.full_name || "---"}
              </div>
            ) : (
              <input
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleChange}
                readOnly={isView}
                className={inputClass()}
              />
            )}
          </div>
          {isView && (
            <div>
              <RequiredLabel>Employee Code</RequiredLabel>
              <div className="py-2 text-black font-medium">
                {formData.employee_code || "---"}
              </div>
            </div>
          )}
          <div>
            <RequiredLabel>Email Address</RequiredLabel>
            {isView ? (
              <div className="py-2 text-black font-medium">
                {formData.email || "---"}
              </div>
            ) : (
              <input
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                readOnly={isView}
                className={inputClass()}
              />
            )}
          </div>
          <div>
            <RequiredLabel>Phone Number</RequiredLabel>
            {isView ? (
              <div className="py-2 text-black font-medium">
                {formData.phone_number || "---"}
              </div>
            ) : (
              <input
                name="phone_number"
                value={formData.phone_number || ""}
                onChange={handleChange}
                readOnly={isView}
                className={inputClass()}
              />
            )}
          </div>
          <div className="col-span-2 ">
            <RequiredLabel>NFC Card ID</RequiredLabel>
            <input
              name="nfc_id"
              value={formData.nfc_id || ""}
              onChange={handleChange}
              readOnly={isView}
              className={inputClass()}
            />
          </div>
        </div>

        {/* JOB INFO */}
        <h4 className="font-bold text-md text-gray-700 mt-6">
          Job Information
        </h4>
        <div className="divider mt-1"></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel>Position</RequiredLabel>
            {isView ? (
              <div className="py-2 text-black font-medium">
                {metadata.positions.find(
                  (p: any) => p.id === formData.position_id
                )?.name || "---"}
              </div>
            ) : (
              <select
                name="position_id"
                value={formData.position_id || ""}
                onChange={handleChange}
                disabled={isView}
                className="select select-bordered w-full"
              >
                <option value="">Select Position</option>
                {metadata.positions.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <RequiredLabel>Department</RequiredLabel>
            {isView ? (
              <div className="py-2 text-black font-medium">
                {metadata.departments.find(
                  (d: any) => d.id === formData.department_id
                )?.name || "---"}
              </div>
            ) : (
              <select
                name="department_id"
                value={formData.department_id || ""}
                onChange={handleChange}
                disabled={isView}
                className="select select-bordered w-full"
              >
                <option value="">Select Department</option>
                {metadata.departments.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <RequiredLabel>Hire Date</RequiredLabel>
            <input
              type={isView ? "text" : "date"}
              name="hire_date"
              value={formData.hire_date || ""}
              onChange={handleChange}
              readOnly={isView}
              className={inputClass()}
            />
          </div>
          <div>
            <RequiredLabel>Work Mode</RequiredLabel>
            {isView ? (
              <div className="py-2 text-black font-medium">
                {formatLabel(formData.work_mode)}
              </div>
            ) : (
              <select
                name="work_mode"
                value={formData.work_mode || ""}
                onChange={handleChange}
                disabled={isView}
                className="select select-bordered w-full"
              >
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {formatLabel(m)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <RequiredLabel>Shift Type</RequiredLabel>
            {isView ? (
              <div className="py-2 text-black font-medium">
                {(() => {
                  const s = metadata.shifts.find(
                    (s: any) => s.id === formData.shift_id
                  );
                  return s ? `${s.shift_name}` : "---";
                })()}
              </div>
            ) : (
              <select
                name="shift_id"
                value={formData.shift_id || ""}
                onChange={handleChange}
                disabled={isView}
                className="select select-bordered w-full"
              >
                <option value="">Select Shift</option>
                {metadata.shifts.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.shift_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <RequiredLabel>Employment Type</RequiredLabel>
            {isView ? (
              <div className="py-2 text-black font-medium">
                {formatLabel(formData.employment_type)}
              </div>
            ) : (
              <select
                name="employment_type"
                value={formData.employment_type || ""}
                onChange={handleChange}
                disabled={isView}
                className="select select-bordered w-full"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatLabel(t)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {(isEdit || isView) && (
          <div className="mt-4">
            <RequiredLabel>Employment Status</RequiredLabel>
            {isView ? (
              <div className="py-2 text-black font-medium">
                {formatLabel(formData.employment_status)}
              </div>
            ) : (
              <select
                name="employment_status"
                value={formData.employment_status || ""}
                onChange={handleChange}
                disabled={isView}
                className="select select-bordered w-full"
              >
                {EMPLOYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {formatLabel(s)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="modal-action mt-8">
          <button className="btn btn-ghost" onClick={onClose}>
            {isView ? "Close" : "Cancel"}
          </button>

          {!isView && (
            <button
              className="btn bg-[#1A77F2] hover:bg-blue-700 text-white border-none"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : isEdit ? (
                "Update"
              ) : (
                "Send Invitation"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
