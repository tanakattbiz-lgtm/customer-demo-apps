import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useStore } from "./store";
import Layout from "./components/Layout";
import Login from "./pages/Login";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const RaceDetail = lazy(() => import("./pages/RaceDetail"));
const Logs = lazy(() => import("./pages/Logs"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-500">
        <Trophy size={26} className="animate-pulse" />
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
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/races/:id" element={<Protected><RaceDetail /></Protected>} />
      <Route path="/logs" element={<Protected><Logs /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
