import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Factory } from "lucide-react";
import { useStore } from "./store";
import Layout from "./components/Layout";
import Login from "./pages/Login";

const Sheet = lazy(() => import("./pages/Sheet"));
const History = lazy(() => import("./pages/History"));
const Settings = lazy(() => import("./pages/Settings"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-500">
        <Factory size={26} className="animate-pulse" />
        <span className="text-sm text-ink-400">読み込み中…</span>
      </div>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const authed = useStore((s) => s.authed);
  if (!authed) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </Layout>
  );
}

export default function App() {
  const authed = useStore((s) => s.authed);
  return (
    <Routes>
      <Route path="/login" element={authed ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Sheet />
          </Protected>
        }
      />
      <Route
        path="/history"
        element={
          <Protected>
            <History />
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected>
            <Settings />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
