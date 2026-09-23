import Navbar from "../components/layout/Navbar";
import EligibilityBanner from "../components/donor/EligibilityBanner";
import DonorStatsGrid from "../components/donor/DonorStatsGrid";
import NearbyRequestsFeed from "../components/donor/NearbyRequestsFeed";
import DonationHistoryTable from "../components/donor/DonationHistoryTable";

export default function DonorDashboard() {
  const eligible = false; // toggle to test the cooldown state

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased">
      <Navbar role="Donor" unreadCount={2} userName="Hasnain" />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <EligibilityBanner eligible={eligible} cooldownDaysRemaining={34} />

        <DonorStatsGrid
          donationsCompleted={6}
          bloodGroup="A-"
          latitude={34.1203}
          longitude={72.4708}
        />

        <NearbyRequestsFeed donorLat={34.1203} donorLon={72.4708} />

        <DonationHistoryTable />
      </main>
    </div>
  );
}
