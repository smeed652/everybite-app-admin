/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSmartMenus, GET_SMART_MENUS } from '../useSmartMenus';

vi.mock('@apollo/client', async () => {
  const actual: any = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: (query: unknown) => {
      // Expect the correct query is passed
      expect(query).toBe(GET_SMART_MENUS);
      return {
        data: { widgets: [{ id: '1' }] },
        loading: false,
        error: undefined,
      };
    },
  };
});

describe('useSmartMenus hook', () => {
  it('returns widgets data from query', () => {
    const { result } = renderHook(() => useSmartMenus());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.smartMenus).toEqual([{ id: '1' }]);
  });
});
