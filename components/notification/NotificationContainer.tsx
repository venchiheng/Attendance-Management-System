import React from "react";
import SettingCard from "../SettingCard";
import NotificationCard from "./NotificationCard";

type Props = {};

const NotificationContainer = (props: Props) => {
  return (
    <div>
      <SettingCard
        icon="hugeicons:notification-01"
        iconBgColor="bg-blue-600"
        title="Notification Preferences"
        description="Configure which notifications you want to receive"
        headerColor="bg-blue-100"
        cardType="notification"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-row md:flex-row w-full gap-4">
            <NotificationCard
              title="Check-in Reminder"
              description="Notify when employee check in"
            ></NotificationCard>
            <NotificationCard
              title="Check-out Reminder"
              description="Notify when employee check out"
            ></NotificationCard>
          </div>
          <div className="flex flex-row md:flex-row w-full gap-4">
            <NotificationCard
              title="Daily reports"
              description="Recieve daily attendance reports"
            ></NotificationCard>
            <NotificationCard
              title="Weekly reports"
              description="Recieve daily attendance reports"
            ></NotificationCard>
          </div>
          <div className="flex flex-row md:flex-row w-full gap-4">
            <NotificationCard
              title="Employee Absence"
              description="Notify on employee absences"
            ></NotificationCard>
          </div>
        </div>
      </SettingCard>
    </div>
  );
};

export default NotificationContainer;
