import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";

import { AppShell } from "../AppShell";
import { useAuth } from "../../features/auth/AuthProvider";
import { OwnerChartDetail } from "../../features/charts/OwnerChartDetail";

export function ChartDetailPage() {
  const { chartId } = useParams();
  const { currentUser, isAuthLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isAuthLoading) {
    return (
      <AppShell>
        <Spinner color="brand.500" />
      </AppShell>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppShell>
      <OwnerChartDetail
        chartId={chartId ?? null}
        currentUserUid={currentUser.uid}
        onClose={() => navigate("/charts")}
        onOpenShare={() => navigate(`/charts/${chartId}/share`)}
      />
    </AppShell>
  );
}
