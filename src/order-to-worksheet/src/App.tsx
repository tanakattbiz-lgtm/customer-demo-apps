import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "./components/Layout";

const Convert = lazy(() => import("./pages/Convert"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={22} className="animate-spin text-brand-500" />
        <span className="text-xs text-ink-400">読み込み中…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Convert />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
