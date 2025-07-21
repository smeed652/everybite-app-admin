import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTableSort } from "./useTableSort";

type Row = {
  name: string;
  age: number;
  active: boolean;
  joined: string;
};

const data: Row[] = [
  { name: "Alice", age: 30, active: true, joined: "2023-01-01" },
  { name: "Bob", age: 25, active: false, joined: "2022-12-31" },
  { name: "Charlie", age: 35, active: true, joined: "2023-01-02" },
];

describe("useTableSort", () => {
  it("initializes with default field and direction", () => {
    const { result } = renderHook(() => useTableSort<Row>("age", "asc"));
    expect(result.current.sortField).toBe("age");
    expect(result.current.sortDirection).toBe("asc");
  });

  it("handleSort toggles direction for same field", () => {
    const { result } = renderHook(() => useTableSort<Row>("age", "asc"));
    act(() => result.current.handleSort("age"));
    expect(result.current.sortDirection).toBe("desc");
    act(() => result.current.handleSort("age"));
    expect(result.current.sortDirection).toBe("asc");
  });

  it("handleSort switches field and resets direction", () => {
    const { result } = renderHook(() => useTableSort<Row>("age", "asc"));
    act(() => result.current.handleSort("name"));
    expect(result.current.sortField).toBe("name");
    expect(result.current.sortDirection).toBe("desc");
  });

  it("sortData sorts numbers", () => {
    const { result } = renderHook(() => useTableSort<Row>("age", "asc"));
    const sorted = result.current.sortData(data);
    expect(sorted.map((r) => r.age)).toEqual([25, 30, 35]);
    act(() => result.current.handleSort("age"));
    const desc = result.current.sortData(data);
    expect(desc.map((r) => r.age)).toEqual([35, 30, 25]);
  });

  it("sortData sorts strings", () => {
    const { result } = renderHook(() => useTableSort<Row>("name", "asc"));
    const sorted = result.current.sortData(data);
    expect(sorted.map((r) => r.name)).toEqual(["Alice", "Bob", "Charlie"]);
    act(() => result.current.handleSort("name"));
    const desc = result.current.sortData(data);
    expect(desc.map((r) => r.name)).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("sortData sorts booleans", () => {
    const { result } = renderHook(() => useTableSort<Row>("active", "asc"));
    const sorted = result.current.sortData(data);
    expect(sorted.map((r) => r.active)).toEqual([false, true, true]);
    act(() => result.current.handleSort("active"));
    const desc = result.current.sortData(data);
    expect(desc.map((r) => r.active)).toEqual([true, true, false]);
  });

  it("sortData sorts dates (string)", () => {
    const { result } = renderHook(() => useTableSort<Row>("joined", "asc"));
    const sorted = result.current.sortData(data);
    expect(sorted.map((r) => r.joined)).toEqual([
      "2022-12-31",
      "2023-01-01",
      "2023-01-02",
    ]);
    act(() => result.current.handleSort("joined"));
    const desc = result.current.sortData(data);
    expect(desc.map((r) => r.joined)).toEqual([
      "2023-01-02",
      "2023-01-01",
      "2022-12-31",
    ]);
  });

  it("sortData returns empty array for empty input", () => {
    const { result } = renderHook(() => useTableSort<Row>("age", "asc"));
    expect(result.current.sortData([])).toEqual([]);
  });

  it("sortData handles undefined/null values gracefully", () => {
    type RowWithNull = Row & { misc?: string | null };
    const dataWithNull: RowWithNull[] = [
      { ...data[0], misc: null },
      { ...data[1], misc: "foo" },
      { ...data[2] },
    ];
    const { result } = renderHook(() =>
      useTableSort<RowWithNull>("misc", "asc")
    );
    expect(() => result.current.sortData(dataWithNull)).not.toThrow();
  });

  it("sortData returns original order for mixed/unsupported types", () => {
    type Weird = { weird: any };
    const weirdData: Weird[] = [
      { weird: Symbol("a") },
      { weird: { foo: 1 } },
      { weird: undefined },
    ];
    const { result } = renderHook(() => useTableSort<Weird>("weird", "asc"));
    expect(result.current.sortData(weirdData)).toEqual(weirdData);
  });
});
