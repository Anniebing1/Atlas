import Sidebar from "@/components/Sidebar";
import JarvisChat from "@/components/JarvisChat";

export default function InsightsPage() {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <JarvisChat />
      </main>
    </div>
  );
}
