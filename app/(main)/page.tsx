import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <UserButton />
      <ModeToggle />
    </div>
  );
}
