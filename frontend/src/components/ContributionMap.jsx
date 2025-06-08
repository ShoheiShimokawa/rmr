import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";
import { getPostRecord } from "../api/post";
import "./heatmap-custom.css";
import { generateFullDateRange, mergeActivityData } from "../util";
import { useEffect, useState, useCallback } from "react";

export const ContributionMap = ({ userId }) => {
  const [record, setRecord] = useState([]);
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 1);
  const baseDates = generateFullDateRange(startDate, today);
  const mergedData = mergeActivityData(baseDates, record);

  const find = useCallback(async () => {
    const result = await getPostRecord(userId && userId);
    setRecord(result.data);
  }, [userId]);

  useEffect(() => {
    find();
  }, [find]);

  return (
    <div>
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={mergedData}
        classForValue={(value) => {
          if (!value || value.posts === 0 || value.posts === null) {
            return "color-empty";
          }
          if (value.posts >= 5) return "color-scale-4";
          if (value.posts >= 3) return "color-scale-3";
          if (value.posts >= 2) return "color-scale-2";
          return "color-scale-1";
        }}
        tooltipDataAttrs={(value) => {
          return {
            "data-tooltip-id": "my-tooltip",
            "data-tooltip-html": `${
              value.posts ? value.posts + " contributions" : "No contributions"
            }<br /><div style="text-align:center; color: silver;">${
              value.date
            }</div>`,
          };
        }}
        showWeekdayLabels={true}
      />
      <Tooltip id="my-tooltip" />
    </div>
  );
};
