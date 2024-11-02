import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <button onClick={openModal} className="btn-primary">
        Create a server
      </button>
      
      {isModalOpen && <InitialModal onClose={closeModal} />}
    </div>
  );
}
