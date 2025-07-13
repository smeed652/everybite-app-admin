import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Heading3 } from 'lucide-react';
import { ColorRow } from '../../../components/ui/ColorRow';

interface Props {
  htmlTitle: string;
  onHtmlTitleChange: (v: string) => void;
  pageTitle: string;
  onPageTitleChange: (v: string) => void;
  pageTitleColor: string;
  onPageTitleColorChange: (v: string) => void;
}

/** HTML / Page title & color. */
export default function TitleSection({
  htmlTitle,
  onHtmlTitleChange,
  pageTitle,
  onPageTitleChange,
  pageTitleColor,
  onPageTitleColorChange,
}: Props) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Heading3 className="h-4 w-4" /> Title
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">HTML Title</label>
          <Input value={htmlTitle} onChange={(e) => onHtmlTitleChange(e.target.value)} />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Page Title</label>
          <Input value={pageTitle} onChange={(e) => onPageTitleChange(e.target.value)} />
        </div>

        <ColorRow
          label="Page Title Color"
          value={pageTitleColor}
          onChange={onPageTitleColorChange}
        />
      </div>
    </Card>
  );
}

export { TitleSection };
