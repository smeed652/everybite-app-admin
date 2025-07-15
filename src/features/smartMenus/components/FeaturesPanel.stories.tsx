import type { Meta, StoryObj } from "@storybook/react";
import { makeWidget } from "../../../__tests__/factories/widget";
import FeaturesPanel from "./FeaturesPanel";

const meta: Meta<typeof FeaturesPanel> = {
  title: "UI/Misc/FeaturesPanel",
  component: FeaturesPanel,
};
export default meta;

type Story = StoryObj<typeof FeaturesPanel>;

export const Default: Story = {
  args: {
    widget: makeWidget() as any,
    onFieldChange: () => {},
  },
};
