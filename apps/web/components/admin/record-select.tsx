"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RecordSelectProps = {
  id: string;
  value: string;
  options: string[];
  endpoint: string;
  field?: string;
};

export function RecordSelect({ id, value, options, endpoint, field = "status" }: RecordSelectProps) {
  const router = useRouter();
  const [currentValue, setCurrentValue] = useState(value);
  const [savedValue, setSavedValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(nextValue: string) {
    setCurrentValue(nextValue);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: nextValue }),
      });

      if (!response.ok) {
        setCurrentValue(savedValue);
        setError("Update failed");
        return;
      }

      setSavedValue(nextValue);
      router.refresh();
    } catch {
      setCurrentValue(savedValue);
      setError("Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        disabled={loading}
        onChange={(event) => void handleChange(event.target.value)}
        value={currentValue}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p className={`text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}>
        {error || (loading ? "Saving..." : "Editable")}
      </p>
    </div>
  );
}
