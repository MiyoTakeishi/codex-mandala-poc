import { Navigate, Route, Routes } from "react-router-dom";

import { ChartDetailPage } from "./pages/ChartDetailPage";
import { ChartListPage } from "./pages/ChartListPage";
import { ChartShareSettingsPage } from "./pages/ChartShareSettingsPage";
import { ErrorPage } from "./pages/ErrorPage";
import { GuidePage } from "./pages/GuidePage";
import { LoginPage } from "./pages/LoginPage";
import { SharedChartPage } from "../features/share/SharedChartPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/charts" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/charts" element={<ChartListPage />} />
      <Route path="/charts/:chartId" element={<ChartDetailPage />} />
      <Route path="/charts/:chartId/share" element={<ChartShareSettingsPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/share/:token" element={<SharedChartPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
