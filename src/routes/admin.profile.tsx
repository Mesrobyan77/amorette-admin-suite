import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Mail, Shield, Calendar, Clock, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/format";

export const Route = createFileRoute("/admin/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const [confirmAll, setConfirmAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const initials = (user?.name || user?.email || "A")
    .split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  const doLogout = async () => {
    setLoading(true);
    try {
      await logout();
      toast.success("Signed out");
      navigate({ to: "/login" });
    } finally { setLoading(false); }
  };

  const doLogoutAll = async () => {
    setLoading(true);
    try {
      await logoutAll();
      toast.success("Signed out of all sessions");
      navigate({ to: "/login" });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Logout-all failed");
    } finally { setLoading(false); setConfirmAll(false); }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and security.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardTitle>Account Info</CardTitle>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[var(--gold)] to-[var(--primary)] text-primary-foreground font-display text-3xl flex items-center justify-center ring-luxe shrink-0">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover rounded-3xl" /> : initials}
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Field icon={Mail} label="Name" value={user?.name || "—"} />
              <Field icon={Mail} label="Email" value={user?.email || "—"} />
              <Field icon={Shield} label="Role">
                <Badge variant="gold">{user?.role || "admin"}</Badge>
              </Field>
              <Field icon={Calendar} label="Member since" value={formatDate(user?.createdAt)} />
              <Field icon={Clock} label="Last login" value={formatDate(user?.lastLoginAt)} />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardTitle>Security</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Sign out of this device, or end all active sessions.</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={doLogout} loading={loading} fullWidth>
              <LogOut className="h-4 w-4" /> Logout this session
            </Button>
            <Button variant="destructive" onClick={() => setConfirmAll(true)} fullWidth>
              <ShieldAlert className="h-4 w-4" /> Logout all sessions
            </Button>
          </div>
        </Card>
      </motion.div>

      <Modal
        open={confirmAll}
        onClose={() => !loading && setConfirmAll(false)}
        title="Logout all sessions?"
        description="This will end every active session for your account on all devices."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmAll(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={doLogoutAll} loading={loading}>
              <ShieldAlert className="h-4 w-4" /> Logout all
            </Button>
          </>
        }
      />
    </div>
  );
}

function Field({ icon: Icon, label, value, children }: { icon: any; label: string; value?: string; children?: any }) {
  return (
    <div className="rounded-2xl bg-muted/50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="mt-1 text-sm font-medium">{children ?? value ?? "—"}</div>
    </div>
  );
}
