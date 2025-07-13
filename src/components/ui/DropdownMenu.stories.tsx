import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { Button } from './Button';

const meta: Meta<typeof DropdownMenu> = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  args: {},
};
export default meta;

type Story = StoryObj;

const Template: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem inset>Settings</DropdownMenuItem>
        <DropdownMenuItem disabled>Disabled item</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Default = { ...Template };

export const WithIcons: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <span role="img" aria-label="user" className="mr-2">
            👤
          </span>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem inset>
          <span role="img" aria-label="gear" className="mr-2">
            ⚙️
          </span>
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
