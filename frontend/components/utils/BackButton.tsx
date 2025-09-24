"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface BackButtonProps {
  icon: boolean;
}
export default function BackButton({ icon = false }: BackButtonProps) {
  const router = useRouter();

  //TODO: this is not foolproof, we need to be able to handle situtations where the user does not have any history from our own page
  // If that is the case we don't want to go outside of our own domain, and should just link to the home page.
  // Does not seem like nextjs app router supports this out of the box
  const handleClick = () => {
    router.back();
  };

  return (
    <>
      {icon ? (
        <IconArrowLeft className="cursor-pointer" onClick={handleClick} />
      ) : (
        <Button onClick={handleClick}>Go Back</Button>
      )}
    </>
  );
}
