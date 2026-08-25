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
const Simulator = lazy(() => import("./pages/Simulator"));
const Cart = lazy(() => import("./pages/Cart"));
const MyPage = lazy(() => import("./pages/MyPage"));
const Company = lazy(() => import("./pages/Company"));
const Contact = lazy(() => import("./pages/Contact"));
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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Skeleton className="mb-4 h-8 w-56" />
      <Skeleton className="mb-10 h-4 w-80" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
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
              <Route path="/ict" element={<Ict />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/company" element={<Company />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: { fontFamily: "var(--font-sans)", borderRadius: "14px" },
        }}
      />
    </HashRouter>
  );
}
