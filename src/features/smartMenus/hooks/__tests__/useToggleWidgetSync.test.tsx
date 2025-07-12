/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToggleWidgetSync } from '../useToggleWidgetSync';

// Capture the mutate call args
const mutateSpy = vi.fn();

vi.mock('@apollo/client', async () => {
  const actual: any = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useApolloClient: () => ({ mutate: mutateSpy }),
  };
});

describe('useToggleWidgetSync hook', () => {
  it('calls mutate with correct variables and optimistic response', async () => {
    const { result } = renderHook(() => useToggleWidgetSync());

    await result.current.toggleWidgetSync('abc', true);

    expect(mutateSpy).toHaveBeenCalledTimes(1);
    const call = mutateSpy.mock.calls[0][0];
    expect(call.variables).toEqual({ id: 'abc' });
    expect(call.optimisticResponse).toMatchObject({
      activateWidgetSync: {
        id: 'abc',
        isSyncEnabled: true,
      },
    });
  });

  it('uses deactivate mutation when enable is false', async () => {
    mutateSpy.mockClear();
    const { result } = renderHook(() => useToggleWidgetSync());
    await result.current.toggleWidgetSync('xyz', false);
    const call = mutateSpy.mock.calls[0][0];
    expect(call.optimisticResponse).toMatchObject({
      deactivateWidgetSync: {
        id: 'xyz',
        isSyncEnabled: false,
      },
    });
  });
});
