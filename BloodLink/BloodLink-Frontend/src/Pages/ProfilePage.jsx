import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import ProfileHeader from '../components/profile/ProfileHeader';
import EligibilityCard from '../components/profile/EligibilityCard';
import MedicalInfoSection from '../components/profile/MedicalInfoSection';
import VerificationDocsUpload from '../components/profile/VerificationDocsUpload';
import { Loader2, X, Check } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    blood_type: "A+"
  });

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('bloodlink_token');
    const cachedUser = localStorage.getItem('bloodlink_user');

    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
        setEditForm({
          name: parsed.name || "",
          phone: parsed.phone || "",
          blood_type: parsed.blood_type || "A+"
        });
      } catch (err) {
        console.error("Cache parse error", err);
      }
    }

    if (token) {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setEditForm({
            name: data.name || "",
            phone: data.phone || "",
            blood_type: data.blood_type || "A+"
          });
          localStorage.setItem('bloodlink_user', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Profile fetch error", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Save Updated Profile to Backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('bloodlink_token');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = data.user || { ...user, ...editForm };
        setUser(updatedUser);
        localStorage.setItem('bloodlink_user', JSON.stringify(updatedUser));
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error", err);
      alert("Error saving profile details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      </div>
    );
  }

  const userProfile = {
    name: user?.name || "Donor User",
    email: user?.email || "N/A",
    phone: user?.phone || "N/A",
    bloodType: user?.blood_type || "N/A",
    location: user?.city ? `${user.city}, ${user.address || ''}` : "Swabi, KPK",
    joinedDate: user?.created_at 
      ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : "Member"
  };

  const medicalData = {
    weight: user?.donor_profile?.weight || 70,
    bloodPressure: user?.donor_profile?.blood_pressure || "120/80",
    lastDonation: user?.donor_profile?.last_donation_date || "No recent donations",
    conditions: user?.donor_profile?.medical_conditions || []
  };

  const docs = user?.proof_document ? [
    { name: user.proof_document.split('/').pop(), date: new Date().toLocaleDateString() }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Pass onEditClick handler to ProfileHeader */}
        <ProfileHeader profile={userProfile} onEditClick={() => setIsEditing(true)} />
        
        <EligibilityCard isEligible={true} daysRemaining={0} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalInfoSection medicalData={medicalData} />
          <VerificationDocsUpload documents={docs} />
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Blood Group</label>
                <select
                  value={editForm.blood_type}
                  onChange={(e) => setEditForm({ ...editForm, blood_type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  {saving ? "Saving..." : "Save Changes"} <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}