import { Route, Routes } from "react-router-dom";
import { AdminPage } from "@/pages/AdminPage";
import { StandingsPage } from "@/pages/StandingsPage";
import { TablePage } from "@/pages/TablePage";
import { VisualizationPage } from "@/pages/VisualizationPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VisualizationPage />} />
      <Route path="/table" element={<TablePage />} />
      <Route path="/standings" element={<StandingsPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
