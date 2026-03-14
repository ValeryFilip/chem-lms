import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getMe } from "../../lib/api";
import type { MeResponse } from "../../lib/types";

export default function AdminRoute() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        setIsUnauthorized(true);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Checking admin access...</div>;
  }

  if (isUnauthorized) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}