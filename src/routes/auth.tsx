import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Puente Venezuela y Colombia" },
      { name: "description", content: "Inicia sesión para actualizar el estado de los reportes de ayuda." },
      { property: "og:title", content: "Iniciar sesión — Puente Venezuela y Colombia" },
      { property: "og:description", content: "Accede para coordinar y actualizar reportes de ayuda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/map" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/map` },
        });
        if (error) throw error;
        toast.success(es ? "Revisa tu correo para confirmar la cuenta." : "Check your email to confirm your account.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-sm px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {mode === "in" ? (es ? "Iniciar sesión" : "Sign in") : es ? "Crear cuenta" : "Create account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {es
            ? "Necesitas una cuenta para cambiar el estado de un reporte."
            : "You need an account to change a report's status."}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{es ? "Contraseña" : "Password"}</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "in" ? (es ? "Entrar" : "Sign in") : es ? "Registrarme" : "Sign up"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm text-primary underline"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
        >
          {mode === "in" ? (es ? "¿No tienes cuenta? Regístrate" : "No account? Sign up") : es ? "¿Ya tienes cuenta? Entra" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
