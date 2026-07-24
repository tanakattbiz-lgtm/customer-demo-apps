import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Spinner } from "./components/ui";
import Landing from "./pages/Landing";

const Book = lazy(() => import("./pages/Book"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));

function PageLoader() {
  return (
    <div className="grid h-screen place-items-center text-emerald-500">
      <Spinner size={26} />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/book" element={<Book />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </MotionConfig>
  );
}
