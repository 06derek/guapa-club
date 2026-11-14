import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const adminUsersQuery = queryOptions({
  queryKey: ["admin", "users"],
  queryFn: async () => {
    const [{ data: profiles, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, username, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    return profiles.map((p) => ({
      ...p,
      isAdmin: roles.some((r) => r.user_id === p.id && r.role === "admin"),
    }));
  },
});

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
  head: () => ({ meta: [{ title: "Administración · GUAPA" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminUsersQuery),
  component: AdminPage,
});

function AdminPage() {
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: users } = useSuspenseQuery(adminUsersQuery);

  const toggleAdmin = useMutation({
    mutationFn: async ({ id, makeAdmin }: { id: string; makeAdmin: boolean }) => {
      const { error } = makeAdmin
        ? await supabase.from("user_roles").insert({ user_id: id, role: "admin" })
        : await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.makeAdmin ? "Permisos de administrador otorgados" : "Permisos de administrador retirados");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () => toast.error("No se pudo actualizar el permiso"),
  });

  return (
    <>
      <h2 className="text-2xl font-bold">Usuarios y permisos</h2>
      <p className="mt-1 text-muted-foreground">{users.length} usuarios registrados.</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">
                  {u.full_name}{" "}
                  {u.isAdmin ? (
                    <Badge variant="gold" className="ml-1">
                      Admin
                    </Badge>
                  ) : null}
                </p>
                <p className="font-mono text-xs text-muted-foreground">@{u.username}</p>
              </div>
              <Button
                variant={u.isAdmin ? "outline" : "glass"}
                size="sm"
                disabled={u.id === userId || toggleAdmin.isPending}
                title={u.id === userId ? "No puedes cambiar tus propios permisos" : undefined}
                onClick={() => toggleAdmin.mutate({ id: u.id, makeAdmin: !u.isAdmin })}
              >
                {u.isAdmin ? <ShieldOff /> : <ShieldCheck />}
                {u.isAdmin ? "Quitar admin" : "Hacer admin"}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
