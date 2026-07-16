import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useStore } from "./store";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ShiftBoard from "./pages/ShiftBoard";
import Members from "./pages/Members";
import StaffApp from "./pages/StaffApp";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const authed = useStore((s) => s.authed);
  const location = useLocation();
  if (!authed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* スタッフ画面(専用シェル) */}
      <Route
        path="/staff"
        element={
          <RequireAuth>
            <StaffApp />
          </RequireAuth>
        }
      />

      {/* 管理者画面 */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/shift"
        element={
          <RequireAuth>
            <AdminLayout>
              <ShiftBoard />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/members"
        element={
          <RequireAuth>
            <AdminLayout>
              <Members />
            </AdminLayout>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
