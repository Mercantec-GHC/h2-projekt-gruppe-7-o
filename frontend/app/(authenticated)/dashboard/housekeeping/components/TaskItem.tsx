"use client";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { HousekeepingRoom } from "../api/HousekeepingRoomTransform";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  CheckCircle,
  Loader2,
  Star,
  Bed,
  MapPin,
  Hotel,
  AlertTriangle,
} from "lucide-react";
import { useUpdateRoomStatus } from "../hooks/updateRoomStatus";

interface TaskItemProps {
  task: HousekeepingRoom;
  refreshList: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, refreshList }) => {
  const { updateStatus, isLoading: isUpdating } = useUpdateRoomStatus();
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: number, label: string) => {
    setStatusError(null);

    const promise = updateStatus(task.id, newStatus);

    toast.promise(promise, {
      loading: `Opdaterer værelse ${task.number}...`,
      success: () => {
        refreshList();
        return `Værelse ${task.number} er nu ${label}!`;
      },
      error: (err) => {
        const errorMessage = (err as Error).message;
        setStatusError(errorMessage);
        return `Fejl: ${errorMessage}`;
      },
      action: { label: "Luk", onClick: () => {} },
      duration: 5000,
    });
  };

  const borderClass = task.displayColor.replace("bg-", "border-");
  const isCheckout = task.status === "DirtyCheckout";
  const taskType = isCheckout ? "Fuld Rengøring (DCO)" : "Daglig Service (DS)";
  const hotelName = task.hotelName || "Ukendt Hotel";
  const roomFloor = task.floor;

  return (
    <Card
      className={`mb-4 shadow-lg hover:shadow-xl transition-shadow border-l-4 ${borderClass} ${
        task.isPriority ? "border-r-4 border-r-yellow-500" : ""
      }`}
    >
      <CardHeader className="p-4 flex flex-row items-start justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-2xl font-semibold flex items-center">
            <Hotel className="h-6 w-6 mr-3 text-primary" />
            Værelse {task.number}
          </CardTitle>
          <CardDescription className="flex items-center mt-1">
            <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
            {taskType}
          </CardDescription>
        </div>

        <div className="flex flex-col items-end space-y-1">
          {task.isPriority && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-sm">
              <Star className="h-4 w-4 mr-1 fill-white" /> PRIORITET
            </Badge>
          )}
          <Badge
            variant={isCheckout ? "destructive" : "secondary"}
            className="text-xs"
          >
            {task.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> Hotel:
            </span>
            <span className="font-semibold text-primary">{hotelName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              Etage:
            </span>
            <span className="font-semibold">{roomFloor}</span>
          </div>
        </div>

        <Separator className="my-3" />

        {statusError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Opdatering Fejlede!</AlertTitle>
            <AlertDescription>{statusError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-2">
          <Button
            onClick={() => handleStatusChange(4, "klar til inspektion")} // AwaitingInspection
            disabled={isUpdating}
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 transition-colors"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Sender Status...
              </>
            ) : (
              <>
                <CheckCircle className="h-6 w-6 mr-2" /> Færdiggør (Klar til
                Inspektion)
              </>
            )}
          </Button>

          <Button
            onClick={() => handleStatusChange(1, "klar til rengøring")} // CleanReady
            disabled={isUpdating}
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Sæt til CleanReady
          </Button>

          <Button
            onClick={() => handleStatusChange(5, "ikke tilgængelig")} // OutOfOrder
            disabled={isUpdating}
            className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            Sæt til OutOfOrder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
