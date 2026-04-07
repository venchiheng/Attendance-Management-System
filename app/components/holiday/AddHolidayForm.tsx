"use client";
import React from "react";
import Selector from "../Selector";


interface Props {
  newHoliday: {
    holiday_name: string;
    holiday_date: string;
    holiday_type: "Public" | "Company";
  };
  setNewHoliday: (val: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddHolidayForm = ({ newHoliday, setNewHoliday, onSubmit, onCancel }: Props) => {
  const isInvalid = !newHoliday.holiday_name || !newHoliday.holiday_date;

  return (
    <div className="bg-[#f0f7ff] p-6 rounded-2xl border border-[#e0eeff] mb-8 shadow-sm animate-in fade-in slide-in-from-top-2">
      <h3 className="font-bold text-[#001a41] text-lg mb-4">Add New Holiday</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Holiday Name</label>
          <input 
            type="text" 
            placeholder="e.g., Labor Day" 
            className="input input-bordered w-full bg-white border-gray-200 rounded-xl"
            value={newHoliday.holiday_name}
            onChange={(e) => setNewHoliday({...newHoliday, holiday_name: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Date</label>
          <input 
            type="date" 
            className="input input-bordered w-full bg-white border-gray-200 rounded-xl"
            value={newHoliday.holiday_date}
            onChange={(e) => setNewHoliday({...newHoliday, holiday_date: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Type</label>
          <Selector 
            options={[
              { label: "Public", value: "Public" },
              { label: "Company", value: "Company" },
            ]}
            value={newHoliday.holiday_type}
            onChange={(e) => setNewHoliday({...newHoliday, holiday_type: e.target.value as "Public" | "Company"})}
            placeholder="Pick a type"
            showDefaultOption={false}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onSubmit}
          disabled={isInvalid}
          className="btn bg-[#1a69ff] hover:bg-[#0051e6] text-white border-none px-8 rounded-xl disabled:bg-gray-300"
        >
          Add Holiday
        </button>
        <button 
          onClick={onCancel}
          className="btn bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-8 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddHolidayForm;