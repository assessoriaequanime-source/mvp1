/**
 * PrivateRoute - Protege rotas autenticadas
 * Redireciona para /connect se não estiver autenticado
 */

import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
}
