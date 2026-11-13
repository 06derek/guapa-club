import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: async ({ context }) => {
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/panel" });
  },
  component: () => <Outlet />,
});
