import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Anchor } from "lucide-react";
import { useStore } from "./store/useStore";
import Layout from "./components/Layout";
import Login from "./pages/Login";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Voyages = lazy(() => import("./pages/Voyages"));
const VoyageDetail = lazy(() => import("./pages/VoyageDetail"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Staff = lazy(() => import("./pages/Staff"));
const Settings = lazy(() => import("./pages/Settings"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-500">
        <Anchor size={26} className="animate-pulse" />
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
    <HashRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={authed ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/voyages" element={<Protected><Voyages /></Protected>} />
        <Route path="/voyages/:id" element={<Protected><VoyageDetail /></Protected>} />
        <Route path="/alerts" element={<Protected><Alerts /></Protected>} />
        <Route path="/staff" element={<Protected><Staff /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
