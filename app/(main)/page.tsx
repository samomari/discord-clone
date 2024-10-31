'use client'
import InitialModal from "@/components/modals/initial-modal";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div>
      <UserButton />
      <ModeToggle />
      <button onClick={openModal} className="btn-primary">
        Create a server
      </button>
      
      {isModalOpen && <InitialModal onClose={closeModal} />}
    </div>
  );
}
