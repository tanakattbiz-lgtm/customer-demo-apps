import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useStore } from "./store";
import AdminLayout from "./components/AdminLayout";
import StaffShell from "./components/StaffShell";
import Login from "./pages/Login";

const StaffHome = lazy(() => import("./pages/staff/StaffHome"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const DailyChecks = lazy(() => import("./pages/admin/DailyChecks"));
const AuditLog = lazy(() => import("./pages/admin/AuditLog"));
const Vehicles = lazy(() => import("./pages/admin/Vehicles"));
const Insurance = lazy(() => import("./pages/admin/Insurance"));

function RequireRole({
  role,
  children,
}: {
  role: "staff" | "admin";
  children: React.ReactNode;
}) {
  const authed = useStore((s) => s.authed);
  const currentRole = useStore((s) => s.role);
  if (!authed) return <Navigate to="/login" replace />;
  if (currentRole !== role) {
    return <Navigate to={currentRole === "admin" ? "/" : "/staff"} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/staff"
          element={
            <RequireRole role="staff">
              <StaffShell>
                <StaffHome />
              </StaffShell>
            </RequireRole>
          }
        />

        <Route
          path="/"
          element={
            <RequireRole role="admin">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </RequireRole>
          }
        />
        <Route
          path="/daily-checks"
          element={
            <RequireRole role="admin">
              <AdminLayout>
                <DailyChecks />
              </AdminLayout>
            </RequireRole>
          }
        />
        <Route
          path="/audit-log"
          element={
            <RequireRole role="admin">
              <AdminLayout>
                <AuditLog />
              </AdminLayout>
            </RequireRole>
          }
        />
        <Route
          path="/vehicles"
          element={
            <RequireRole role="admin">
              <AdminLayout>
                <Vehicles />
              </AdminLayout>
            </RequireRole>
          }
        />
        <Route
          path="/insurance"
          element={
            <RequireRole role="admin">
              <AdminLayout>
                <Insurance />
              </AdminLayout>
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
