import React, { useEffect } from 'react';
import { useAuth } from '../utils/auth';
import { useRouter } from '../utils/router';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
