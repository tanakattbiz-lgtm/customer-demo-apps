import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import { useStore } from "./store";
import Layout from "./components/Layout";
import Login from "./pages/Login";

const InboxPage = lazy(() => import("./pages/Inbox"));
const InquiryDetail = lazy(() => import("./pages/InquiryDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-500">
        <Inbox size={26} className="animate-pulse" />
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
      <Route path="/" element={<Protected><InboxPage /></Protected>} />
      <Route path="/inquiry/:id" element={<Protected><InquiryDetail /></Protected>} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
