"use client";
import React, { use } from "react";
import {
  syncHolidays,
  deleteHoliday,
  getHolidays,
  addManualHoliday,
} from "@/app/lib/actions/holiday";
import { useState, useEffect } from "react";
import HolidayCard from "./HolidayCard";
import SettingCard from "../SettingCard";
import SearchBar from "../SearchBar";
import Selector from "../Selector";
import AddHolidayForm from "./AddHolidayForm";
import AttendanceSummary from "../AttendanceSummary";

type HolidayType = "Public" | "Company";

export default function HolidayContainer() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [holidays, setHolidays] = useState<any[]>([]); // State to store holidays
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newHoliday, setNewHoliday] = useState<{
    holiday_name: string;
    holiday_date: string;
    holiday_type: HolidayType;
  }>({
    holiday_name: "",
    holiday_date: "",
    holiday_type: "Company",
  });

  // 1. Filter holidays based on search query and type
  const filteredHolidays = React.useMemo(() => {
    return holidays.filter((holiday) => {
      const matchesSearch = holiday.holiday_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const matchesType = 
        filterStatus === "all" || 
        holiday.holiday_type === filterStatus;

      return matchesSearch && matchesType;
    });
  }, [holidays, searchQuery, filterStatus]);

  // 2. Group filtered holidays by Month and Year
  const groupedHolidays = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    filteredHolidays.forEach((holiday) => {
      const date = new Date(holiday.holiday_date);
      // Create a key like "November 2026"
      const monthYear = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(holiday);
    });

    return groups;
  }, [filteredHolidays]);

  // Calculate summary values based on the holidays state
  const totalHolidays = holidays.length;
  const publicHolidays = holidays.filter(
    (h) => h.holiday_type === "Public"
  ).length;
  const companyHolidays = holidays.filter(
    (h) => h.holiday_type === "Company"
  ).length;

  // 1. Load holidays from Supabase on start
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getHolidays();
    setHolidays(data || []);
    setLoading(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncHolidays();
    setIsSyncing(false);

    if (result.success) {
      alert(`Successfully synced ${result.year} holidays!`);
      loadData(); // Refresh the list after syncing
    } else {
      alert("Error: " + result.error);
    }
  };

  // 2. Define the Delete Action
  const handleDeleteAction = async (id: string) => {
    if (confirm("Are you sure you want to delete this holiday?")) {
      const result = await deleteHoliday(id);
      if (result.success) {
        loadData(); // Refresh list after delete
      } else {
        alert("Delete failed");
      }
    }
  };

  const handleAddHoliday = async () => {
    const result = await addManualHoliday(newHoliday);
    if (result.success) {
      setShowForm(false);
      loadData();
    } else {
      alert(result.error);
    }
  };

  if (loading) return <div className="p-4">Loading holidays...</div>;

  return (
    <div className="p-4">
      <SettingCard
        icon="iconamoon:clock"
        iconBgColor="bg-red-600"
        title="Holiday Management"
        description="Configure company holidays and special dates"
        headerColor="bg-red-100"
        btnIcon="material-symbols:add-rounded"
        btnText="Add Holiday"
        btnAction={() => setShowForm(true)}
      >
        <div className="flex flex-row gap-4 pb-4">
          <AttendanceSummary
            title="Total Holidays"
            value={totalHolidays}
            colorClass="bg-blue-100 text-blue-500"
          ></AttendanceSummary>
          <AttendanceSummary
            title="Total Public Holidays"
            value={publicHolidays}
            colorClass="bg-purple-100 text-purple-500"
          ></AttendanceSummary>
          <AttendanceSummary
            title="Total Company Holidays"
            value={companyHolidays}
            colorClass="bg-orange-100 text-orange-500"
          ></AttendanceSummary>
        </div>
        {showForm && (
          <AddHolidayForm
            newHoliday={newHoliday}
            setNewHoliday={setNewHoliday}
            onSubmit={handleAddHoliday}
            onCancel={() => setShowForm(false)}
          />
        )}
        <div className="mb-6 flex flex-row gap-4">
          <SearchBar 
            placeholder="Search holidays by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Selector
            options={[
              { label: "Public Holidays", value: "Public" },
              { label: "Company Holidays", value: "Company" },
            ]}
            placeholder="All Types"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="btn btn-sm rounded-lg bg-blue-600 text-white mb-6"
        >
          {isSyncing ? "Syncing..." : "Sync Official Holidays"}
        </button>

        {/* Wrap the entire list in a scrollable area */}
        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-8">
            {Object.keys(groupedHolidays).map((monthYear) => (
              <div key={monthYear} className="relative">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-3 mb-4 border-b border-gray-100 flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {monthYear}
                  </h3>
                  <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    {groupedHolidays[monthYear].length} holidays
                  </span>
                </div>

                {/* List of HolidayCards */}
                <div className="space-y-3 pb-4">
                  {groupedHolidays[monthYear].map((item) => (
                    <HolidayCard
                      key={item.id}
                      holiday={item}
                      onDelete={handleDeleteAction}
                    />
                  ))}
                </div>
              </div>
            ))}

            {holidays.length === 0 && (
              <p className="text-center text-gray-500 py-10">
                No holidays found.
              </p>
            )}
          </div>
        </div>
      </SettingCard>
    </div>
  );
}
