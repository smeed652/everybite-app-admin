import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

interface Person {
  id: string;
  name: string;
  email: string;
}

const sample: Person[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' },
];

const meta: Meta<typeof DataTable<Person>> = {
  title: 'UI/Data Display/DataTable',
  component: DataTable,
  args: {
    data: sample,
    columns: [
      {
        accessor: (row: Person) => row.name,
        header: 'Name',
      },
      {
        accessor: (row: Person) => row.email,
        header: 'Email',
      },
    ],
    pageSize: 5,
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    data: [],
  },
};

export const Loading: Story = {
  args: {
    data: [],
    loading: true,
  },
};

export const NoResults: Story = {
  args: {
    data: [],
  },
};

export const Sorting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = await canvas.findByText('Name');
    await userEvent.click(header);
    // After click, table should show sorted ascending (Alice first).
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Alice');
  },
};

export const Pagination: Story = {
  args: {
    pageSize: 1,
  },
};
