import React from 'react';
import Navbar from '../components/layout/Navbar';
import ProfileHeader from '../components/profile/ProfileHeader';
import EligibilityCard from '../components/profile/EligibilityCard';
import MedicalInfoSection from '../components/profile/MedicalInfoSection';
import VerificationDocsUpload from '../components/profile/VerificationDocsUpload';

export default function ProfilePage() {
  const userProfile = {
    name: "Dr. Aris Thorne",
    email: "aris.thorne@example.com",
    phone: "+1 (555) 234-5678",
    bloodType: "O-",
    location: "Metro General Region, NY",
    joinedDate: "March 2024"
  };

  const medicalData = {
    weight: 74,
    bloodPressure: "120/80",
    lastDonation: "2024-01-15",
    conditions: []
  };

  const docs = [
    { name: "Government_ID_Verification.pdf", date: "2024-03-10" },
    { name: "Blood_Group_Certificate.pdf", date: "2024-03-11" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <ProfileHeader profile={userProfile} />
        <EligibilityCard isEligible={true} daysRemaining={0} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalInfoSection medicalData={medicalData} />
          <VerificationDocsUpload documents={docs} />
        </div>
      </div>
    </div>
  );
}