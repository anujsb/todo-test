'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { taskSchema } from '@/lib/validations';
import { z } from 'zod';
import { Button } from './ui/button';

type Task = z.infer<typeof taskSchema>;

interface CalendarViewProps {
  tasks: Task[];
  onAddTask?: (date: Date) => void;
  onViewTask?: (task: Task) => void;
}

export default function CalendarView({ tasks, onAddTask, onViewTask }: CalendarViewProps) {
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
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <Button
            onClick={handlePreviousMonth}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button 
            onClick={handleNextMonth}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center bg-gray-50">
          {weekdays.map(day => (
            <div key={day} className="py-2 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 border-t">
          {daysInMonth.map((day, dayIdx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] || [];
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            
            return (
              <div
                key={dayIdx}
                className={`min-h-24 border-b border-r p-2 transition-colors ${
                  !isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''} ${
                  isSelected ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <Button
                    className="p-1 hover:bg-gray-200 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTask(day);
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                {/* Tasks for this day */}
                <div className="mt-2 space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`px-2 py-1 rounded text-xs truncate cursor-pointer ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewTask) onViewTask(task);
                      }}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks Section */}
      {selectedDate && (
        <div className="p-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <button 
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              onClick={() => handleAddTask(selectedDate)}
            >
              <Plus size={16} className="mr-1" /> Add Task
            </button>
          </div>

          {/* Tasks list for selected date */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedDate && tasksByDate[format(selectedDate, 'yyyy-MM-dd')]?.map((task) => (
              <div 
                key={task.id}
                className="p-3 rounded-md bg-white border hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewTask && onViewTask(task)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                No tasks scheduled for this day
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}