import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { MobileMenuButton } from "./Sidebar";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const initials = (user?.name || user?.email || "A")
    .split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="h-16 px-4 sm:px-6 flex items-center gap-3">
        <MobileMenuButton onClick={onOpenSidebar} />
        <div className="flex-1" />
        <ThemeToggle />
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted transition">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--primary)] text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-foreground">{user?.name || "Admin"}</span>
                <span className="text-[11px] text-muted-foreground">{user?.role || "—"}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          }
        >
          <DropdownItem onClick={() => navigate({ to: "/admin/profile" })}>
            <User className="h-4 w-4" /> Profile
          </DropdownItem>
          <DropdownItem danger onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
