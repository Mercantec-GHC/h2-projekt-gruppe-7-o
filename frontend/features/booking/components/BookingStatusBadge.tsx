import { Badge, BadgeProps } from "@/components/ui/badge";

export const BookingStatusBadge = ({ status }: { status: string }) => {
  let statusColorClassName = "";
  let variant: BadgeProps["variant"] = null;
  let statusText = "";

  switch (status) {
    case "Confirmed":
      statusColorClassName = "text-green-100";
      variant = "success";
      statusText = "Bekræftet";
      break;
    case "Pending":
      statusColorClassName = "text-yellow-100";
      variant = "warning";
      statusText = "Afventer";
      break;
    case "Cancelled":
      statusColorClassName = "text-red-100";
      variant = "destructive";
      statusText = "Annulleret";
      break;
    default:
      statusColorClassName = "text-blue-100";
      variant = "outline";
      statusText = "Ukendt";
      break;
  }

  return (
    <Badge className={statusColorClassName} variant={variant}>
      {statusText}
    </Badge>
  );
};
