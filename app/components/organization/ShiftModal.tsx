"use client";
import React, { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSuccess: (type: string) => void; // Pass "shifts" back to refresh
};

export default function ShiftModal({ isOpen, onClose, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState<any>({
    shift_name: "",
    start_shift: "08:00",
    end_shift: "17:00",
    break_duration_minutes: 60,
  });

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        shift_name: "",
        start_shift: "08:00",
        end_shift: "17:00",
        break_duration_minutes: 60,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
  const isEdit = !!initialData?.id;

  const url = isEdit ? `/api/shifts/${initialData.id}` : "/api/shifts";
  const method = isEdit ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    onSuccess("shifts");
    onClose();
  }
};

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-white max-w-md">
        {/* HEADER */}
        <h3 className="font-bold text-lg text-[#1A77F2]">
          {isEdit ? "Edit" : "Add New"} Shift
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Configure working hours and break duration.
        </p>

        <div className="space-y-4">
          {/* SHIFT NAME */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Shift Name</p>
            <input
              name="shift_name"
              placeholder="e.g., Morning Shift"
              value={formData.shift_name || ""}
              onChange={handleChange}
              className="input input-bordered w-full focus:border-[#1A77F2]"
            />
          </div>

          {/* TIME INPUTS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Start Time</p>
              <input
                type="time"
                name="start_shift"
                value={formData.start_shift || ""}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">End Time</p>
              <input
                type="time"
                name="end_shift"
                value={formData.end_shift || ""}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* BREAK DURATION */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Break Duration (Minutes)</p>
            <input
              type="number"
              name="break_duration_minutes"
              value={formData.break_duration_minutes || ""}
              onChange={handleChange}
              className="input input-bordered w-full"
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
            {isEdit ? "Update Shift" : "Save Shift"}
          </button>
        </div>
      </div>
      
      {/* Background overlay to close when clicking outside */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}