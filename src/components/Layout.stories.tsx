import type { Meta, StoryObj } from '@storybook/react';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from './Layout';

const meta: Meta<typeof Layout> = {
  title: 'UI/Misc/Layout',
  component: Layout,
};
export default meta;

type Story = StoryObj<typeof Layout>;

export const Default: Story = {
  render: () => (
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>
  ),
  args: {},
};
