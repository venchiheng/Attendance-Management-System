import React from 'react';
import { Icon } from '@iconify/react';

const AddShiftForm = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="bg-[#f0f7ff] border border-blue-200 rounded-2xl p-6 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-gray-800">Add New Shift</h2>

            {/* Shift Name */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text font-medium text-gray-600">Shift Name</span>
                </label>
                <input 
                    type="text" 
                    placeholder="e.g., Night Shift" 
                    className="input input-bordered w-full rounded-xl bg-white border-gray-200 focus:border-blue-400" 
                />
            </div>

            {/* Time and Break Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium text-gray-600">Start Time</span>
                    </label>
                    <div className="relative">
                        <input 
                            type="time" 
                            defaultValue="09:00" 
                            className="input input-bordered w-full rounded-xl bg-white border-gray-200 pr-10" 
                        />
                    </div>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium text-gray-600">End Time</span>
                    </label>
                    <div className="relative">
                        <input 
                            type="time" 
                            defaultValue="17:00" 
                            className="input input-bordered w-full rounded-xl bg-white border-gray-200 pr-10" 
                        />
                    </div>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium text-gray-600">Break Duration (min)</span>
                    </label>
                    <input 
                        type="number" 
                        defaultValue="60" 
                        className="input input-bordered w-full rounded-xl bg-white border-gray-200" 
                    />
                </div>
            </div>

            {/* Work Days */}
            <div className="flex flex-col gap-2">
                <label className="label">
                    <span className="label-text font-medium text-gray-600">Work Days</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                        <button 
                            key={day} 
                            type="button"
                            className={`btn btn-sm normal-case rounded-lg border-gray-200 font-medium ${
                                 day === 'Sun' 
                                ? 'btn-ghost bg-white text-gray-400 opacity-60' 
                                : 'bg-white text-gray-700 hover:border-blue-400'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2">
                <button className="btn bg-blue-600 border-none hover:bg-blue-700 text-white rounded-xl px-8">
                    Add Shift
                </button>
                <button className="btn btn-ghost bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-8">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddShiftForm;