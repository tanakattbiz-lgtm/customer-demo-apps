import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "./components/Layout";

const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
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

/** 案件を切り替えたときにフォームの入力状態を持ち越さないよう、id ごとに再マウントする */
function KeyedJobDetail() {
  const { id } = useParams();
  return <JobDetail key={id ?? "new"} />;
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs/new" element={<KeyedJobDetail />} />
          <Route path="/jobs/:id" element={<KeyedJobDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
