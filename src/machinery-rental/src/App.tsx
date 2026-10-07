import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Footer, Header } from "./components/Layout";
import { Skeleton } from "./components/ui";
import Home from "./pages/Home";

/* 初期表示を軽くするため、トップ以外は遅延読み込みする */
const Rental = lazy(() => import("./pages/Rental"));
const MachineDetail = lazy(() => import("./pages/MachineDetail"));
const Ict = lazy(() => import("./pages/Ict"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Overview = lazy(() => import("./pages/Overview"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Recruit = lazy(() => import("./pages/Recruit"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** ページ遷移時にスクロール位置を戻す(#アンカーがある場合はそこへ) */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12">
      <Skeleton className="mb-5 h-3 w-24" />
      <Skeleton className="mb-8 h-9 w-72" />
      <Skeleton className="mb-16 h-3 w-full max-w-xl" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ScrollManager />
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rental" element={<Rental />} />
              <Route path="/rental/:id" element={<MachineDetail />} />
              <Route path="/ictmachine" element={<Ict />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/recruit" element={<Recruit />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "var(--font-sans)",
            borderRadius: "2px",
            fontSize: "13px",
          },
        }}
      />
    </HashRouter>
  );
}
