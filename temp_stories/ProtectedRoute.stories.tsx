import type { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const meta: Meta<typeof ProtectedRoute> = {
  title: "UI/Misc/ProtectedRoute",
  component: ProtectedRoute,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ProtectedRoute>;

export const Default: Story = {
  args: {},
};
