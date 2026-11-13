import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/site/auth-shell";
import { authErrorMessage, loginSchema, safeRedirect, type LoginInput } from "@/lib/auth-rules";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Iniciar sesión · GUAPA FES Acatlán" },
      { name: "description", content: "Accede a tu cuenta de miembro de GUAPA." },
      { property: "og:title", content: "Iniciar sesión · GUAPA" },
      { property: "og:description", content: "Accede a tu cuenta de miembro de GUAPA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setFormError(authErrorMessage(error.message));
      return;
    }
    navigate({ to: safeRedirect(search.redirect), replace: true });
  }

  return (
    <AuthShell
      eyebrow="miembros"
      title="Inicia sesión"
      subtitle="Usa tu correo institucional de la UNAM."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-gold hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-1.5" {...register("email")} />
          <FieldError message={formState.errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1.5"
            {...register("password")}
          />
          <FieldError message={formState.errors.password?.message} />
        </div>
        {formError ? (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}
