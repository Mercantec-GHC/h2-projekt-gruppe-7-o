import { DashboardBodyWrapper } from "@/components/dashboard/DashboardBodyWrapper";
import { TicketInbox } from "@/features/ticket/components/TicketInbox";

export default function DashboardTicketsPage() {
  return (
    <DashboardBodyWrapper>
      <TicketInbox isAdmin={true} />
    </DashboardBodyWrapper>
  );
}
