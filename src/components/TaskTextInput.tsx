"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TaskTextInput() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // New loading state
  const { mutate } = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter a task");
      return;
    }

    setLoading(true); // Set loading to true when the request starts
    try {
      const response = await fetch("/api/tasks/create-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      setText("");
      setError(null);

      // Trigger revalidation of the `/api/tasks` endpoint
      mutate("/api/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false); // Set loading to false when the request finishes
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Write a report by tomorrow"
        />
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Please wait..." : "Add Task with AI"}
      </Button>
    </form>
  );
}