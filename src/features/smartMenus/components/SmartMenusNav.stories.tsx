import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { SmartMenusNav } from './SmartMenusNav';

const meta: Meta<typeof SmartMenusNav> = {
  title: 'UI/Misc/SmartMenusNav',
  component: SmartMenusNav,
  decorators: [ (Story) => <MemoryRouter initialEntries={["/smartmenus"]}><Story /></MemoryRouter> ],
};
export default meta;

type Story = StoryObj<typeof SmartMenusNav>;

export const Default: Story = {
  args: {},
};
