import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Layout from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const ShopDetail = lazy(() => import("./pages/ShopDetail"));
const Apply = lazy(() => import("./pages/Apply"));

function PageLoader() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-500">
        <Sparkles size={26} className="animate-pulse" fill="currentColor" strokeWidth={0} />
        <span className="text-sm text-ink-400">読み込み中…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop/:id" element={<ShopDetail />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
