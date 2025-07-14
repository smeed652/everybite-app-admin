import type { Meta, StoryObj } from '@storybook/react';
import { TanStackDataTable } from './TanStackDataTable';
import type { ColumnDef } from '@tanstack/react-table';

const meta: Meta<typeof TanStackDataTable> = {
  title: 'UI/Misc/TanStackDataTable',
  component: TanStackDataTable,
};
export default meta;

type Story = StoryObj<typeof TanStackDataTable>;

export const Default: Story = {
  args: {
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'calories', header: 'Calories' },
    ] as ColumnDef<object, unknown>[],
    label: 'Sample data table',
    data: [
      { name: 'Margherita Pizza', calories: 300 },
      { name: 'Caesar Salad', calories: 180 },
    ],
  },
};
