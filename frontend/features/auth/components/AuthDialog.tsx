"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LoginForm from "@/features/auth/components/LoginForm";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import useAuthModalStore from "../stores/authModalStore";

export default function AuthDialog() {
  const { open, closeModal } = useAuthModalStore();
  //TODO: create link to switch between the forms
  const [selectedForm, setSelectedForm] = useState<"login" | "register">(
    "login",
  );
  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <VisuallyHidden>
        <DialogTitle>
          Please log in or register to perform this action
        </DialogTitle>
      </VisuallyHidden>

      <DialogContent>
        {selectedForm === "login" ? <LoginForm /> : <RegisterForm />}
      </DialogContent>
    </Dialog>
  );
}
