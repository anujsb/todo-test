'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { taskSchema } from '@/lib/validations';
import { z } from 'zod';

type Task = z.infer<typeof taskSchema>;

interface CalendarViewProps {
  tasks: Task[];
  onAddTask?: (date: Date) => void;
  onViewTask?: (task: Task) => void;
}

export default function FlowSavvyCalendarView({ tasks, onAddTask, onViewTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Array of weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTask = (date: Date) => {
    if (onAddTask) {
      onAddTask(date);
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

  // Get the status counts for a specific date
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-5 border-b">
        <h2 className="text-xl font-medium text-gray-800">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex space-x-1">
          <button 
            onClick={handlePreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center border-b">
          {weekdays.map(day => (
            <div key={day} className="py-3 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
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
                      e.stopPropagation(); // Prevent parent click handlers
                      handleAddTask(day); // Ensure this calls the passed onAddTask prop
                    }}
                    aria-label="Add task"
                  >
                    <Plus size={16} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Tasks for this day */}
                <div className="mt-3 space-y-1.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`px-2 py-1.5 rounded-md text-xs truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewTask) onViewTask(task);
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full mr-1.5 ${
                        task.status === 'completed' ? 'bg-green-500' : 
                        task.status === 'in_progress' ? 'bg-amber-500' : 
                        'bg-blue-500'
                      }`}></div>
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2 font-medium">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
                
                {/* Status indicators */}
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

          {/* Tasks list for selected date */}
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
                  <div className={`text-xs px-2.5 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.status === 'in_progress' ? 'In Progress' : 
                     task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </div>
                </div>
                
                {/* Additional task details */}
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