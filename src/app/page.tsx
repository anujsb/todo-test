// import TaskForm from "@/components/TaskForm";
// import TaskList from "@/components/TaskList";

// export default function Home() {
//   return (
//     <main className="container mx-auto p-6 sm:p-10 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Todo App</h1>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white shadow-md rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4">Add a New Task</h2>
//           <TaskForm />
//         </div>
//         <div className="bg-white shadow-md rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Tasks</h2>
//           <TaskList />
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";

import { useState } from "react";
import TaskForm from "@/components/TaskForm";
import TaskTextInput from "@/components/TaskTextInput";
import TaskList from "@/components/TaskList";
import TaskCalendar from "@/components/TaskCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestView from "@/components/TestView";

export default function Home() {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      <div className="flex flex-col gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">AI-Powered Entry</h2>
          <TaskTextInput />
        </div>
        {/* <div>
          <h2 className="text-lg font-semibold mb-2">Manual Entry</h2>
          <TaskForm />
        </div> */}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {/* <TabsTrigger value="list">List View</TabsTrigger> */}
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        {/* <TabsContent value="list">
          <TaskList />
        </TabsContent> */}
        <TabsContent value="calendar">
          <TaskCalendar />
        </TabsContent>
      </Tabs>
      {/* <TestView/> */}
    </main>
  );
}
