import api from "./axios";
import type { Template } from "./templates";

export interface TrendPoint {
  date: string; // ISO yyyy-mm-dd
  views: number;
  rating: number | null;
}

export interface AnalyticsResponse {
  series: TrendPoint[];
}

export const analyticsApi = {
  trends: (params: { from: string; to: string }) =>
    api.get<AnalyticsResponse>("/api/analytics/trends", { params }),
};

/**
 * Fallback: derive a synthetic trend series from current templates.
 * Used when the backend doesn't expose /api/analytics/trends yet.
 * Distributes total views across the date range with mild variance,
 * and uses a flat current-average rating per day.
 */
export function deriveTrendsFromTemplates(
  templates: Template[],
  from: Date,
  to: Date,
): TrendPoint[] {
  const days: TrendPoint[] = [];
  const totalViews = templates.reduce((s, t) => s + (t.views || 0), 0);
  const ratings = templates.filter((t) => typeof t.rating === "number");
  const avgRating = ratings.length
    ? ratings.reduce((s, t) => s + (t.rating || 0), 0) / ratings.length
    : null;

  const start = new Date(from); start.setHours(0, 0, 0, 0);
  const end = new Date(to);     end.setHours(0, 0, 0, 0);
  const dayCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
  const base = totalViews / dayCount;

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    // Smooth deterministic wave so the chart isn't flat
    const wave = 1 + 0.35 * Math.sin((i / dayCount) * Math.PI * 2);
    const ratingWave = avgRating != null ? avgRating + 0.1 * Math.sin((i / dayCount) * Math.PI) : null;
    days.push({
      date: d.toISOString().slice(0, 10),
      views: Math.max(0, Math.round(base * wave)),
      rating: ratingWave != null ? Math.max(0, Math.min(5, +ratingWave.toFixed(2))) : null,
    });
  }
  return days;
}
