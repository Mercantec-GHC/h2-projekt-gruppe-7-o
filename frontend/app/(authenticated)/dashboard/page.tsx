import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardBodyWrapper } from "@/components/dashboard/DashboardBodyWrapper";

export default function DashboardPage() {
  return (
    <DashboardBodyWrapper>
      <ChartAreaInteractive />
    </DashboardBodyWrapper>
  );
}
