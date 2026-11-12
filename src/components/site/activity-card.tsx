import { Badge } from "@/components/ui/badge";
import { formatDate, type Activity } from "@/content/site";

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="card-interactive flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="mono">{activity.tag}</Badge>
        <time dateTime={activity.date} className="font-mono text-xs text-muted-foreground">
          {formatDate(activity.date)}
        </time>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{activity.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
    </article>
  );
}
