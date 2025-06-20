import { useState } from 'react';
import { Widget } from '../../../generated/graphql';
import { Card } from '../../../components/ui/Card';
import { Mail, ThumbsUp, SearchX, ExternalLink } from 'lucide-react';

export interface MarketingPanelProps {
  widget: Widget;
  /** callback with changed fields */
  onFieldChange: (changes: Record<string, unknown>) => void;
}

// Simple toggle switch component reused across panels
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function MarketingPanel({ widget, onFieldChange }: MarketingPanelProps) {
  // Individual CTA enable toggles. Fallback to false if field missing.
  const [softSignup, setSoftSignup] = useState<boolean>((widget as Widget).displaySoftSignUp ?? false);
  const [notifyMe, setNotifyMe] = useState<boolean>((widget as Widget).displayNotifyMeBanner ?? false);
  const [giveFeedback, setGiveFeedback] = useState<boolean>((widget as Widget).displayGiveFeedbackBanner ?? false);
  const [feedbackButton, setFeedbackButton] = useState<boolean>((widget as Widget).displayFeedbackButton ?? false);
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
    <section className="space-y-6" data-testid="marketing-panel">
      <h3 className="text-lg font-semibold">Call to Actions (CTA)</h3>
      {/* Soft Sign-Up banner */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4" />Soft Signup: Save preferences banner
          </p>
          <p className="text-sm text-muted-foreground">
            Appears when a user applies preferences. Captures email.
          </p>
        </div>
        <Toggle checked={softSignup} onChange={makeHandler(setSoftSignup, 'displaySoftSignUp')} />
      </Card>

      {/* No Results banner */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <SearchX className="h-4 w-4" />Email Signup CTA: No Results banner
          </p>
          <p className="text-sm text-muted-foreground">
            Appears when search returns no results. Captures email.
          </p>
        </div>
        <Toggle checked={notifyMe} onChange={makeHandler(setNotifyMe, 'displayNotifyMeBanner')} />
      </Card>

      {/* Give Feedback banner */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <ThumbsUp className="h-4 w-4" />Email Signup CTA: Give Feedback banner
          </p>
          <p className="text-sm text-muted-foreground">
            Appears at bottom of scrolled page. Captures feedback and email.
          </p>
        </div>
        <Toggle checked={giveFeedback} onChange={makeHandler(setGiveFeedback, 'displayGiveFeedbackBanner')} />
      </Card>

      {/* Persistent Feedback button */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <ExternalLink className="h-4 w-4" />Link to EveryBite: Dish Detail modal
          </p>
          <p className="text-sm text-muted-foreground">
            Appears on dish detail modal. Links users to EveryBite main app.
          </p>
        </div>
        <Toggle checked={dishDetail} onChange={makeHandler(setDishDetail, 'displayDishDetailsLink')} />
      </Card>

      {/* Feedback floating button */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <ThumbsUp className="h-4 w-4" />Floating Feedback Button
          </p>
          <p className="text-sm text-muted-foreground">
            Persistent button that opens feedback modal. Captures feedback and email.
          </p>
        </div>
        <Toggle checked={feedbackButton} onChange={makeHandler(setFeedbackButton, 'displayFeedbackButton')} />
      </Card>
    </section>
  );
}
