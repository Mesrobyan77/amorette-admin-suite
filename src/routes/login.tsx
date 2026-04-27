import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Mail, Lock, Sparkles } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (!loading && isAuthenticated) return <Navigate to="/admin" />;

  const onSubmit = async (values: LoginInput) => {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--gold)] to-[var(--primary)] text-primary-foreground font-display text-2xl ring-luxe mb-4">
            A
          </div>
          <h1 className="font-display text-4xl text-gradient-gold">Amorette</h1>
          <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Luxury Admin Panel
          </p>
        </div>

        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_45%,transparent)]">
          <h2 className="font-display text-2xl mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-6">Welcome back. Enter your details.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@amorette.com"
                  className="pl-10"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>
            </div>

            <Button type="submit" variant="gold" size="lg" fullWidth loading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Amorette. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
