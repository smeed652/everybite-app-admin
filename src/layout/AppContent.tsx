import { ReactNode } from 'react';

/**
 * AppContent – top-level container used by every SmartMenu page.
 * • Fills the viewport (`min-h-screen`) with `flex-col`.
 * • Prevents the browser’s root scrollbar (`overflow-hidden`).
 * • Children decide their own layout; we just give them the space.
 */
interface Props {
  children: ReactNode;
  className?: string;
}

export default function AppContent({ children, className = '' }: Props) {
  return (
    <div className={`flex flex-col h-screen overflow-hidden ${className}`}>
      {children}
    </div>
  );
}