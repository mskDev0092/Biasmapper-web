import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BiasGridProps {
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function BiasGrid({
  title,
  description,
  size = "md",
  interactive = false,
  children,
  className = "",
}: BiasGridProps) {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <Card
      className={`border-0 shadow-md hover:shadow-lg transition-shadow duration-300 ${interactive ? "cursor-pointer hover:scale-105 transform" : ""} ${className}`}
    >
      <CardContent className={sizeClasses[size]}>
        {title && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {description && (
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
