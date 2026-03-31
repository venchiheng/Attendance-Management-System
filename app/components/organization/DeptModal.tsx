"use client";
import React, { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSuccess: (type: string) => void; // Pass "shifts" back to refresh
};

export default function DeptModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState<any>({
    department_name: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        department_name: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const isEdit = !!initialData?.id;

    const url = isEdit
      ? `/api/departments/${initialData.id}`
      : "/api/departments";
    const method = isEdit ? "PUT" : "POST";

    const payload = { name: formData.name };

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      onSuccess("departments");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-white max-w-md">
        {/* HEADER */}
        <h3 className="font-bold text-lg text-[#1A77F2]">
          {isEdit ? "Edit" : "Add New"} Department
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Configure department details.
        </p>

        <div className="space-y-4">
          {/* DEPARTMENT NAME */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Department Name
            </p>
            <input
              name="name"
              placeholder="e.g., Human Resources"
              value={formData.name || ""}
              onChange={handleChange}
              className="input input-bordered w-full focus:border-[#1A77F2]"
            />
          </div>
        </div>
        {/* ACTIONS */}
        <div className="modal-action mt-8">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn bg-[#1A77F2] hover:bg-[#155fc4] text-white border-none"
            onClick={handleSave}
          >
            {isEdit ? "Update Department" : "Save Department"}
          </button>
        </div>
      </div>

      {/* Background overlay to close when clicking outside */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
