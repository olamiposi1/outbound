import { useParams, useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { usePageMeta } from '../utils/usePageMeta';

const SECTION_NAME_MAP: Record<string, string> = {
  inbox: 'Inbox',
  sent: 'Sent',
  campaigns: 'Campaigns',
  profile: 'Business profile',
  targeting: 'Targeting',
  messages: 'Messages',
  schedule: 'Sending schedule',
  mailboxes: 'Mailboxes and domains',
  suppression: 'Suppression list',
  integrations: 'Integrations',
  billing: 'Billing',
};

export function SectionPlaceholderPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const formattedName =
    (section && SECTION_NAME_MAP[section.toLowerCase()]) ||
    (section ? section.charAt(0).toUpperCase() + section.slice(1) : 'Section');

  usePageMeta(formattedName, `${formattedName} section placeholder`);

  return (
    <div className="flex flex-col gap-6 text-left py-4">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-[28px] font-semibold text-ink tracking-tight">
          {formattedName}
        </h1>
        <p className="text-[14px] text-ink-2 leading-relaxed">
          Application management section.
        </p>
      </div>

      <EmptyState
        title={`${formattedName} isn't built in this preview.`}
        description="This section is part of the full application and is not included in this preview prototype. You can inspect active campaigns and lead performance on the overview dashboard."
        secondaryAction={{
          label: 'Back to overview',
          onClick: () => navigate('/app'),
        }}
      />
    </div>
  );
}
