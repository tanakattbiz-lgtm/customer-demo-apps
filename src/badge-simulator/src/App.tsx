import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Designs from "./pages/Designs";
import Editor from "./pages/Editor";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Designs />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
