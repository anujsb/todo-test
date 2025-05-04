'use client'; // Required for client-side interactivity in Next.js App Router

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const TestView: React.FC = () => {
  // Sample events (replace with your data source)
  const events = [
    { title: 'Team Meeting', start: '2025-04-21T10:00:00', end: '2025-04-21T11:00:00', backgroundColor: '#3b82f6' },
    { title: 'Project Deadline', start: '2025-04-23', backgroundColor: '#ef4444' },
    { title: 'Lunch Break', start: '2025-04-22T12:00:00', end: '2025-04-22T13:00:00', backgroundColor: '#10b981' },
  ];

  // Handle date click (example interaction)
  const handleDateClick = (arg: any) => {
    alert(`Date clicked: ${arg.dateStr}`);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }}
        editable={true} // Allows dragging events
        selectable={true} // Allows selecting dates
        eventClassNames="text-white font-semibold rounded-md p-1"
        height="auto"
      />
    </div>
  );
};

export default TestView;