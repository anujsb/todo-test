'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, addMonths, subMonths, parseISO, startOfWeek, endOfWeek,
  addYears, subYears, startOfYear, endOfYear, eachMonthOfInterval, eachWeekOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Grid, Calendar, CalendarDays } from 'lucide-react';
import { taskSchema } from '@/lib/validations';
import { z } from 'zod';
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Task = z.infer<typeof taskSchema>;
type CalendarView = 'week' | 'month' | 'year';

interface CalendarViewProps {
  tasks: Task[];
  onAddTask?: (date: Date) => void;
  onViewTask?: (task: Task) => void;
}

export default function FlowSavvyCalendarView({ tasks, onAddTask, onViewTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<CalendarView>('month');

  const handlePrevious = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'year') setCurrentDate(subYears(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'year') setCurrentDate(addYears(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTask = (date: Date) => {
    if (onAddTask) {
      onAddTask(date);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      // Cycle through statuses: pending -> in_progress -> completed -> pending
      let newStatus: "pending" | "in_progress" | "completed";
      if (task.status === "pending") {
        newStatus = "in_progress";
      } else if (task.status === "in_progress") {
        newStatus = "completed";
      } else {
        newStatus = "pending";
      }

      const updatedTask = { ...task, status: newStatus };

      await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      // The parent component will handle the data refresh through SWR
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate, 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  const getStatusCounts = (dateKey: string) => {
    const dateTasks = tasksByDate[dateKey] || [];
    const counts = {
      pending: 0,
      in_progress: 0,
      completed: 0
    };
    
    dateTasks.forEach(task => {
      if (task.status === 'pending') counts.pending++;
      else if (task.status === 'in_progress') counts.in_progress++;
      else if (task.status === 'completed') counts.completed++;
    });
    
    return counts;
  };

  // Update the task status display in the calendar cells
  const getTaskStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 line-through";
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Update the task status display in the selected date section
  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-grid">
        <div className="grid grid-cols-7 text-center border-b">
          {weekdays.map(day => (
            <div key={day} className="py-3 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {daysInMonth.map((day, dayIdx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] || [];
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const statusCounts = getStatusCounts(dateKey);
            
            return (
              <div
                key={dayIdx}
                className={`min-h-24 border-b border-r p-2 transition-colors ${
                  !isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''} ${
                  isSelected ? 'bg-blue-100' : ''
                } hover:bg-gray-50 cursor-pointer`}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600 bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <button 
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTask(day);
                    }}
                    aria-label="Add task"
                  >
                    <Plus size={16} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="mt-3 space-y-1.5">
                  {dayTasks.slice(0, 3).map((task: Task) => (
                    <div
                      key={task.id}
                      className={`px-2 py-1.5 rounded-md text-xs truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center ${getTaskStatusClass(task.status)}`}
                    >
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="mr-2"
                      />
                      <span
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewTask) onViewTask(task);
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2 font-medium">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
                
                {(statusCounts.pending > 0 || statusCounts.in_progress > 0 || statusCounts.completed > 0) && (
                  <div className="mt-2 flex space-x-1.5 items-center">
                    {statusCounts.pending > 0 && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                        <span className="text-xs text-gray-600">{statusCounts.pending}</span>
                      </div>
                    )}
                    {statusCounts.in_progress > 0 && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                        <span className="text-xs text-gray-600">{statusCounts.in_progress}</span>
                      </div>
                    )}
                    {statusCounts.completed > 0 && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                        <span className="text-xs text-gray-600">{statusCounts.completed}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-grid">
        <div className="grid grid-cols-7 text-center border-b">
          {weekdays.map(day => (
            <div key={day} className="py-3 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {daysInWeek.map((day, dayIdx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] || [];
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            
            return (
              <div
                key={dayIdx}
                className={`min-h-32 border-b border-r p-2 transition-colors ${
                  isToday(day) ? 'bg-blue-50' : ''
                } ${isSelected ? 'bg-blue-100' : ''} hover:bg-gray-50 cursor-pointer`}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600 bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <button 
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTask(day);
                    }}
                    aria-label="Add task"
                  >
                    <Plus size={16} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="mt-3 space-y-2">
                  {dayTasks.map((task: Task) => (
                    <div
                      key={task.id}
                      className={`px-2 py-1.5 rounded-md text-xs truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center ${getTaskStatusClass(task.status)}`}
                    >
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="mr-2"
                      />
                      <span
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewTask) onViewTask(task);
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-4 gap-4 p-4">
        {months.map((month, monthIdx) => {
          const monthTasks = tasks.filter((task: Task) => {
            if (!task.dueDate) return false;
            const taskDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
            return isSameMonth(taskDate, month);
          });

          const statusCounts = {
            pending: monthTasks.filter((t: Task) => t.status === 'pending').length,
            in_progress: monthTasks.filter((t: Task) => t.status === 'in_progress').length,
            completed: monthTasks.filter((t: Task) => t.status === 'completed').length
          };

          return (
            <div
              key={monthIdx}
              className={`p-4 rounded-lg border transition-colors ${
                isSameMonth(month, new Date()) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              } ${isSameMonth(month, selectedDate || new Date()) ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => {
                setCurrentDate(month);
                setView('month');
              }}
            >
              <div className="text-lg font-medium text-gray-800 mb-2">
                {format(month, 'MMMM')}
              </div>
              <div className="space-y-2">
                {monthTasks.slice(0, 3).map((task: Task) => (
                  <div
                    key={task.id}
                    className={`px-2 py-1 rounded text-xs truncate ${getTaskStatusClass(task.status)}`}
                  >
                    {task.title}
                  </div>
                ))}
                {monthTasks.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{monthTasks.length - 3} more tasks
                  </div>
                )}
              </div>
              <div className="mt-2 flex space-x-2">
                {statusCounts.pending > 0 && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                    <span className="text-xs text-gray-600">{statusCounts.pending}</span>
                  </div>
                )}
                {statusCounts.in_progress > 0 && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                    <span className="text-xs text-gray-600">{statusCounts.in_progress}</span>
                  </div>
                )}
                {statusCounts.completed > 0 && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs text-gray-600">{statusCounts.completed}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-5 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-medium text-gray-800">
            {view === 'year' ? format(currentDate, 'yyyy') :
             view === 'month' ? format(currentDate, 'MMMM yyyy') :
             `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
          </h2>
          <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)}>
            <TabsList>
              <TabsTrigger value="week" className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Month
              </TabsTrigger>
              <TabsTrigger value="year" className="flex items-center">
                <Grid className="w-4 h-4 mr-2" />
                Year
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={handlePrevious}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button 
            onClick={handleToday}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Today"
          >
            Today
          </button>
          <button 
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'year' && renderYearView()}

      {/* Selected Date Tasks Section */}
      {selectedDate && (
        <div className="p-5 border-t">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 text-gray-500" size={18} />
              <h3 className="font-medium text-gray-800">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
            </div>
            <button 
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => handleAddTask(selectedDate)}
            >
              <Plus size={16} className="mr-1" /> Add Task
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {selectedDate && tasksByDate[format(selectedDate, 'yyyy-MM-dd')]?.map((task) => (
              <div 
                key={task.id}
                className="p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onViewTask && onViewTask(task)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                  <div className={`text-xs px-2.5 py-1 rounded-full ${getTaskStatusBadge(task.status)}`}>
                    {task.status === 'in_progress' ? 'In Progress' : 
                     task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </div>
                </div>
                
                <div className="flex mt-3 text-xs text-gray-500">
                  {task.duration && (
                    <div className="mr-3">
                      <span>Duration: {task.duration} min</span>
                    </div>
                  )}
                  <div>
                    <span>Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <CalendarIcon className="mx-auto mb-2" size={24} />
                <p>No tasks scheduled for this day</p>
                <button 
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => handleAddTask(selectedDate)}
                >
                  Add a task
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}