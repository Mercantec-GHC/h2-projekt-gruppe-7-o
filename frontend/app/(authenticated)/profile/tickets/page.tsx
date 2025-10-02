import { DashboardBodyWrapper } from "@/components/dashboard/DashboardBodyWrapper";
import { TicketInbox } from "@/features/ticket/components/TicketInbox";

export default function TicketsPage() {
  return (
    <DashboardBodyWrapper>
      <TicketInbox isAdmin={false} userRole="Customer" />
    </DashboardBodyWrapper>
  );
}
