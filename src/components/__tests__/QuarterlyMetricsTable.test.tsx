import { render, screen } from "@testing-library/react";
import { QuarterlyMetricsTable } from "../QuarterlyMetricsTable";

const mockData = [
  {
    quarter: "Q4 2024",
    brands: 45,
    locations: 1200,
    activeSmartMenus: 38,
    orders: 5000,
  },
  {
    quarter: "Q3 2024",
    brands: 38,
    locations: 980,
    activeSmartMenus: 32,
    orders: 4000,
  },
  {
    quarter: "Q2 2024",
    brands: 32,
    locations: 750,
    activeSmartMenus: 28,
    orders: 3000,
  },
  {
    quarter: "Q1 2024",
    brands: 25,
    locations: 520,
    activeSmartMenus: 22,
    orders: 2000,
  },
];

describe("QuarterlyMetricsTable", () => {
  it("renders the table with data", () => {
    render(<QuarterlyMetricsTable data={mockData} />);

    expect(screen.getByText("Quarterly Growth Metrics")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Year-over-year business performance for investment reporting"
      )
    ).toBeInTheDocument();

    // Check for quarter headers
    expect(screen.getByText("Q4 2024")).toBeInTheDocument();
    expect(screen.getByText("Q3 2024")).toBeInTheDocument();
    expect(screen.getByText("Q2 2024")).toBeInTheDocument();
    expect(screen.getByText("Q1 2024")).toBeInTheDocument();

    // Check for metric values
    expect(screen.getByText("38")).toBeInTheDocument(); // Q4 brands (activeSmartMenus)
    expect(screen.getByText("1,200")).toBeInTheDocument(); // Q4 locations
    expect(screen.getByText("5,000")).toBeInTheDocument(); // Q4 orders
  });

  it("calculates and displays growth percentages correctly", () => {
    render(<QuarterlyMetricsTable data={mockData} />);

    // Q4 vs Q3 growth calculations:
    // Brands: (38-32)/32 = +18.8%
    // Locations: (1200-980)/980 = +22.4%
    // Orders: (5000-4000)/4000 = +25.0%

    expect(screen.getByText("+18.8%")).toBeInTheDocument();
    expect(screen.getByText("+22.4%")).toBeInTheDocument();
    expect(screen.getByText("+25.0%")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<QuarterlyMetricsTable data={[]} loading={true} />);

    // Should show skeleton elements
    const skeletons = screen.getAllByRole("status");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows error state", () => {
    const errorMessage = "Failed to load quarterly data";
    render(<QuarterlyMetricsTable data={[]} error={errorMessage} />);

    expect(
      screen.getByText("Failed to load quarterly metrics")
    ).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<QuarterlyMetricsTable data={[]} />);

    expect(screen.getByText("No quarterly data available")).toBeInTheDocument();
  });

  it("handles single quarter data", () => {
    const singleQuarterData = [mockData[0]];
    render(<QuarterlyMetricsTable data={singleQuarterData} />);

    expect(screen.getByText("Q4 2024")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument(); // brands (activeSmartMenus)
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("5,000")).toBeInTheDocument(); // orders

    // Should show dashes for growth since there's no previous quarter
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("handles declining metrics", () => {
    const decliningData = [
      {
        quarter: "Q4 2024",
        brands: 35,
        locations: 800,
        activeSmartMenus: 25,
        orders: 3000,
      },
      {
        quarter: "Q3 2024",
        brands: 42,
        locations: 950,
        activeSmartMenus: 30,
        orders: 3500,
      },
    ];

    render(<QuarterlyMetricsTable data={decliningData} />);

    // Q4 vs Q3 decline calculations:
    // Brands: (25-30)/30 = -16.7%
    // Locations: (800-950)/950 = -15.8%
    // Orders: (3000-3500)/3500 = -14.3%

    expect(screen.getByText("-16.7%")).toBeInTheDocument();
    expect(screen.getByText("-15.8%")).toBeInTheDocument();
    expect(screen.getByText("-14.3%")).toBeInTheDocument();
  });

  it("handles zero previous values", () => {
    const zeroPrevData = [
      {
        quarter: "Q4 2024",
        brands: 10,
        locations: 100,
        activeSmartMenus: 5,
        orders: 100,
      },
      {
        quarter: "Q3 2024",
        brands: 0,
        locations: 0,
        activeSmartMenus: 0,
        orders: 0,
      },
    ];

    render(<QuarterlyMetricsTable data={zeroPrevData} />);

    // Should show +∞ for growth from zero (multiple instances for different metrics)
    const infinityElements = screen.getAllByText("+∞");
    expect(infinityElements.length).toBeGreaterThan(0);
  });
});
