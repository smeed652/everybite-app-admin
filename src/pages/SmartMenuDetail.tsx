import AppContent from '../layout/AppContent';
import SmartMenuPage from '../features/smartMenus/pages/SmartMenuPage';
import BasicPanel from '../features/smartMenus/components/BasicPanel';
import SyncPanel from '../features/smartMenus/components/SyncPanel';
import DesignPanel from '../features/smartMenus/components/DesignPanel';
import BrandingPanel from '../features/smartMenus/components/BrandingPanel';
import type { Widget } from '../generated/graphql';

export default function SmartMenuDetail() {
  return (
    <AppContent>
      <SmartMenuPage
        renderPanels={(widget: Widget, key: number, onChange) => (
          <>
            <BasicPanel   key={`basic-${key}`}   widget={widget} onFieldChange={onChange} />
            <SyncPanel    key={`sync-${key}`}    widget={widget} onFieldChange={onChange} />
            <DesignPanel  key={`design-${key}`}  widget={widget} onFieldChange={onChange} />
            <BrandingPanel key={`brand-${key}`} widget={widget} onFieldChange={onChange} />
          </>
        )}
      />
    </AppContent>
  );
}