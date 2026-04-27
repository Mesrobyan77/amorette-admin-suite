import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { motion } from "framer-motion";
import type { TrendPoint } from "@/api/analytics";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  data: TrendPoint[];
  metric: "views" | "rating";
}

function formatTickDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrendChart({ data, metric }: Props) {
  const { theme } = useTheme();
  const stroke = metric === "views" ? "var(--primary)" : "var(--gold)";
  const fillId = `grad-${metric}`;
  const grid = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  if (metric === "rating") {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="h-64 sm:h-72 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={grid} vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatTickDate} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)", border: "1px solid var(--border)",
                borderRadius: 16, color: "var(--popover-foreground)", fontSize: 12,
              }}
              labelFormatter={(l) => new Date(l).toLocaleDateString()}
              formatter={(v: any) => [v, "Rating"]}
            />
            <Line type="monotone" dataKey="rating" stroke={stroke} strokeWidth={2.5} dot={{ r: 3, fill: stroke }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="h-64 sm:h-72 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatTickDate} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)", border: "1px solid var(--border)",
              borderRadius: 16, color: "var(--popover-foreground)", fontSize: 12,
            }}
            labelFormatter={(l) => new Date(l).toLocaleDateString()}
            formatter={(v: any) => [v, "Views"]}
          />
          <Area type="monotone" dataKey="views" stroke={stroke} strokeWidth={2.5} fill={`url(#${fillId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
