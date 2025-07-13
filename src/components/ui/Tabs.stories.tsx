import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Misc/Tabs',
  component: Tabs,
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const Template: Story = {
  render: (args: any) => (
    <Tabs defaultValue="tab1" {...args}>
      <TabsList className="mb-4">
        <TabsTrigger value="tab1">Tab One</TabsTrigger>
        <TabsTrigger value="tab2">Tab Two</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content for tab one.</TabsContent>
      <TabsContent value="tab2">Content for tab two.</TabsContent>
    </Tabs>
  ),
};

export const Default: Story = {
  ...Template,
  args: {},
};
