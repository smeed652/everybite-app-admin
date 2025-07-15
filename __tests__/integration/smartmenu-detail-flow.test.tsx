// @ts-nocheck
/// <reference types="vitest" />
import { MockedProvider } from "@apollo/client/testing";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { GET_WIDGET } from "../../src/features/smartMenus/hooks/useWidget";
import { Widget } from "../../src/generated/graphql";
import SmartMenuDetail from "../../src/pages/SmartMenuDetail";

// Full widget stub for Apollo mocks
const widgetData: Partial<Widget> = {
  id: "w1",
  name: "Widget One",
  slug: "widget-one",
  createdAt: null,
  updatedAt: null,
  publishedAt: null,
};
// end widget stub

const mocks: any = [
  {
    request: { query: GET_WIDGET, variables: { id: "w1" } },
    result: {
      data: {
        widget: {
          __typename: "Widget",
          ...widgetData,
        },
      },
    },
  },
  {
    request: {
      query: /UpdateWidget/i,
    },
    result: { data: { updateWidget: { __typename: "Widget", ...widgetData } } },
  },
];

function renderPage() {
  return render(
    <MockedProvider mocks={mocks} addTypename>
      <MemoryRouter initialEntries={["/smartmenus/w1"]}>
        <Routes>
          <Route path="/smartmenus/:widgetId" element={<SmartMenuDetail />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
}

describe("SmartMenuDetail integration", () => {
  it("allows editing a field and saving", async () => {
    renderPage();

    // Wait for widget name to appear
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Widget One"
      )
    );

    // Change slug field (in BasicPanel) – find input by placeholder
    const slugInput = screen.getByPlaceholderText(/slug/i);
    fireEvent.change(slugInput, { target: { value: "updated-slug" } });

    // Save button should now be enabled
    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn).toBeEnabled();

    fireEvent.click(saveBtn);

    await waitFor(() => expect(saveBtn).toBeDisabled()); // after save completes saving flag false but dirty cleared -> disabled again
  });
});
