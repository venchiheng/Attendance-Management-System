import React from "react";
import SettingCard from "@/components/SettingCard";
import NotificationContainer from "@/components/notification/NotificationContainer";
import ShiftContainer from "@/components/shift/ShiftContainer";
import HolidayContainer from "@/components/holiday/HolidayContainer";
type Props = {};

export default function page({}: Props) {
  return (
    <div>
      <NotificationContainer/>
      <ShiftContainer/>
      <HolidayContainer/>
    </div>
  );
}
page;
