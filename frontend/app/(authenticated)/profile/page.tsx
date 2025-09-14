"use client";

import data from "./data.json";
import { ProfileSectionCards } from "@/components/profile-dashboard/profile-section-cards";
import { ProfileDataTable } from "@/components/profile-dashboard/profile-data-table";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ProfileSectionCards />
      <ProfileDataTable data={data} />
    </div>
  );
}
