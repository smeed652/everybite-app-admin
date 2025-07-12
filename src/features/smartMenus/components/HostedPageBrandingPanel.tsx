import { useEffect, useState, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { ToggleLeft } from 'lucide-react';
import { Widget } from '../../../generated/graphql';

/* extracted section helpers */
import FontSection from './FontSection';
import LogoSection from './LogoSection';
import TitleSection from './TitleSection';
import ContentSection from './ContentSection';

interface Props {
  widget: Widget;
  onFieldChange: (changes: Partial<Widget>) => void;
}

export default function HostedPageBrandingPanel({
  widget,
  onFieldChange,
}: Props) {
  const mountedRef = useRef(false);
  /* ----- constants & shared font list -------------------------------- */
  const fonts = ['Plus Jakarta Sans', 'Inter', 'Open Sans', 'Roboto'];

  /* ----- navbar toggle ------------------------------------------------ */
  const [displayNavbar, setDisplayNavbar] = useState(!!widget.displayNavbar);

  /* ----- Font section state ------------------------------------------ */
  const [navbarFont, setNavbarFont] = useState(widget.navbarFont ?? fonts[0]);
  const [navbarFontSize, setNavbarFontSize] = useState(
    String(widget.navbarFontSize ?? '16')
  );
  const [navbarBg, setNavbarBg] = useState(
    widget.navbarBackgroundColor ?? ''
  );

  /* ----- Logo section state ------------------------------------------ */
  const [logoUrl, setLogoUrl] = useState(widget.logoUrl ?? '');
  const [logoWidth, setLogoWidth] = useState(String(widget.logoWidth ?? '120'));
  const [faviconUrl, setFaviconUrl] = useState(widget.faviconUrl ?? '');

  /* ----- Title section state ----------------------------------------- */
  const [htmlTitle, setHtmlTitle] = useState(widget.htmlTitleText ?? '');
  const [pageTitle, setPageTitle] = useState(widget.pageTitleText ?? '');
  const [pageTitleColor, setPageTitleColor] = useState(
    widget.pageTitleTextColor ?? ''
  );

  /* ----- Content section state --------------------------------------- */
  const [contentGlobalColor, setContentGlobalColor] = useState(
    widget.contentAreaGlobalColor ?? ''
  );
  const [contentHeaderColor, setContentHeaderColor] = useState(
    widget.contentAreaColumnHeaderColor ?? ''
  );
  const [categoryFont, setCategoryFont] = useState(
    widget.categoryTitleFont ?? fonts[0]
  );
  const [categoryColor, setCategoryColor] = useState(
    widget.categoryTitleTextColor ?? ''
  );

  /* ----- bubble changes up ------------------------------------------- */
  useEffect(() => {
    // skip first run on mount to avoid emitting default-diff noise
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const c: Partial<Widget> = {};

    // navbar
    if (displayNavbar !== widget.displayNavbar) c.displayNavbar = displayNavbar;
    if (navbarFont !== widget.navbarFont) c.navbarFont = navbarFont;
    if (navbarFontSize !== String(widget.navbarFontSize ?? ''))
      c.navbarFontSize = parseInt(navbarFontSize) || 0;
    if (navbarBg !== (widget.navbarBackgroundColor ?? ''))
      c.navbarBackgroundColor = navbarBg;

    // logo
    if (logoUrl !== (widget.logoUrl ?? '')) c.logoUrl = logoUrl;
    if (logoWidth !== String(widget.logoWidth ?? ''))
      c.logoWidth = parseInt(logoWidth) || 0;
    if (faviconUrl !== (widget.faviconUrl ?? '')) c.faviconUrl = faviconUrl;

    // titles
    if (htmlTitle !== (widget.htmlTitleText ?? '')) c.htmlTitleText = htmlTitle;
    if (pageTitle !== (widget.pageTitleText ?? '')) c.pageTitleText = pageTitle;
    if (pageTitleColor !== (widget.pageTitleTextColor ?? ''))
      c.pageTitleTextColor = pageTitleColor;

    // content
    if (contentGlobalColor !== (widget.contentAreaGlobalColor ?? ''))
      c.contentAreaGlobalColor = contentGlobalColor;
    if (contentHeaderColor !== (widget.contentAreaColumnHeaderColor ?? ''))
      c.contentAreaColumnHeaderColor = contentHeaderColor;
    if (categoryFont !== (widget.categoryTitleFont ?? ''))
      c.categoryTitleFont = categoryFont;
    if (categoryColor !== (widget.categoryTitleTextColor ?? ''))
      c.categoryTitleTextColor = categoryColor;

    if (Object.keys(c).length) {
      console.debug('[HostedPageBranding diff]', c);
      onFieldChange(c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    displayNavbar,
    navbarFont,
    navbarFontSize,
    navbarBg,
    logoUrl,
    logoWidth,
    faviconUrl,
    htmlTitle,
    pageTitle,
    pageTitleColor,
    contentGlobalColor,
    contentHeaderColor,
    categoryFont,
    categoryColor,
  ]);

  /* ----- JSX --------------------------------------------------------- */
  return (
    <section className="space-y-6" data-testid="hosted-page-branding-panel">
      <h3 className="text-lg font-semibold">Hosted Page Branding</h3>

      <Card className="p-4 space-y-6">
        {/* Nav-bar header & toggle */}
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ToggleLeft className="h-4 w-4" /> Navigation&nbsp;Bar
          </p>
          <Toggle checked={displayNavbar} onChange={setDisplayNavbar} />
        </div>

        {/* Always-visible sections */}
        <FontSection
          fonts={fonts}
          navbarFont={navbarFont}
          onNavbarFontChange={setNavbarFont}
          navbarFontSize={navbarFontSize}
          onNavbarFontSizeChange={setNavbarFontSize}
          navbarBg={navbarBg}
          onNavbarBgChange={setNavbarBg}
        />

        <LogoSection
          logoUrl={logoUrl}
          onLogoUrlChange={setLogoUrl}
          logoWidth={logoWidth}
          onLogoWidthChange={setLogoWidth}
          faviconUrl={faviconUrl}
          onFaviconUrlChange={setFaviconUrl}
        />

        <TitleSection
          htmlTitle={htmlTitle}
          onHtmlTitleChange={setHtmlTitle}
          pageTitle={pageTitle}
          onPageTitleChange={setPageTitle}
          pageTitleColor={pageTitleColor}
          onPageTitleColorChange={setPageTitleColor}
        />

        {/* Content section shown only when navbar is enabled */}
        {displayNavbar && (
          <ContentSection
            contentGlobalColor={contentGlobalColor}
            onGlobalColorChange={setContentGlobalColor}
            contentHeaderColor={contentHeaderColor}
            onHeaderColorChange={setContentHeaderColor}
            fonts={fonts}
            categoryFont={categoryFont}
            onCategoryFontChange={setCategoryFont}
            categoryColor={categoryColor}
            onCategoryColorChange={setCategoryColor}
          />
        )}
      </Card>
    </section>
  );
}