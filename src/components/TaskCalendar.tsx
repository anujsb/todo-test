// 'use client';

// import { useState } from 'react';
// import useSWR from 'swr';
// import { Calendar } from '@/components/ui/calendar';
// import { taskSchema } from '@/lib/validations';
// import { z } from 'zod';
// import { format, isSameDay } from 'date-fns';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import TaskEditForm from './TaskEditForm';
// import { Button } from '@/components/ui/button';

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// export default function TaskCalendar() {
//   const { data, error, mutate } = useSWR('/api/tasks', fetcher);
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

//   if (error) return <div>Failed to load tasks</div>;
//   if (!data) return <div>Loading...</div>;

//   const tasks = z.array(taskSchema).parse(data);

//   // Filter tasks for the selected date
//   const tasksForSelectedDate = tasks.filter((task) =>
//     task.dueDate && selectedDate ? isSameDay(new Date(task.dueDate), selectedDate) : false
//   );

//   const handleDelete = async (id: number) => {
//     await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
//     mutate();
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <Calendar
//           mode="single"
//           selected={selectedDate}
//           onSelect={setSelectedDate}
//           className="rounded-md border"
//           modifiers={{
//             hasTasks: (date) =>
//               tasks.some((task) => task.dueDate && isSameDay(new Date(task.dueDate), date)),
//           }}
//           modifiersStyles={{
//             hasTasks: { backgroundColor: '#e0f7fa', color: '#007bff' }, // Highlight days with tasks
//           }}
//         />
//       </div>
//       <div>
//         <h2 className="text-xl font-semibold mb-4">
//           Tasks for {selectedDate ? format(selectedDate, 'PPP') : 'No Date Selected'}
//         </h2>
//         {tasksForSelectedDate.length > 0 ? (
//           <ul className="space-y-4">
//             {tasksForSelectedDate.map((task) => (
//               <Card key={task.id}>
//                 <CardHeader>
//                   <CardTitle>{task.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p>{task.description || 'No description'}</p>
//                   <p>Duration: {task.duration ? `${task.duration} minutes` : 'Not specified'}</p>
//                   <p>Status: {task.status}</p>
//                   <div className="flex space-x-2 mt-2">
//                     <TaskEditForm task={task} />
//                     <Button variant="destructive" onClick={() => handleDelete(task.id)}>
//                       Delete
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </ul>
//         ) : (
//           <p>No tasks for this date.</p>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import useSWR from "swr";
import { taskSchema } from "@/lib/validations";
import { z } from "zod";
import CalendarView from "@/components/CalendarView";
import TaskFormDialog from "./TaskFormDialog";
import TaskDetailsDialog from "./TaskDetailsDialog";
import FlowSavvyCalendarView from "./FlowSavvyCalendarView";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TaskCalendar() {
  const { data, error, mutate } = useSWR("/api/tasks", fetcher);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<z.infer<
    typeof taskSchema
  > | null>(null);
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

  const handleTaskSaved = () => {
    mutate(); // Refresh the tasks data
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleTaskDeleted = () => {
    mutate(); // Refresh the tasks data
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