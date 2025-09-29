import { IconBurger, IconInfoCircle, IconWifi } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { CopyButton } from "../ui/shadcn-io/copy-button";
import { BrushCleaning, DoorClosed } from "lucide-react";
import { toast } from "sonner";
import { useUserBookings } from "@/features/user/queries/useUserBookings";

export function ProfileSectionCards() {
  const {} = useUserBookings();
  return (
    <div>
      <h2 className="text-2xl px-4 lg:px-6 font-bold mb-6">
        Nuværende booking
      </h2>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/*<Card className="@container/card">
          <CardHeader>
            <div className="flex justify-between">
              <Badge className="mb-3" variant="default">
                Rum <DoorClosed />
              </Badge>
            </div>
            <CardDescription className="flex flex-col">
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                  <h3 className="text-sm font-semibold text-primary">
                    Nummer:
                  </h3>
                  <p className="text-sm text-muted-foreground">420</p>
                </div>
                <div className="flex gap-2 items-center">
                  <h3 className="text-sm font-semibold text-primary">Floor:</h3>
                  <p className="text-sm text-muted-foreground">4</p>
                </div>
                <div className="flex gap-2 items-start">
                  <h3 className="text-sm font-semibold text-primary">
                    Address:
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Wadada 2aad ee Bakaro ka soo Horjeedka Dahabshiil Bank,
                    Mogadishu, Somalia
                  </p>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>*/}

        <Card className="@container/card">
          <CardHeader>
            <div className="flex justify-between">
              <Badge className="mb-3" variant="default">
                Wifi <IconWifi />
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/*Adding a span around this to make the trigger area larger*/}
                  <span className="relative inline-flex cursor-pointer">
                    <IconInfoCircle size={16} className="cursor-pointer" />
                    {/* Invisible hitbox */}
                    <span className="absolute inset-0 -m-2" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {/*TODO: This link should go somewhere, however we dont really need it for now...*/}
                  <p>
                    Har du problemer med forbindelsen? Klik{" "}
                    <Link
                      className="underline hover:opacity-80"
                      target="_blank"
                      href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    >
                      her
                    </Link>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription className="flex flex-col">
              <h3 className="text-lg font-semibold text-primary">
                Navn (SSID)
              </h3>
              <div className="flex items-center gap-2">
                {/*TODO: Use wifi password from booking here*/}
                <p className="text-sm text-muted-foreground">
                  SomaliSabuziKabdi
                </p>
                <CopyButton
                  onClick={() =>
                    toast.success("WiFi navn kopieret til udklipsholder")
                  }
                  content="SomaliSabuziKabdi"
                  variant="ghost"
                  size="sm"
                />
              </div>

              {/*TODO: Use wifi network from booking here*/}
            </CardDescription>
            <CardDescription className="flex flex-col">
              <h3 className="text-lg font-semibold text-primary">Password</h3>
              <div className="flex items-center gap-2">
                {/*TODO: Use wifi password from booking here*/}
                <p className="text-sm text-muted-foreground">
                  KabidiKhan1880@#!
                </p>
                <CopyButton
                  onClick={() =>
                    toast.success("WiFi password kopieret til udklipsholder")
                  }
                  content="KabidiKhan1880@#!"
                  variant="ghost"
                  size="sm"
                />
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <div className="flex justify-between">
              <Badge className="mb-3" variant="default">
                Mad <IconBurger />
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/*Adding a span around this to make the trigger area larger*/}
                  <span className="relative inline-flex cursor-pointer">
                    <IconInfoCircle size={16} className="cursor-pointer" />
                    {/* Invisible hitbox */}
                    <span className="absolute inset-0 -m-2" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {/*TODO: This link should go somewhere, however we dont really need it for now...*/}
                  <p>
                    Hvis du er sulten mellem 24:00-06:00, så er det sgu bare
                    ærgerligt
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Morgenmad
                </h3>
                <p className="text-sm text-muted-foreground">06:00-10:00</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary">Frokost</h3>
                <p className="text-sm text-muted-foreground">12:00-15:00</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Aftensmad
                </h3>
                <p className="text-sm text-muted-foreground">18:00-22:00</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Nat snack
                </h3>
                <p className="text-sm text-muted-foreground">22:00-24:00</p>
              </div>
              {/*TODO: Use wifi network from booking here*/}
            </CardDescription>
            <CardDescription className="flex flex-col">
              {/*TODO: Use wifi network from booking here*/}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="@container/card">
          <CardHeader className="flex flex-col h-full">
            <div className="flex flex-col">
              <Badge className="mb-3" variant="default">
                Rengøring <BrushCleaning />
              </Badge>
              <p className="mb-3 bg-green-100 p-2 rounded-md text-sm text-primary">
                Rengøring er booket til i morgen kl 10:00
              </p>
            </div>

            <CardDescription className="mt-auto">
              <div className="flex items-center gap-2 ">
                <Button size="sm" variant="outline">
                  Reschedule
                </Button>
                <Button size="sm" variant="destructive">
                  Cancel
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
