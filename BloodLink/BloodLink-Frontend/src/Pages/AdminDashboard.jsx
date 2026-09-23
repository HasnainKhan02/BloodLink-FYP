import Navbar from "../components/layout/Navbar";
import AnalyticsSummary from "../components/admin/AnalyticsSummary";
import VerificationQueue from "../components/admin/VerificationQueue";
import ModerationFeed from "../components/admin/ModerationFeed";
import ManagementTabs from "../components/admin/ManagementTabs";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased">
      <Navbar role="Admin" unreadCount={5} userName="Hasnain" />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <AnalyticsSummary />
        <VerificationQueue />
        <ModerationFeed />
        <ManagementTabs />
      </main>
    </div>
  );
}
