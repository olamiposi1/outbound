   import { useState, type FormEvent } from 'react';
   import { Link, Navigate, useNavigate } from 'react-router-dom';
   import { supabase } from '../lib/supabase';
   import { useAuth } from '../context/AuthContext';
   import { usePageMeta } from '../utils/usePageMeta';
   import { Button } from '../components/Button';
   import { Input } from '../components/Input';

   type Mode = 'signin' | 'signup';

   export function LoginPage() {
     usePageMeta('Sign in', 'Sign in or create an account');
     const navigate = useNavigate();
     const { user, loading } = useAuth();
     const [mode, setMode] = useState<Mode>('signin');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [submitting, setSubmitting] = useState(false);
     const [error, setError] = useState('');
     const [notice, setNotice] = useState('');

     if (!loading && user) return <Navigate to="/app" replace />;

     const isSignup = mode === 'signup';

     function switchMode() {
       setMode(isSignup ? 'signin' : 'signup');
       setError('');
       setNotice('');
     }

     async function handleSubmit(e: FormEvent) {
       e.preventDefault();
       setError('');
       setNotice('');
       if (password.length < 8) {
         setError('Use a password with at least 8 characters.');
         return;
       }
       setSubmitting(true);
       try {
         if (isSignup) {
           const { data, error: signUpError } = await supabase.auth.signUp({
             email: email.trim(),
             password,
           });
           if (signUpError) throw signUpError;
           if (data.session) {
             navigate('/app', { replace: true });
           } else {
             setNotice('Check your email to confirm your account, then sign in.');
             setMode('signin');
           }
         } else {
           const { error: signInError } = await supabase.auth.signInWithPassword({
             email: email.trim(),
             password,
           });
           if (signInError) throw signInError;
           navigate('/app', { replace: true });
         }
       } catch (err) {
         setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
       } finally {
         setSubmitting(false);
       }
     }

     return (
       <div className="min-h-screen bg-bg flex flex-col">
         <header className="px-6 py-4 border-b border-border">
           <Link to="/" className="text-[14px] text-ink-2 hover:text-ink transition-colors">
             Back to site
           </Link>
         </header>
         <main className="flex-1 flex items-start justify-center px-4 py-12">
           <div className="w-full max-w-[400px] bg-surface border border-border rounded-[12px] p-6 flex flex-col gap-5">
             <div className="flex flex-col gap-1">
               <h1 className="text-[28px] font-semibold text-ink tracking-tight">
                 {isSignup ? 'Create your account' : 'Sign in'}
               </h1>
               <p className="text-[14px] text-ink-2">
                 {isSignup
                   ? 'Use your email and a password.'
                   : 'Welcome back. Enter your details to continue.'}
               </p>
             </div>

             <form onSubmit={handleSubmit} className="flex flex-col gap-4">
               <Input
                 label="Email"
                 type="email"
                 autoComplete="email"
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
               <Input
                 label="Password"
                 type="password"
                 autoComplete={isSignup ? 'new-password' : 'current-password'}
                 required
                 helperText={isSignup ? 'At least 8 characters.' : undefined}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
               />

               {error && (
                 <p role="alert" className="text-[13px] text-danger">
                   {error}
                 </p>
               )}
               {notice && (
                 <p role="status" className="text-[13px] text-ink-2">
                   {notice}
                 </p>
               )}

               <Button type="submit" isLoading={submitting} className="w-full">
                 {isSignup ? 'Create account' : 'Sign in'}
               </Button>
             </form>

             <p className="text-[14px] text-ink-2">
               {isSignup ? 'Already have an account?' : 'New here?'}{' '}
               <button
                 type="button"
                 onClick={switchMode}
                 className="text-primary hover:text-primary-hover font-medium cursor-pointer"
               >
                 {isSignup ? 'Sign in' : 'Create an account'}
               </button>
             </p>
           </div>
         </main>
       </div>
     );
   }