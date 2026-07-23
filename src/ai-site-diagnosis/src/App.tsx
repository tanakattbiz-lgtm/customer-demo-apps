import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import Analyzing from "./pages/Analyzing";
import Result from "./pages/Result";

export default function App() {
  return (
    <div className="min-h-full">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyzing" element={<Analyzing />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
    </div>
  );
}
