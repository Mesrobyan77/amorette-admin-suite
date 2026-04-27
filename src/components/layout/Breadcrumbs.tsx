import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

const labels: Record<string, string> = {
  admin: "Dashboard",
  templates: "Templates",
  create: "Create",
  edit: "Edit",
  profile: "Profile",
  "coming-soon": "Coming Soon",
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0 || parts[0] !== "admin") return null;

  let acc = "";
  const crumbs = parts.map((p, idx) => {
    acc += "/" + p;
    return { to: acc, label: labels[p] || decodeURIComponent(p), last: idx === parts.length - 1 };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-none">
      <Link to="/admin" className="inline-flex items-center hover:text-foreground transition">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((c) => (
        <div key={c.to} className="flex items-center gap-1.5 whitespace-nowrap">
          <ChevronRight className="h-3.5 w-3.5" />
          {c.last ? (
            <span className="text-foreground font-medium">{c.label}</span>
          ) : (
            <Link to={c.to as any} className="hover:text-foreground transition">{c.label}</Link>
          )}
        </div>
      ))}
    </nav>
  );
}
