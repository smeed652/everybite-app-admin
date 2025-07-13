import { useState, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { ColorRow } from '../../../components/ui/ColorRow';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/Popover';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../../../components/ui/Command';
import { Check, ChevronDown, Type } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  fonts: string[];
  navbarFont: string;
  onNavbarFontChange: (v: string) => void;
  navbarFontSize: string;
  onNavbarFontSizeChange: (v: string) => void;
  navbarBg: string;
  onNavbarBgChange: (v: string) => void;
}

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32'];

/** Font family, size & navbar BG color with live preview. */
export default function FontSection({
  fonts,
  navbarFont,
  onNavbarFontChange,
  navbarFontSize,
  onNavbarFontSizeChange,
  navbarBg,
  onNavbarBgChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const previewStyle = {
    fontFamily: navbarFont || 'inherit',
    fontSize: `${parseInt(navbarFontSize || '16', 10)}px`,
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Type className="h-4 w-4" /> Font
      </div>

      {/* family + size row */}
      <div className="flex flex-wrap items-end gap-8 pl-6">
        {/* Font family */}
        <div className="space-y-1">
          <label className="text-sm font-medium block mb-1">Font&nbsp;family</label>
          <div className="relative w-60">
            <select
              value={navbarFont}
              onChange={(e) => onNavbarFontChange(e.target.value)}
              className="flex h-10 w-60 appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              style={{ fontFamily: navbarFont || 'inherit' }}
            >
              {[navbarFont, ...fonts]
                .filter(Boolean)
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Font size Combobox */}
        <div className="space-y-1">
          <label className="text-sm font-medium block mb-1">Font&nbsp;size&nbsp;(px)</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                ref={triggerRef}
                type="button"
                className="relative flex h-10 w-32 items-center justify-start rounded-md border border-gray-300 bg-white px-3 py-2 text-base font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {navbarFontSize || '—'}
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-32">
              <Command
                filter={(value: string, search: string) =>
                  search.toLowerCase().includes(value.toLowerCase()) ||
                  value.toLowerCase().includes(search.toLowerCase())
                }
              >
                <CommandInput placeholder="size…" />
                <CommandGroup className="max-h-48 overflow-auto">
                  {FONT_SIZES.map((size) => (
                    <CommandItem
                      key={size}
                      onSelect={() => {
                        onNavbarFontSizeChange(size);
                        setOpen(false);
                        setTimeout(() => triggerRef.current?.focus(), 0);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={clsx(
                          'h-3 w-3',
                          size === navbarFontSize ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {size}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* background color */}
      <ColorRow
        label="Background"
        value={navbarBg}
        onChange={onNavbarBgChange}
        indent={6}
      />

      {/* preview */}
      <p className="pl-6 text-sm pt-2" style={previewStyle}>
        The quick brown fox jumps over the lazy dog
      </p>
    </Card>
  );
}

export { FontSection };
