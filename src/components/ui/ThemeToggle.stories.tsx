import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/Misc/ThemeToggle',
  component: ThemeToggle,
};
export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
  render: () => (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  ),
  args: {},
};
