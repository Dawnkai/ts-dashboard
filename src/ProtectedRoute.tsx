import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from './globals/utils';

interface RouteProps {
    children: ReactNode
};

export default function ProtectedRoute({children} : RouteProps) {
    return isLoggedIn() ? children : <Navigate to="/"/>;
}
