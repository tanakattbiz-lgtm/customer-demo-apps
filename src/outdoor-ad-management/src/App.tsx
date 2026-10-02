import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import FollowUps from "./pages/FollowUps";
import Deals from "./pages/Deals";
import DealDetail from "./pages/DealDetail";
import Customers from "./pages/Customers";
import Boards from "./pages/Boards";
import BoardDetail from "./pages/BoardDetail";
import Contracts from "./pages/Contracts";
import Handover from "./pages/Handover";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/follow-ups" element={<FollowUps />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/boards/:id" element={<BoardDetail />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/handover" element={<Handover />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
