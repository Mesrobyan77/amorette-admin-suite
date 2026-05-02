import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileImage,
  Plus,
  User,
  Sparkles,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ScrollText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/format";
import toast from "react-hot-toast";

interface NavLink {
  to: string;
  label: string;
  icon: any;
}
interface NavGroup {
  label: string;
  icon: any;
  items: NavLink[];
}

const groups: NavGroup[] = [
  {
    label: "Landing Page",
    icon: FileImage,
    items: [
      { to: "/admin/templates", label: "Templates", icon: FileImage },
      { to: "/admin/templates/create", label: "Create Template", icon: Plus },
    ],
  },
];

const topLinks: NavLink[] = [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }];
const bottomLinks: NavLink[] = [
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/coming-soon", label: "Coming Soon", icon: Sparkles },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ "Landing Page": true });

  // Close drawer on route change (mobile)
  useEffect(() => { onClose(); }, [location.pathname]); // eslint-disable-line

  const isActive = (to: string) =>
    to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const NavItem = ({ link }: { link: NavLink }) => {
    const active = isActive(link.to);
    return (
      <Link
        to={link.to}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition relative",
          active ? "text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
        )}
      >
        {active && (
          <motion.span
            layoutId="active-pill"
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[color-mix(in_oklab,var(--gold)_70%,var(--primary))] -z-0 ring-luxe"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <link.icon className="relative h-4 w-4 z-10" />
        <span className="relative z-10">{link.label}</span>
      </Link>
    );
  };

  const content = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--primary)] flex items-center justify-center text-primary-foreground font-display text-lg ring-luxe">
            A
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl text-gradient-gold">Amorette</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Admin
            </span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl hover:bg-sidebar-accent"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {topLinks.map((l) => (
          <NavItem key={l.to} link={l} />
        ))}

        {groups.map((g) => {
          const isOpen = openGroups[g.label] ?? true;
          return (
            <div key={g.label} className="pt-2">
              <button
                onClick={() => setOpenGroups((p) => ({ ...p, [g.label]: !isOpen }))}
                className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
              >
                <span className="flex items-center gap-2">
                  <g.icon className="h-3.5 w-3.5" /> {g.label}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition", isOpen && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1 pl-2"
                  >
                    {g.items.map((l) => (
                      <NavItem key={l.to} link={l} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className="pt-2 space-y-1">
          {bottomLinks.map((l) => (
            <NavItem key={l.to} link={l} />
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-destructive hover:bg-destructive/10 transition"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 sticky top-0 h-screen">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden h-10 w-10 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
