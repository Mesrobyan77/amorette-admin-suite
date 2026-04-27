import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const Route = createFileRoute("/admin/coming-soon")({
  component: ComingSoonPage,
});

function ComingSoonPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card glass className="text-center py-12 px-6 sm:px-10 animate-glow">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--gold)] to-[var(--primary)] text-primary-foreground ring-luxe mb-5">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-gradient-gold">Coming Soon</h1>
          <p className="mt-4 text-base text-muted-foreground" lang="hy">
            Այս բաժինը շուտով հասանելի կլինի
          </p>
          <div className="mt-7 flex justify-center">
            <Link to="/admin">
              <Button variant="outline"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
