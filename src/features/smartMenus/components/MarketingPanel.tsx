import { useState } from 'react';
import { Widget } from '../../../generated/graphql';
import { Mail, ThumbsUp, SearchX, ExternalLink } from 'lucide-react';
import { SettingToggle } from '../../../components/ui/SettingToggle';
import { Panel } from '../../../components/ui/Panel';

export interface MarketingPanelProps {
  widget: Widget;
  /** callback with changed fields */
  onFieldChange: (changes: Record<string, unknown>) => void;
}

export default function MarketingPanel({ widget, onFieldChange }: MarketingPanelProps) {
  // Individual CTA enable toggles. Fallback to false if field missing.
  const [softSignup, setSoftSignup] = useState<boolean>((widget as Widget).displaySoftSignUp ?? false);
  const [notifyMe, setNotifyMe] = useState<boolean>((widget as Widget).displayNotifyMeBanner ?? false);
  const [giveFeedback, setGiveFeedback] = useState<boolean>((widget as Widget).displayGiveFeedbackBanner ?? false);

  const [dishDetail, setDishDetail] = useState<boolean>((widget as Widget).displayDishDetailsLink ?? false);

  // helper to wire toggle -> state + dirty
  const makeHandler = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    key: keyof Widget
  ) => (val: boolean) => {
    setter(val);
    onFieldChange({ [key]: val });
  };
  
    

  return (
    <Panel title="Call to Actions (CTA)" data-testid="marketing-panel">
      {/* Soft Sign-Up banner */}
      <SettingToggle
        icon={<Mail className="h-4 w-4" />}
        title="Soft Signup: Save preferences banner"
        description="Appears when a user applies preferences. Captures email."
        checked={softSignup}
        onChange={makeHandler(setSoftSignup, 'displaySoftSignUp')}
      />

      {/* No Results banner */}
      <SettingToggle
        icon={<SearchX className="h-4 w-4" />}
        title="Email Signup CTA: No Results banner"
        description="Appears when search returns no results. Captures email."
        checked={notifyMe}
        onChange={makeHandler(setNotifyMe, 'displayNotifyMeBanner')}
      />

      {/* Give Feedback banner */}
      <SettingToggle
        icon={<ThumbsUp className="h-4 w-4" />}
        title="Email Signup CTA: Give Feedback banner"
        description="Appears at bottom of scrolled page. Captures feedback and email."
        checked={giveFeedback}
        onChange={makeHandler(setGiveFeedback, 'displayGiveFeedbackBanner')}
      />

      {/* Persistent Feedback button */}
      <SettingToggle
        icon={<ExternalLink className="h-4 w-4" />}
        title="Link to EveryBite: Dish Detail modal"
        description="Appears on dish detail modal. Links users to EveryBite main app."
        checked={dishDetail}
        onChange={makeHandler(setDishDetail, 'displayDishDetailsLink')}
      />


    </Panel>
  );
}

export { MarketingPanel };
