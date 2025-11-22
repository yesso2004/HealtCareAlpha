import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  AllowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  AllowedRoles,
}) => {
  const Token = sessionStorage.getItem("AUTH_TOKEN");
  if (!Token) return <Navigate to="/" replace />;

  let role: string;
  try {
    const payload = Token.split(".")[1];
    const decodedPayload = atob(payload);
    role = JSON.parse(decodedPayload).role;
  } catch {
    sessionStorage.removeItem("AUTH_TOKEN");
    return <Navigate to="/" replace />;
  }

  if (!AllowedRoles.includes(role)) {
    sessionStorage.removeItem("AUTH_TOKEN");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
