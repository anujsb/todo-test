import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import Image from "next/image";

export default function Home() {
  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      <TaskForm />
      <TaskList />
    </main>
    // </div>
  );
}
