import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/auth';

export default function HomeLayout() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    />
  );
} 