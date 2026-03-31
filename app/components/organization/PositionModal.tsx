"use client";
import React, { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSuccess: (type: string) => void;
};

export default function PositionModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState<any>({
    position_name: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        position_name: "",
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
      ? `/api/positions/${initialData.id}`
      : "/api/positions";
    const method = isEdit ? "PUT" : "POST";

    const payload = { name: formData.name };

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      onSuccess("positions");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-white max-w-md">
        {/* HEADER */}
        <h3 className="font-bold text-lg text-[#1A77F2]">
          {isEdit ? "Edit" : "Add New"} Positions
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Configure position details.
        </p>

        <div className="space-y-4">
          {/* POSITION NAME */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Position Name
            </p>
            <input
              name="name"
              placeholder="e.g., Software Engineer"
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
            {isEdit ? "Update Position" : "Save Position"}
          </button>
        </div>
      </div>

      {/* Background overlay to close when clicking outside */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
