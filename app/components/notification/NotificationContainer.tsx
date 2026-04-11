import React from "react";
import SettingCard from "../SettingCard";
import NotificationCard from "./NotificationCard";

type Props = {
  employeeId?: string;
  employeeEmail?: string;
  telegramChatId?: string;
};

const NotificationContainer = ({telegramChatId }: Props) => {
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
            <NotificationCard
              key={telegramChatId || "empty"}
              title="Connect with Telegram Bot"
              description="Notify when employee send requests"
              initialChatId={telegramChatId}
            />
        </div>
      </SettingCard>
    </div>
  );
};

export default NotificationContainer;
