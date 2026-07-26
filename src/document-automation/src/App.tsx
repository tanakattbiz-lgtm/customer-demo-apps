import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "./components/Layout";

const Import = lazy(() => import("./pages/Import"));
const Documents = lazy(() => import("./pages/Documents"));
const Labels = lazy(() => import("./pages/Labels"));

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
          <Route path="/" element={<Import />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/labels" element={<Labels />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
