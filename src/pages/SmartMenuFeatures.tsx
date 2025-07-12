import AppContent from '../layout/AppContent';
import SmartMenuPage from '../features/smartMenus/pages/SmartMenuPage';
import FeaturesPanel from '../features/smartMenus/components/FeaturesPanel';
import type { Widget } from '../generated/graphql';

export default function SmartMenuFeatures() {
  return (
    <AppContent>
      <SmartMenuPage
        renderPanels={(widget: Widget, key: number, onChange) => (
          <FeaturesPanel key={`features-${key}`} widget={widget} onFieldChange={onChange} />
        )}
      />
    </AppContent>
  );
}