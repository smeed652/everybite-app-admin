import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastProvider';
import React from 'react';

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function Demo() {
    const { showToast } = useToast();
    React.useEffect(() => {
      showToast({ title: 'Saved!' });
    }, [showToast]);
    return null;
  }

  it('shows toast on showToast call', async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    vi.advanceTimersByTime(0);
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('auto-dismisses after duration', async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>,
    );
    vi.advanceTimersByTime(0);
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  });
});
