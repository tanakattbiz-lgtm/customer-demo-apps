import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Coffee } from "lucide-react";
import { useStore } from "./store";
import Layout from "./components/Layout";
import Login from "./pages/Login";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const StaffPage = lazy(() => import("./pages/Staff"));
const Tip = lazy(() => import("./pages/Tip"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-500">
        <Coffee size={26} className="animate-pulse" />
        <span className="text-sm text-ink-400">読み込み中…</span>
      </div>
    </div>
  );
}

function Protected({ children }: { children: ReactNode }) {
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
      <Route path="/staff" element={<Protected><StaffPage /></Protected>} />
      {/* お客様用のチップ受付画面(QR アクセス想定・認証なし) */}
      <Route
        path="/tip"
        element={
          <Suspense fallback={<PageLoader />}>
            <Tip />
          </Suspense>
        }
      />
      <Route
        path="/tip/:staffId"
        element={
          <Suspense fallback={<PageLoader />}>
            <Tip />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
