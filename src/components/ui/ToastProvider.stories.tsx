import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { ToastProvider, useToast } from "./ToastProvider";

const meta: Meta<typeof ToastProvider> = {
  title: "UI/ToastProvider",
  component: ToastProvider,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

const ToastDemo = () => {
  const { showToast } = useToast();

  return (
    <div className="p-8 space-y-4">
      <Button
        onClick={() =>
          showToast({ title: "Default toast", variant: "default" })
        }
      >
        Show Default Toast
      </Button>
      <Button
        onClick={() =>
          showToast({
            title: "App Environment variables updated successfully",
            variant: "success",
          })
        }
        variant="outline"
      >
        Show Success Toast
      </Button>
      <Button
        onClick={() =>
          showToast({
            title: "Error occurred",
            description: "Something went wrong",
            variant: "error",
          })
        }
        variant="destructive"
      >
        Show Error Toast
      </Button>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
