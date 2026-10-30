import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FlowProvider } from './context/FlowContext';
import { LandingPage } from './pages/LandingPage';
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
    <FlowProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/start" element={<StartFlowPage />} />
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
  );
}
