import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/site/auth-shell";
import { authErrorMessage, registerSchema, type RegisterInput } from "@/lib/auth-rules";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta · GUAPA FES Acatlán" },
      { name: "description", content: "Regístrate en GUAPA con tu correo institucional de la UNAM." },
      { property: "og:title", content: "Crear cuenta · GUAPA" },
      { property: "og:description", content: "Regístrate en GUAPA con tu correo institucional de la UNAM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { register, handleSubmit, formState, setError } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const { data: available, error: rpcError } = await supabase.rpc("username_available", {
      _username: values.username,
    });
    if (rpcError) {
      setFormError("No se pudo verificar el nombre de usuario. Intenta de nuevo.");
      return;
    }
    if (!available) {
      setError("username", { message: "Ese nombre de usuario ya está en uso" });
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/panel`,
        data: { full_name: values.fullName.trim(), username: values.username.trim() },
      },
    });
    if (error) {
      setFormError(authErrorMessage(error.message));
      return;
    }
    setSentTo(values.email.trim());
  }

  if (sentTo) {
    return (
      <AuthShell eyebrow="registro" title="Revisa tu correo">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-full bg-success/15 text-success">
            <MailCheck className="size-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">
            Enviamos un enlace de confirmación a <span className="font-medium text-foreground">{sentTo}</span>.
            Ábrelo para activar tu cuenta y después inicia sesión.
          </p>
          <Button asChild variant="glass" className="mt-6">
            <Link to="/login" search={{ redirect: undefined }}>
              Ir a iniciar sesión
            </Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="registro"
      title="Únete a GUAPA"
      subtitle="Solo se aceptan correos institucionales de la UNAM."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" search={{ redirect: undefined }} className="font-medium text-gold hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input id="fullName" autoComplete="name" className="mt-1.5" {...register("fullName")} />
          <FieldError message={formState.errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="username">Nombre de usuario</Label>
          <Input id="username" autoComplete="username" className="mt-1.5 font-mono" {...register("username")} />
          <FieldError message={formState.errors.username?.message} />
        </div>
        <div>
          <Label htmlFor="email">Correo UNAM</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu.nombre@pcpuma.acatlan.unam.mx"
            className="mt-1.5"
            {...register("email")}
          />
          <FieldError message={formState.errors.email?.message} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="new-password" className="mt-1.5" {...register("password")} />
            <FieldError message={formState.errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirmar</Label>
            <Input id="confirm" type="password" autoComplete="new-password" className="mt-1.5" {...register("confirm")} />
            <FieldError message={formState.errors.confirm?.message} />
          </div>
        </div>
        {formError ? (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
          Crear cuenta
        </Button>
      </form>
    </AuthShell>
  );
}
