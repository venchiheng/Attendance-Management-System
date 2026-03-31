import React from "react";
import { Icon } from "@iconify/react";

interface Holiday {
  id: string;
  holiday_date: string;
  holiday_name: string;
  holiday_type: "Public" | "Company";
}

const HolidayCard = ({
  holiday,
  onDelete,
}: {
  holiday: Holiday;
  onDelete: (id: string) => void;
}) => {
  // 1. Create a Date object from the string "YYYY-MM-DD"
  const dateObj = new Date(holiday.holiday_date);
  const isPublic = holiday.holiday_type === "Public";

  const typeStyles = {
    Public: "bg-blue-100 text-blue-600",
    Company: "bg-purple-100 text-purple-600",
    Religious: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-red-50/30 transition-all bg-white shadow-sm mb-2">
      <div className="flex items-center gap-4">
        {/* Date Square - The "Calendar" Look */}
        <div className="w-14 h-14 bg-red-100 rounded-xl flex flex-col items-center justify-center border border-red-200">
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
            {dateObj.toLocaleString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-semibold text-red-600 leading-none">
            {dateObj.getDate()}
          </span>
        </div>

        {/* Holiday Info */}
        <div>
          <div className="flex items-center gap-2">
            <p className=" text-gray-900">{holiday.holiday_name}</p>
            {/* Dynamic Type Badge */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                typeStyles[holiday.holiday_type] || typeStyles.Public
              }`}
            >
              {holiday.holiday_type}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {dateObj.toLocaleDateString("en-US", { weekday: "long" })}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center gap-1 ${isPublic ? "hidden" : ""}`}>
        {!isPublic ? (
          <button
            onClick={() => onDelete(holiday.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
            title="Delete Holiday"
          >
            <Icon icon="heroicons:trash" className="w-5 h-5" />
          </button>
        ) : (
          <div
            className="p-2 text-gray-300 cursor-not-allowed"
            title="Public holidays cannot be deleted"
          >
            <Icon icon="heroicons:lock-closed" className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayCard;
