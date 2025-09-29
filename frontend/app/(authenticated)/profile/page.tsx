"use client";

import ProfileMyBookings from "@/components/dashboard/profile-dashboard/profile-my-bookings";
import { ProfileSectionCards } from "@/components/dashboard/profile-dashboard/profile-section-cards";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ProfileSectionCards />
      <ProfileMyBookings />
    </div>
  );
}
