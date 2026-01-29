import React from 'react';

export const ProjectIcon = ({ color, size = "md" }) => {
    const sizeClass = size === "sm" ? "w-3 h-3" : (size === "lg" ? "w-10 h-10 md:w-12 md:h-12" : "w-4 h-4");
    const colors = {
        emerald: "bg-emerald-500",
        blue: "bg-blue-500",
        orange: "bg-orange-500",
        purple: "bg-purple-500",
        rose: "bg-rose-500"
    };
    return <div className={`rounded-xl ${colors[color] || colors.emerald} ${sizeClass} flex-shrink-0 shadow-sm transition-all duration-300`} />;
};
