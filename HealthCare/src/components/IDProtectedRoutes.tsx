import type React from "react";
import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

interface IDProtectedRouteProps {
  children: ReactNode;
  AllowedRoles: string[];
}

const IDProtectedRoutes: React.FC<IDProtectedRouteProps> = ({
  children,
  AllowedRoles,
}) => {
  const Token = sessionStorage.getItem("AUTH_TOKEN");
  const { id } = useParams();

  if (!Token) return <Navigate to="/" replace />;

  let Role: string;
  let UserID: string;

  try {
    const payload = Token.split(".")[1];
    const decoded = atob(payload);
    const parsed = JSON.parse(decoded);

    Role = parsed.role;
    UserID = String(parsed.id);
  } catch (err) {
    sessionStorage.removeItem("AUTH_TOKEN");
    return <Navigate to="/" replace />;
  }

  if (!AllowedRoles.includes(Role)) {
    alert("You do not have permission to access this page.");
    return <Navigate to="/" replace />;
  }

  if (String(id) !== UserID) {
    alert("You cannot access another user's page.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default IDProtectedRoutes;
