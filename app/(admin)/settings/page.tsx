import React from "react";
import SettingCard from "@/app/components/SettingCard";
import NotificationContainer from "@/app/components/notification/NotificationContainer";
import ShiftContainer from "@/app/components/shift/ShiftContainer";
import HolidayContainer from "@/app/components/holiday/HolidayContainer";
type Props = {};

export default function page({}: Props) {
  return (
    <div>
      <NotificationContainer/>
      {/* <ShiftContainer/> */}
      <HolidayContainer/>
    </div>
  );
}

page;
