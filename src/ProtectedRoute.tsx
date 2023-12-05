import { ReactNode } from 'react';

interface RouteProps {
    children: ReactNode
};

export default function ProtectedRoute({children} : RouteProps) {
    return children;
}
