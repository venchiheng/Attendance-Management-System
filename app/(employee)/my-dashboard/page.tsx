"use client";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AttendanceSummary from "@/app/components/AttendanceSummary";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";

type Props = {};

export default function page() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTodaySessions, setShowTodaySessions] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<
    Record<string, boolean>
  >({});

  const toggleExpandLog = (logId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const supabase = createClient();

  const fetchDashboard = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch("/api/homepage");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const channel = supabase
      .channel('homepage-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_log' },
        () => fetchDashboard(true) // Silent refresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_sessions' },
        () => fetchDashboard(true)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employee_requests' },
        () => fetchDashboard(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading)
    return <div className="p-6 md:p-10">Loading your dashboard...</div>;
  if (!dashboardData)
    return <div className="p-6 md:p-10">Unable to load dashboard data.</div>;

  const {
    employee,
    weeklyLogs,
    summary,
    recentRequests,
    upcomingLeave,
    startOfWeek,
  } = dashboardData;

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date().toISOString().split("T")[0];
  const todayLog = weeklyLogs?.find((l: any) => l.date === today);
  const todaySessions = [...(todayLog?.attendance_sessions || [])].sort(
    (a: any, b: any) =>
      new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
  );
  const baseDate = startOfWeek ? new Date(startOfWeek) : new Date();
  const isBaseDateValid = !isNaN(baseDate.getTime());

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getIconStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case "leave":
        return "uil:calendar";
      case "remote":
        return "uil:suitcase";
      case "emergency":
        return "mingcute:warning-line";
      default:
        return "mynaui:box-solid";
    }
  };

  const getTypeStype = (type: string) => {
    switch (type?.toLowerCase()) {
      case "leave":
        return "bg-red-100 text-red-700";
      case "remote":
        return "bg-blue-100 text-blue-700";
      case "emergency":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  return (
    /* MAIN CONTAINER: Changed to flex-col for mobile, flex-row for Desktop (lg) */
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT SIDE: Full width always, but content inside is responsive */}
      <div className="flex flex-col gap-6 md:gap-8 w-full">
        {/* THIS WEEK STATUS */}
        <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-blue-100 p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
          </div>

          <div className="p-6">
            <p className="font-medium text-gray-500 mb-3">This Week's Status</p>
            <div className="flex flex-row gap-3 mb-6 overflow-x-auto pb-2">
              {isBaseDateValid &&
                weekDays.map((dayName, idx) => {
                  // 1. Calculate the date for this specific slot (Mon, Tue, etc.)
                  const dateObj = new Date(baseDate);
                  dateObj.setDate(dateObj.getDate() + idx);

                  // 2. Format to YYYY-MM-DD for local comparison (avoiding UTC shift)
                  const year = dateObj.getFullYear();
                  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
                  const day = String(dateObj.getDate()).padStart(2, "0");
                  const dateStr = `${year}-${month}-${day}`;

                  // 3. Find if a log exists for this specific day
                  const log = weeklyLogs?.find((l: any) => l.date === dateStr);

                  // 4. Identify if this card is today
                  const todayStr = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Phnom_Penh",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(new Date());

                  const isToday = todayStr === dateStr;

                  return (
                    <div
                      key={dayName}
                      className={`p-4 w-fit flex rounded-xl min-w-24 md:w-full flex-col items-center gap-1 border-2 transition-all
                      ${
                        log
                          ? "bg-blue-50 border-blue-500 shadow-sm"
                          : "bg-white border-gray-100 opacity-60"
                      } 
                      ${
                        isToday
                          ? "ring-1 ring-green-500 border-green-500 bg-green-50"
                          : ""
                      }`}
                    >
                      <p className="text-sm font-bold text-gray-700">
                        {dayName.slice(0, 3)}
                      </p>
                      <p className="text-[10px] text-gray-400 mb-1">
                        {dateObj.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>

                      <div className="my-1">
                        {log ? (
                          /* If logged, background is green if today, otherwise blue */
                          <div
                            className={`${
                              isToday ? "bg-green-500" : "bg-blue-500"
                            } rounded-full p-1 shadow-sm transition-colors`}
                          >
                            <Icon
                              icon="prime:check-circle"
                              className="text-white w-5 h-5"
                            />
                          </div>
                        ) : (
                          /* If not logged, border and text are green if today, otherwise gray */
                          <div
                            className={`border-2 border-dashed rounded-full w-7 h-7 flex items-center justify-center transition-colors 
                            ${
                              isToday ? "border-green-500" : "border-gray-200"
                            }`}
                          >
                            <span
                              className={`${
                                isToday
                                  ? "text-green-500 font-bold"
                                  : "text-gray-300"
                              } text-[10px]`}
                            >
                              —
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs font-bold mt-1 text-gray-800">
                        {log?.worked_minutes && log.worked_minutes > 0
                          ? `${Math.floor(log.worked_minutes / 60)}h ${
                              log.worked_minutes % 60
                            }m`
                          : log?.total_hours && log.total_hours !== "0"
                          ? `${Math.floor(
                              parseFloat(log.total_hours)
                            )}h ${Math.round(
                              (parseFloat(log.total_hours) % 1) * 60
                            )}m`
                          : "—"}
                      </p>

                      <p className="text-[10px] text-gray-400 font-medium">
                        {log?.first_check_in || "—"}
                      </p>
                    </div>
                  );
                })}
            </div>

            {todayLog ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-4">
                  <div className="flex-1 p-4 bg-green-100 border border-green-500 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-green-500">
                      <Icon
                        icon="mdi:clock-check-outline"
                        className="w-5 h-5"
                      />
                      <p className="text-sm font-medium">Check-in</p>
                    </div>
                    <h2 className="text-2xl font-bold">
                      {todayLog.check_in_time || "--:--"}
                    </h2>
                  </div>

                  <div className="flex-1 p-4 bg-yellow-50 border border-yellow-500 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Icon
                        icon="mdi:clock-export-outline"
                        className="w-5 h-5"
                      />
                      <p className="text-sm font-medium">Check-out</p>
                    </div>
                    <h2 className="text-2xl font-bold">
                      {todayLog.check_out_time || "--:--"}
                    </h2>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowTodaySessions((prev) => !prev)}
                    className="btn btn-sm bg-black text-white hover:bg-gray-800 border-none"
                  >
                    <Icon
                      icon={
                        showTodaySessions
                          ? "mdi:chevron-up"
                          : "mdi:chevron-down"
                      }
                      className="w-4 h-4"
                    />
                    {showTodaySessions
                      ? "Hide Today's Log"
                      : "Expand Today's Log"}
                  </button>
                </div>

                {showTodaySessions && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-800">
                        Today's Attendance Sessions
                      </h3>
                      <p className="text-sm text-gray-500">
                        {todaySessions.length} session(s) recorded today
                      </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                      <table className="table w-full">
                        <thead className="bg-gray-50 text-xs text-gray-500">
                          <tr>
                            <th>#</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Duration</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todaySessions.length > 0 ? (
                            todaySessions.map((session: any, index: number) => (
                              <tr key={session.id}>
                                <td>{index + 1}</td>
                                <td>{formatSessionTime(session.check_in)}</td>
                                <td>{formatSessionTime(session.check_out)}</td>
                                <td>
                                  {formatMinutes(session.session_minutes)}
                                </td>
                                <td>
                                  {session.check_out ? (
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                      Closed
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                      Open
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="text-center py-4 text-gray-500"
                              >
                                No session details found for today.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-100 p-4 rounded-xl flex items-center gap-3 border border-red-200">
                <div className="p-2 bg-red-100 rounded-full">
                  <Icon
                    icon="material-symbols:door-open"
                    className="text-red-600 w-6 h-6"
                  />
                </div>
                <h3 className="font-semibold text-red-600">
                  Haven't checked in yet? Do it now! :D
                </h3>
              </div>
            )}
          </div>
        </div>

        {/* THIS MONTH OVERVIEW: Changed to Grid for better mobile fit */}
        <div className="flex flex-col p-4 md:p-6 gap-4 bg-white shadow-sm rounded-2xl border border-gray-50">
          <div className="flex flex-row gap-3 items-center">
            <div className="p-2 md:p-3 bg-purple-100 rounded-lg text-purple-700">
              <Icon
                icon="entypo:line-graph"
                className="w-5 h-5 md:w-6 md:h-6"
              />
            </div>
            <h2 className="font-bold text-lg md:text-xl">
              This Month's Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AttendanceSummary
              title="Present"
              value={summary.present.toString()}
              colorClass="text-green-600"
            />
            <AttendanceSummary
              title="Leave"
              value={summary.leave.toString()}
              colorClass="text-red-600"
            />
            <AttendanceSummary
              title="Remote"
              value={summary.remote.toString()}
              colorClass="text-blue-600"
            />
            <AttendanceSummary
              title="Rate"
              value={`${Math.round(
                (summary.present / summary.totalWorkDays) * 100
              )}%`}
              colorClass="text-purple-600"
            />
          </div>
          <div className="flex flex-row justify-between items-center bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-gray-500 text-xs md:text-sm uppercase font-semibold">
                Total Work Days
              </p>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {summary.totalWorkDays} days
              </h2>
            </div>
            <Link
              href="/my-attendance"
              className="bg-white px-4 py-2 rounded-lg border border-purple-200 text-purple-600 font-bold text-xs md:text-sm hover:bg-purple-50 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* RECENT REQUESTS */}
        <div className="flex flex-col p-4 md:p-6 rounded-2xl bg-white shadow-sm border border-gray-50">
          <div className="flex flex-row justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Icon icon="mdi:history" className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="font-bold text-lg md:text-xl">Recent Requests</h2>
            </div>
            <Link
              href="/my-requests"
              className="text-xs md:text-sm font-bold text-amber-600 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentRequests?.map((req: any) => (
              <div
                key={req.id}
                className="flex flex-row justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-row items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTypeStype(req.type)}`}>
                    <Icon
                      icon={getIconStyle(req.type)}
                      className="w-5 h-5 md:w-6 md:h-6"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-xs md:text-sm">{req.type}</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full capitalize font-semibold text-[10px] md:text-xs ${getStatusStyle(
                    req.status
                  )}`}
                >
                  {req.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Full width on mobile, 1/3 width on Desktop (lg) */}
      <div className="flex flex-col gap-6 w-full lg:w-[400px] shrink-0">
        {/* QUICK ACTIONS */}
        <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-gray-50 overflow-hidden">
          <div className="bg-purple-100 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-purple-900">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 p-4 md:p-6">
            <QuickActionLink
              href="/submit-request?type=leave"
              color="red"
              icon="uil:calendar"
              label="Request Leave"
            />
            <QuickActionLink
              href="/submit-request?type=remote"
              color="blue"
              icon="uil:suitcase"
              label="Remote Work"
            />
            <QuickActionLink
              href="/submit-request?type=emergency"
              color="amber"
              icon="mingcute:warning-line"
              label="Emergency Request"
            />
            <QuickActionLink
              href="/submit-request?type=general"
              color="purple"
              icon="basil:document-outline"
              label="General Request"
            />
          </div>
        </div>

        {/* MY INFORMATION */}
        <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-gray-50 overflow-hidden">
          <div className="bg-blue-50 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-blue-900">
              My Information
            </h2>
          </div>
          <div className="flex flex-col gap-4 p-4 md:p-6">
            <InfoItem
              label="Employee ID"
              value={employee.employee_code || "--"}
            />
            <InfoItem label="Position" value={employee.position} />
            <InfoItem label="Department" value={employee.department_name} />
            <Link
              href="/my-profile"
              className="mt-2 p-3 bg-blue-600 text-white rounded-xl text-center text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
            >
              View Full Profile
            </Link>
          </div>
        </div>

        {/* UPCOMING LEAVE */}
        <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-gray-50 overflow-hidden">
          <div className="bg-green-50 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-green-900">
              Upcoming Schedule
            </h2>
          </div>
          <div className="p-4 md:p-6 flex flex-col gap-3">
            {upcomingLeave?.length > 0 ? (
              upcomingLeave.map((leave: any) => {
                const isRemote = leave.type?.toLowerCase() === "remote";
                return (
                  <div
                    key={leave.id}
                    className="flex flex-row gap-3 justify-between items-stretch"
                  >
                    <div
                      className={`flex flex-col gap-1 p-3 rounded-xl flex-1 border ${
                        isRemote
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <h3 className="text-[10px] uppercase font-bold tracking-wider">
                        {leave.type}
                      </h3>
                      <p className="text-xs font-semibold">
                        {leave.start_date
                          ? new Date(leave.start_date).toLocaleDateString()
                          : "N/A"}
                        {leave.end_date &&
                          leave.end_date !== leave.start_date &&
                          ` - ${new Date(leave.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div
                      className={`px-3 flex items-center justify-center text-xs font-black rounded-xl border-2 ${
                        isRemote
                          ? "bg-white border-blue-200 text-blue-700 font-medium"
                          : "bg-white border-red-200 text-red-700"
                      }`}
                    >
                      {leave.duration_days || 1}d
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-4">
                No upcoming leaves scheduled.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper components to keep the main return clean
const QuickActionLink = ({ href, color, icon, label }: any) => {
  const colors: any = {
    red: "text-red-600 border-red-200 hover:bg-red-600 font-medium",
    blue: "text-blue-600 border-blue-200 hover:bg-blue-600 font-medium",
    amber: "text-amber-600 border-amber-200 hover:bg-amber-600 font-medium",
    purple: "text-purple-600 border-purple-200 hover:bg-purple-600 font-medium",
  };
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 bg-white rounded-xl border-2 font-bold text-sm transition-all hover:text-white hover:shadow-md ${colors[color]}`}
    >
      <Icon icon={icon} className="w-5 h-5" />
      {label}
    </Link>
  );
};

const InfoItem = ({ label, value }: any) => (
  <div className="flex flex-col">
    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
      {label}
    </p>
    <h3 className="text-gray-800 font-semibold">{value}</h3>
  </div>
);

const formatSessionTime = (value?: string | null) => {
  if (!value) return "--:--";

  return new Date(value).toLocaleTimeString("en-US", {
    timeZone: "Asia/Phnom_Penh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatMinutes = (minutes?: number) => {
  if (!minutes || minutes <= 0) return "0m";
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
