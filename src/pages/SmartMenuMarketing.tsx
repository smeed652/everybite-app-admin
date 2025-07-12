import AppContent from '../layout/AppContent';
import SmartMenuPage from '../features/smartMenus/pages/SmartMenuPage';
import MarketingPanel from '../features/smartMenus/components/MarketingPanel';
import type { Widget } from '../generated/graphql';

export default function SmartMenuMarketing() {
  return (
    <AppContent>
      <SmartMenuPage
        renderPanels={(widget: Widget, key: number, onChange) => (
          <MarketingPanel key={`marketing-${key}`} widget={widget} onFieldChange={onChange} />
        )}
      />
    </AppContent>
  );
}