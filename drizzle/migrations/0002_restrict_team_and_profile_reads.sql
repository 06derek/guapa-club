DROP POLICY IF EXISTS "Equipos visibles con sesión" ON public.teams;
CREATE POLICY "Equipos visibles para integrantes y admins" ON public.teams FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_team_member(id, auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Integrantes visibles con sesión" ON public.team_members;
CREATE POLICY "Integrantes visibles para su equipo y admins" ON public.team_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_team_member(team_id, auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Signed-in users can view profiles" ON public.profiles;
CREATE POLICY "Perfiles activos, propio o admin" ON public.profiles FOR SELECT TO authenticated
  USING (
    is_active
    OR id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );