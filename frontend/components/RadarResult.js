import React from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from "recharts";

const RadarResult = ({ data }) => {
  return (
    <div className="w-full flex justify-center">
      <RadarChart
        cx={200}
        cy={200}
        outerRadius={150}
        width={400}
        height={400}
        data={data}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Legend />
      </RadarChart>
    </div>
  );
};

export default RadarResult;
