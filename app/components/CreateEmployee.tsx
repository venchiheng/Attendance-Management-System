import React, { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  metadata: any;
  onSuccess: () => void;
};

const WORK_MODES = ["on-site", "remote", "hybrid"];
const EMPLOYMENT_TYPES = ["full_time", "part_time"];
const EMPLOYMENT_STATUSES = ["active", "inactive"];

export default function CreateEmployee({ isOpen, onClose, initialData, metadata, onSuccess }: Props) {
  const [formData, setFormData] = useState<any>({});
  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ 
        work_mode: 'on-site', 
        employment_type: 'full_time', 
        employment_status: 'active' 
    });
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const method = isEdit ? "PUT" : "POST";
    const response = await fetch("/api/employees", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-white max-w-2xl">
        <h3 className="font-bold text-lg text-[#1A77F2]">{isEdit ? "Edit" : "Add"} Employee</h3>
        <span className="text-sm text-gray-400">Fill in the employee details below.</span>

        {/* PERSONAL INFO */}
        <h4 className="font-bold text-md text-gray-700 mt-6">Personal Information</h4>
        <div className="divider mt-1"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-xs">Full Name</p>
            <input name="full_name" value={formData.full_name || ""} onChange={handleChange} className="input input-bordered w-full" />
          </div>
          <div>
            <p className="text-xs">Email Address</p>
            <input name="email" value={formData.email || ""} onChange={handleChange} className="input input-bordered w-full" />
          </div>
          <div>
            <p className="text-xs">Phone Number</p>
            <input name="phone_number" value={formData.phone_number || ""} onChange={handleChange} className="input input-bordered w-full" />
          </div>
          <div className="col-span-2">
            <p className="text-xs">NFC Card ID</p>
            <input name="nfc_id" value={formData.nfc_id || ""} onChange={handleChange} className="input input-bordered w-full" />
          </div>
        </div>

        {/* JOB INFO */}
        <h4 className="font-bold text-md text-gray-700 mt-6">Job Information</h4>
        <div className="divider mt-1"></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs">Position</p>
            <select name="position_id" value={formData.position_id || ""} onChange={handleChange} className="select select-bordered w-full">
              <option value="">Select Position</option>
              {metadata.positions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs">Department</p>
            <select name="department_id" value={formData.department_id || ""} onChange={handleChange} className="select select-bordered w-full">
              <option value="">Select Department</option>
              {metadata.departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs">Hire Date</p>
            <input type="date" name="hire_date" value={formData.hire_date || ""} onChange={handleChange} className="input input-bordered w-full" />
          </div>
          <div>
            <p className="text-xs">Work Mode</p>
            <select name="work_mode" value={formData.work_mode || ""} onChange={handleChange} className="select select-bordered w-full">
              {WORK_MODES.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs">Shift Type</p>
            <select name="shift_id" value={formData.shift_id || ""} onChange={handleChange} className="select select-bordered w-full">
              <option value="">Select Shift</option>
              {metadata.shifts.map((s: any) => <option key={s.id} value={s.id}>{s.shift_name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs">Employment Type</p>
            <select name="employment_type" value={formData.employment_type || ""} onChange={handleChange} className="select select-bordered w-full">
              {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        {isEdit && (
            <div className="mt-4">
                <p className="text-xs">Employment Status</p>
                <select name="employment_status" value={formData.employment_status || ""} onChange={handleChange} className="select select-bordered w-full">
                    {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
            </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn bg-[#1A77F2] text-white" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}