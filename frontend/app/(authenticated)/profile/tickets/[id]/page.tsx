"use client";

import { DashboardBodyWrapper } from "@/components/dashboard/DashboardBodyWrapper";
import { TicketDetailView } from "@/features/ticket/components/TicketDetailView";
import { useParams, useRouter } from "next/navigation";

export default function CustomerTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = parseInt(params.id as string);

  const handleBack = () => {
    router.push("/profile/tickets");
  };

  if (!ticketId || isNaN(ticketId)) {
    return (
      <DashboardBodyWrapper>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">
            Invalid Ticket ID
          </h1>
          <p className="text-muted-foreground mt-2">
            The ticket ID provided is not valid.
          </p>
        </div>
      </DashboardBodyWrapper>
    );
  }

  return (
    <DashboardBodyWrapper>
      <TicketDetailView
        ticketId={ticketId}
        isAdmin={false}
        onBack={handleBack}
      />
    </DashboardBodyWrapper>
  );
}
