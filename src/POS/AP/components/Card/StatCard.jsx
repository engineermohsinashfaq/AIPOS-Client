import React from "react";
import { TrendingUp } from "@mui/icons-material";
import "../../../../CSS/StatCard.css";

const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
    <div className="flex items-center justify-between icon-text-shift">
      <div>
        <p className="text-white/90 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {change && (
          <p className="text-white/90 text-sm mt-1 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-2 rounded-md bg-gradient-to-r ${color}`}>
        <Icon className="text-white w-6 h-6" />
      </div>
    </div>
  </div>
);

export default StatCard;
