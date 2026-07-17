import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Simulators } from "./pages/Simulators";
import { SimulatorPage } from "./pages/SimulatorPage";
import { Experts } from "./pages/Experts";
import { ExpertDetail } from "./pages/ExpertDetail";
import { MyPage } from "./pages/MyPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/simulators" element={<Simulators />} />
          <Route path="/simulators/:type" element={<SimulatorPage />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/experts/:id" element={<ExpertDetail />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </HashRouter>
  );
}
