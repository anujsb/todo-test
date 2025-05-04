"use client";

import { useState } from "react";
import useSWR from "swr";
import { taskSchema } from "@/lib/validations";
import { z } from "zod";
import FlowSavvyCalendarView from "./FlowSavvyCalendarView";
import TaskFormDialog from "./TaskFormDialog";
import TaskDetailsDialog from "./TaskDetailsDialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TaskCalendar() {
  const { data, error, mutate } = useSWR("/api/tasks", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    dedupingInterval: 0, // Disable deduping to ensure fresh data
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<z.infer<typeof taskSchema> | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (error)
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg text-red-600">
        Failed to load tasks. Please try again later.
      </div>
    );

  if (!data)
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500">
        <div className="animate-pulse">Loading calendar...</div>
      </div>
    );

  const tasks = z.array(taskSchema).parse(data);

  const handleAddTask = (date: Date) => {
    setSelectedDate(date);
    setIsAddDialogOpen(true);
  };

  const handleViewTask = (task: z.infer<typeof taskSchema>) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  const handleEditTask = () => {
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleTaskSaved = async () => {
    // Force a revalidation of the data
    await mutate(undefined, {
      revalidate: true,
      rollbackOnError: true,
    });
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleTaskDeleted = async () => {
    // Force a revalidation of the data
    await mutate(undefined, {
      revalidate: true,
      rollbackOnError: true,
    });
    setIsViewDialogOpen(false);
  };

  return (
    <div>
      <FlowSavvyCalendarView
        tasks={tasks}
        onAddTask={handleAddTask}
        onViewTask={handleViewTask}
      />

      {/* Add Task Dialog */}
      {isAddDialogOpen && (
        <TaskFormDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={handleTaskSaved}
          defaultDate={selectedDate || undefined}
        />
      )}

      {/* View Task Dialog */}
      {isViewDialogOpen && selectedTask && (
        <TaskDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          task={selectedTask}
          onDelete={handleTaskDeleted}
          onEdit={handleEditTask}
        />
      )}

      {/* Edit Task Dialog */}
      {isEditDialogOpen && selectedTask && (
        <TaskFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleTaskSaved}
          task={selectedTask}
        />
      )}
    </div>
  );
}