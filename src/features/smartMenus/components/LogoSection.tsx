import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Image } from 'lucide-react';

interface Props {
  logoUrl: string;
  onLogoUrlChange: (v: string) => void;
  logoWidth: string;
  onLogoWidthChange: (v: string) => void;
  faviconUrl: string;
  onFaviconUrlChange: (v: string) => void;
}

/** Logo URL / width + favicon. */
export default function LogoSection({
  logoUrl,
  onLogoUrlChange,
  logoWidth,
  onLogoWidthChange,
  faviconUrl,
  onFaviconUrlChange,
}: Props) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Image aria-hidden="true" className="h-4 w-4" /> Logo
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="logo-url" className="text-sm font-medium">Logo URL</label>
          <Input id="logo-url" value={logoUrl} onChange={(e) => onLogoUrlChange(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label htmlFor="logo-width" className="text-sm font-medium">Logo width&nbsp;(px)</label>
          <Input id="logo-width" value={logoWidth} onChange={(e) => onLogoWidthChange(e.target.value)} />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="favicon-url" className="text-sm font-medium">Favicon URL</label>
          <Input id="favicon-url" value={faviconUrl} onChange={(e) => onFaviconUrlChange(e.target.value)} />
        </div>
      </div>
    </Card>
  );
}

export { LogoSection };
