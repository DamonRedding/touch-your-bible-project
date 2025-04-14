import { AppUsageTestScreen } from '../../screens/AppUsageTestScreen';
import { ProtectedRoute } from '../../contexts/auth';

export default function AppUsageTest() {
  return (
    <ProtectedRoute>
      <AppUsageTestScreen />
    </ProtectedRoute>
  );
} 