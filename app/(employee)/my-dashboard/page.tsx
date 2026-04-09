"use client";
import React from "react";
import { Icon } from "@iconify/react";

type Props = {};

export default function page({}: Props) {
  return (
    <div className="flex flex-row gap-6">
      {/* Left side */}
      <div className="flex flex-col gap-3 w-full">

        {/* this week status */}
        <div className="flex flex-col p-6 bg-blue-200 rounded-2xl">
          <h2>{current_date}</h2>
          <div>
            <p>This Week's Status</p>
            <div className="flex flex-row gap-3">
              <div className="bg-blue-100">
                {/* checked in day card in loop 6 cards */}
              </div>
            </div>
            {/* if check in exist / or attendance log exist */}
            <div className="flex flex-row gap-3">
              {/* check in card */}
              <div className="flex flex-col gap-2">
                <div><Icon icon=""></Icon>
                <p>Check-in</p>
                </div>
                <h2>{attendance_log.check_in_time}</h2>
              </div>
              
              {/* check out card */}
              <div className="flex flex-col gap-2">
                <div><Icon icon=""></Icon>
                <p>Check-out</p>
                </div>
                <h2>{attendance_log.check_out_time}</h2>
              </div>
            </div>
            {/* if attedance log not exist */}
            <div className="bg-red-100 flex flex-row gap-3">
              <div><Icon icon=""></Icon></div>
              <h3>Haven't checked in yet? Go now :D</h3>
            </div>
          </div>
        </div>

        {/* this month overview */}
        <div className="flex flex-col bg-purple-200 rounded-2xl">
          <div>
            <Icon icon={""}></Icon>
            <h2>This Month's Overview</h2>
          </div>

        </div>

        {/* recent requests */}
        <div></div>
      </div>
      {/* Right side */}
      <div className="flex flex-col gap-3 max-w-1/3">
        {/* quick actions */}
        <div></div>

        {/* my information */}
        <div></div>

        {/* upcoming leave */}
        <div></div>
      </div>
    </div>
  );
}
