import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Scale } from "lucide-react";
import { useStore } from "./store/useStore";
import Layout from "./components/Layout";
import Login from "./pages/Login";

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Matters = lazy(() => import("./pages/Matters"));
const Clients = lazy(() => import("./pages/Clients"));
const Chat = lazy(() => import("./pages/Chat"));
const Billing = lazy(() => import("./pages/Billing"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-500">
        <Scale size={28} className="animate-pulse" />
        <span className="text-sm text-ink-400">読み込み中…</span>
      </div>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const authed = useStore((s) => s.authed);
  if (!authed) return <Navigate to="/lp" replace />;
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </Layout>
  );
}

function Public({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  );
}

export default function App() {
  const authed = useStore((s) => s.authed);
  return (
    <HashRouter>
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        <Route path="/lp" element={<Public><Landing /></Public>} />
        <Route
          path="/login"
          element={authed ? <Navigate to="/" replace /> : <Login />}
        />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/matters" element={<Protected><Matters /></Protected>} />
        <Route path="/clients" element={<Protected><Clients /></Protected>} />
        <Route path="/chat" element={<Protected><Chat /></Protected>} />
        <Route path="/billing" element={<Protected><Billing /></Protected>} />
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
