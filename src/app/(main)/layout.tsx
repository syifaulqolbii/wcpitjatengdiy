import Navbar from "@/components/shared/Navbar";
import BottomNav from "@/components/shared/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar for Desktop */}
      <Navbar />

      {/* Main Content Area */}
      {/* Added pb-20 to ensure content is not hidden behind the mobile BottomNav */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
