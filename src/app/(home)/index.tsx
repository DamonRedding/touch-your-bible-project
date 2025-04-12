import { ProtectedRoute } from '../../contexts/auth';
import DashboardScreen from '../../screens/DashboardScreen';
import { Redirect } from 'expo-router';

export default function Home() {
  return (
    <ProtectedRoute fallback={<Redirect href="/(auth)/sign-in" />}>
      <DashboardScreen />
    </ProtectedRoute>
  );
} 