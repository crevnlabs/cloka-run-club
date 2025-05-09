"use client";

import React from "react";

interface EventLocalDateProps {
    date: string;
    className?: string;
}

const EventLocalDate: React.FC<EventLocalDateProps> = ({ date, className }) => {
    const d = new Date(date);
    // Fallback if date is invalid
    if (isNaN(d.getTime())) return <span className={className}>{date}</span>;
    return (
        <span className={className}>
            {d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })}
        </span>
    );
};

export default EventLocalDate; 