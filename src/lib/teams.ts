import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MemberSummary = { id: string; full_name: string; username: string };

export const membersQuery = queryOptions({
  queryKey: ["members"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, created_at")
      .eq("is_active", true)
      .order("full_name");
    if (error) throw error;
    return data;
  },
});

export const teamsQuery = queryOptions({
  queryKey: ["teams"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, description, created_at, team_members(user_id)")
      .order("name");
    if (error) throw error;
    return data.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      created_at: t.created_at,
      memberIds: t.team_members.map((m) => m.user_id),
    }));
  },
});

export const teamDetailQuery = (teamId: string) =>
  queryOptions({
    queryKey: ["teams", teamId],
    queryFn: async () => {
      const { data: team, error } = await supabase
        .from("teams")
        .select("id, name, description, created_at, created_by")
        .eq("id", teamId)
        .maybeSingle();
      if (error) throw error;
      if (!team) return null;
      const { data: links, error: e2 } = await supabase
        .from("team_members")
        .select("user_id, joined_at")
        .eq("team_id", teamId)
        .order("joined_at");
      if (e2) throw e2;
      const ids = links.map((l) => l.user_id);
      const { data: profiles, error: e3 } = ids.length
        ? await supabase.from("profiles").select("id, full_name, username").in("id", ids)
        : { data: [] as MemberSummary[], error: null };
      if (e3) throw e3;
      const members = links
        .map((l) => ({ ...profiles.find((p) => p.id === l.user_id), joined_at: l.joined_at }))
        .filter((m): m is MemberSummary & { joined_at: string } => !!m.id);
      return { ...team, members };
    },
  });

export function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
