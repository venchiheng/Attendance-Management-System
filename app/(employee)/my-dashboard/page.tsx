"use client";
import React from "react";
import { Icon } from "@iconify/react";
import AttendanceSummary from "@/app/components/AttendanceSummary";
import Link from "next/link";

type Props = {};

export default function page({}: Props) {
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/homepage");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) return <div className="p-10">Loading your dashboard...</div>;
  if (!dashboardData)
    return <div className="p-10">Unable to load dashboard data.</div>;

  const {
    employee,
    weeklyLogs,
    summary,
    recentRequests,
    upcomingLeave,
    startOfWeek,
  } = dashboardData;

  // Generate 6 days from the start of the week
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

  // Pre-calculate base date for the week to ensure validity
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
    <div className="flex flex-row gap-6">
      {/* Left side */}
      <div className="flex flex-col gap-8 w-full">
        {/* this week status */}
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
                      className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-1 border-2 transition-all
        ${
          log
            ? "bg-blue-50 border-blue-500 shadow-sm"
            : "bg-white border-gray-100 opacity-60"
        } 
        ${isToday ? "ring-1 ring-green-500 border-green-500 bg-green-50" : ""}`}
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
                        {log?.check_in_time || "—"}
                      </p>
                    </div>
                  );
                })}
            </div>

            {todayLog ? (
              <div className="flex flex-row gap-4">
                <div className="flex-1 p-4 bg-green-100 border border-green-500 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-green-500">
                    <Icon icon="mdi:clock-check-outline" className="w-5 h-5" />
                    <p className="text-sm font-medium">Check-in</p>
                  </div>
                  <h2 className="text-2xl font-bold">
                    {todayLog.check_in_time}
                  </h2>
                </div>
                <div className="flex-1 p-4 bg-yellow-50 border border-yellow-500 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Icon icon="mdi:clock-export-outline" className="w-5 h-5" />
                    <p className="text-sm font-medium">Check-out</p>
                  </div>
                  <h2 className="text-2xl font-bold">
                    {todayLog.check_out_time || "--:--"}
                  </h2>
                </div>
              </div>
            ) : (
              <div className="bg-red-100 p-4 rounded-xl flex items-center gap-3 border border-red-200">
                <div className="p-2 bg-red-200 rounded-full">
                  <Icon
                    icon="material-symbols:door-open"
                    className="text-red-700 w-6 h-6"
                  />
                </div>
                <h3 className="font-bold text-red-800">
                  Haven't checked in yet? Go now :D
                </h3>
                <Link
                  href="/attendance"
                  className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Check-in
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* this month overview */}
        <div className="flex flex-col p-6 gap-4 bg-white shadow-sm rounded-2xl">
          <div className="flex flex-row gap-3 items-center">
            <div className="p-3 bg-purple-200 rounded-lg text-purple-700">
              <Icon icon={"entypo:line-graph"} className="w-6 h-6"></Icon>
            </div>
            <h2 className="font-bold text-xl">This Month's Overview</h2>
          </div>
          <div className="flex flex-row gap-3">
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
          <div className="flex flex-row justify-between items-center bg-gray-100 p-4 rounded-xl">
            <div>
              <p className="text-gray-600 text-sm">Total Work Days</p>
              <h2 className="text-xl font-semibold">
                {summary.totalWorkDays} days
              </h2>
            </div>
            <Link
              href="/my-attendance"
              className="text-purple-600 font-bold text-sm hover:underline"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* recent requests */}
        <div className="flex flex-col p-6 rounded-2xl bg-white shadow-sm">
          {/* header */}
          <div className="flex flex-row justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                <Icon icon="mdi:history" className="w-6 h-6"></Icon>
              </div>
              <h2 className="font-bold text-xl">Recent Requests</h2>
            </div>
            <div className="flex flex-row gap-3">
              <Link
                href="/my-requests"
                className="text-sm font-bold text-amber-600 hover:underline"
              >
                View All
              </Link>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-col gap-3">
            {recentRequests?.map((req: any) => (
              <div
                key={req.id}
                className="flex flex-row justify-between items-center bg-white p-3 border border-gray-200 rounded-xl"
              >
                <div className="flex flex-row items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTypeStype(req.type)}`}>
                    <Icon
                      icon={`${getIconStyle(req.type)}`}
                      className={` w-6 h-6`}
                    ></Icon>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-sm">{req.type}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full capitalize font-medium text-xs ${getStatusStyle(
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

      {/* Right side */}
      <div className="flex flex-col gap-3 w-1/2">
        {/* quick actions */}
        <div className="flex flex-col rounded-xl bg-white shadow-sm">
          <div className="bg-purple-100 p-6 rounded-t-xl">
            <h2 className="text-xl font-bold">Quick Actions</h2>
          </div>
          {/* each button click to each selector type in /submit-requests page */}
          <div className="flex flex-col gap-3 p-6">
            <Link
              href="/submit-request?type=leave"
              className="flex items-center gap-3 p-3 bg-white rounded-xl border text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              <Icon icon="uil:calendar" />
              Request Leave
            </Link>
            <Link
              href="/submit-request?type=remote"
              className="flex items-center gap-3 p-3 bg-white rounded-xl border text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
            >
              <Icon icon="uil:suitcase" />
              Remote Work
            </Link>
            <Link
              href="/submit-request?type=emergency"
              className="flex items-center gap-3 p-3 bg-white rounded-xl border text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white"
            >
              <Icon icon="mingcute:warning-line" />
              Emergency Request
            </Link>
            <Link
              href="/submit-request?type=general"
              className="flex items-center gap-3 p-3 bg-white rounded-xl border text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
            >
              <Icon icon="basil:document-outline" />
              General Request
            </Link>
          </div>
        </div>

        {/* my information */}
        <div className="flex flex-col rounded-xl bg-white shadow-sm">
          <div className="bg-blue-100 p-6 rounded-t-xl">
            <h2 className="text-xl font-bold">My information</h2>
          </div>
          <div className="flex flex-col gap-3 p-6">
            <div className="flex flex-col gap-2">
              <p className="text-gray-500">Employee ID</p>
              <h3>{employee.employee_code || "--"} </h3>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-gray-500">Position</p>
              <h3>{employee.position}</h3>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-gray-500">Department</p>
              <h3>{employee.department_name}</h3>
            </div>
            <Link
              href="/profile"
              className="mt-4 p-3 bg-blue-600 text-white rounded-xl text-center text-sm font-semibold hover:underline"
            >
              View Full Profile
            </Link>
          </div>
        </div>

        {/* upcoming leave */}
        <div className="flex flex-col rounded-xl bg-white shadow-sm">
          <div className="bg-green-100 p-6 rounded-t-xl">
            <h2 className="text-xl font-bold">Upcoming Leave and Remote</h2>
          </div>
          <div className="p-6 flex flex-col gap-3">
            {upcomingLeave?.length > 0 ? (
              upcomingLeave.map((leave: any) => {
                const isRemote = leave.type?.toLowerCase() === "remote";

                return (
                  <div
                    key={leave.id}
                    className="flex flex-row gap-4 justify-between items-center"
                  >
                    {/* Main Card */}
                    <div
                      className={`flex flex-col gap-1 p-3 rounded-xl w-full border ${
                        isRemote
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-red-50 border-red-500 text-red-700"
                      }`}
                    >
                      <h3 className="text-xs font-medium capitalize">
                        {leave.type} Request
                      </h3>
                      <p
                        className={`text-[10px] ${
                          isRemote ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {leave.start_date
                          ? new Date(leave.start_date).toLocaleDateString()
                          : "N/A"}
                        {leave.end_date &&
                        leave.end_date !== leave.start_date ? (
                          <>
                            {" "}
                            - {new Date(leave.end_date).toLocaleDateString()}
                          </>
                        ) : null}
                      </p>
                    </div>

                    {/* Duration Badge */}
                    <div
                      className={`p-3 text-xs font-bold rounded-xl h-fit min-w-[45px] text-center ${
                        isRemote
                          ? "bg-blue-200 text-blue-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {leave.duration_days || 1}d
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 italic">
                No leaves or remote scheduled for this week.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
