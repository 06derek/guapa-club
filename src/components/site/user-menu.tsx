import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, ShieldCheck, Swords, UserRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useIsAdmin, useSignOut } from "@/lib/auth";

export function UserMenu() {
  const { user, ready } = useAuth();
  const isAdmin = useIsAdmin();
  const signOut = useSignOut();

  if (!ready) return <span className="h-9 w-24" aria-hidden />;

  if (!user) {
    return (
      <Button asChild variant="gold" size="sm">
        <Link to="/login" search={{ redirect: undefined }}>
          Acceder
        </Link>
      </Button>
    );
  }

  const username = (user.user_metadata?.["username"] as string | undefined) ?? user.email ?? "";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glass" size="sm" className="font-mono" aria-label="Menú de cuenta">
          <span className="grid size-5 place-items-center rounded bg-gold/20 text-[10px] font-bold text-gold">
            {username.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden max-w-28 truncate sm:inline">{username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate font-mono text-xs">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/panel">
            <LayoutDashboard /> Mi panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/perfil">
            <UserRound /> Mi perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/equipos">
            <Swords /> Equipos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/miembros">
            <Users /> Miembros
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <ShieldCheck /> Administración
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
