   import { Navigate, Outlet } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';

   export function RequireAuth() {
     const { user, loading } = useAuth();

     if (loading) {
       return (
         <div
           role="status"
           className="min-h-screen bg-bg flex items-center justify-center text-[14px] text-ink-2"
         >
           Loading
         </div>
       );
     }

     if (!user) return <Navigate to="/login" replace />;

     return <Outlet />;
   }