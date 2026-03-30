import React from "react";
import SettingCard from "../SettingCard";
import ShiftCard from "./ShiftCard";
import AddShiftForm from "./AddShiftForm";

type Props = {};

const ShiftContainer = (props: Props) => {
  return (
    <div>
      <SettingCard
        icon="iconamoon:clock"
        iconBgColor="bg-purple-600"
        title="Shift Management"
        description="Configure work shifts and schedules"
        headerColor="bg-purple-100"
        btnIcon="material-symbols:add-rounded"
        btnText="Add Shift"
      >
        <div className="flex flex-col gap-4">
          <AddShiftForm/>
          <ShiftCard
            isDefault={true}
            shiftTitle="Standard Shift"
            shiftDetail="9:00 AM - 6:00 PM"
            days_of_week={[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ]}
          />
          <ShiftCard
            isDefault={false}
            shiftTitle="Standard Shift"
            shiftDetail="9:00 AM - 6:00 PM"
            days_of_week={[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ]}
          />
        </div>
      </SettingCard>
    </div>
  );
};

export default ShiftContainer;
