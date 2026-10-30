   import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
   import { AuthProvider } from './context/AuthContext';
   import { FlowProvider } from './context/FlowContext';
   import { RequireAuth } from './components/RequireAuth';
   import { LandingPage } from './pages/LandingPage';
   import { LoginPage } from './pages/LoginPage';
   import { StartFlowPage } from './pages/StartFlowPage';
   import { DashboardPage } from './pages/DashboardPage';
   import { InboxPage } from './pages/InboxPage';
   import { CampaignsListPage } from './pages/CampaignsListPage';
   import { CampaignDetailPage } from './pages/CampaignDetailPage';
   import { SectionPlaceholderPage } from './pages/SectionPlaceholderPage';
   import { ComponentsPage } from './pages/ComponentsPage';
   import { AppShell } from './components/AppShell';

   export default function App() {
     return (
       <AuthProvider>
         <FlowProvider>
           <BrowserRouter>
             <Routes>
               <Route path="/" element={<LandingPage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/start" element={<StartFlowPage />} />

               <Route element={<RequireAuth />}>
                 <Route
                   path="/app"
                   element={
                     <AppShell>
                       <DashboardPage />
                     </AppShell>
                   }
                 />
                 <Route
                   path="/app/inbox"
                   element={
                     <AppShell>
                       <InboxPage />
                     </AppShell>
                   }
                 />
                 <Route
                   path="/app/inbox/:threadId"
                   element={
                     <AppShell>
                       <InboxPage />
                     </AppShell>
                   }
                 />
                 <Route
                   path="/app/campaigns"
                   element={
                     <AppShell>
                       <CampaignsListPage />
                     </AppShell>
                   }
                 />
                 <Route
                   path="/app/campaigns/:id"
                   element={
                     <AppShell>
                       <CampaignDetailPage />
                     </AppShell>
                   }
                 />
                 <Route
                   path="/app/:section"
                   element={
                     <AppShell>
                       <SectionPlaceholderPage />
                     </AppShell>
                   }
                 />
               </Route>

               <Route
                 path="/_components"
                 element={
                   <AppShell>
                     <ComponentsPage />
                   </AppShell>
                 }
               />
               {/* Any other path redirects to / */}
               <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
           </BrowserRouter>
         </FlowProvider>
       </AuthProvider>
     );
   }