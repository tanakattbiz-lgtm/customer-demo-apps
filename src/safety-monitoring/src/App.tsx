import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import Layout from "./components/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Monitors = lazy(() => import("./pages/Monitors"));
const Alerts = lazy(() => import("./pages/Alerts"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-teal-600">
        <HeartPulse size={26} className="animate-pulse" />
        <span className="text-sm text-slate-400">読み込み中…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitors" element={<Monitors />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
