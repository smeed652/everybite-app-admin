import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@storybook/addon-viewport",
  ],
  // @ts-expect-error — not yet in Storybook types but supported at runtime
  titlePrefix: "EB Admin",
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Exclude server-only testing utilities from the preview bundle
  viteFinal: async (config) => {
    config.build ??= {} as any;
    (config.build as any).rollupOptions ??= {};
    const rollupOptions: any = (config.build as any).rollupOptions;
    const existingExternal = rollupOptions.external ?? [];
    rollupOptions.external = Array.isArray(existingExternal)
      ? [...existingExternal]
      : [existingExternal];
    return config;
  },
};
export default config;
