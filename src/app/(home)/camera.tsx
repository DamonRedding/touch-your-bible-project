import { ProtectedRoute } from '../../contexts/auth';
import BibleCameraView from '../../components/CameraView';
import { Redirect } from 'expo-router';

export default function Camera() {
  return (
    <ProtectedRoute fallback={<Redirect href="/(auth)/sign-in" />}>
      <BibleCameraView />
    </ProtectedRoute>
  );
} 