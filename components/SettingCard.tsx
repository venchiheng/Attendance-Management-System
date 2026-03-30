import React from "react";
import { Icon } from "@iconify/react";

type Props = {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
  headerColor: string;
  iconBgColor: string;
  btnIcon?: string;
  btnText?: string;
  btnAction?: () => void;
  cardType? : 'standard' | 'notification'
};

function SettingCard({
  icon,
  title,
  description,
  children,
  headerColor,
  iconBgColor,
  btnIcon,
  btnText,
  cardType,
  btnAction
}: Props) {
  return (
    <div className="rounded-2xl pb-8 bg-white shadow-sm border border-gray-100 mb-6">
      {/* HEADER */}
      <div className={`flex flex-row gap-4 ${headerColor} items-center p-5 rounded-t-2xl`}>
        <div className="flex flex-row gap-4 items-center flex-1">
          <Icon
            icon={icon}
            className={`${iconBgColor} text-white w-10 h-10 p-2 rounded-lg`}
          />
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="text-gray-500 text-xs">{description}</p>
          </div>
        </div>

        {/* CONDITIONAL BUTTON */}
        {btnText && (
          <button className="btn btn-sm flex gap-2 items-center bg-blue-600 text-white px-4 py-2  rounded-lg" onClick={btnAction}>
            {btnIcon && <Icon icon={btnIcon} className="w-4 h-4" />}
            {btnText}
          </button>
        )}
      </div>

      <div className="p-8">{children}</div>

      {cardType == 'notification' && (
      <div className="pr-8 flex justify-end">
        <button className="btn btn-sm rounded-lg shadow-none text-white bg-blue-600">
          <Icon icon={"mynaui:save"}></Icon>
          Save Preferences
        </button>
      </div>
      )
}
    </div>
  );
}

export default SettingCard;
