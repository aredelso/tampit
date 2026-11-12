import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const fn = () => {
  const calls: any[] = [];
  const mock = (...args: any[]) => {
    calls.push(args);
  };
  mock.calls = calls;
  return mock;
};

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary variant stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const PrimaryLarge: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: '+ Create Recipe',
  },
};

export const PrimarySmall: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
};

// Secondary variant stories
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const SecondaryLarge: Story = {
  args: {
    variant: 'secondary',
    size: 'lg',
    children: 'Cancel',
  },
};

// Ghost variant stories
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const GhostSmall: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    children: 'More options',
  },
};

// Danger variant stories
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
  },
};

// States
export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Submit',
    loading: true,
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Full Width Button',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

// All sizes comparison
export const AllSizes: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button size="sm" variant="primary">
        Small
      </Button>
      <Button size="md" variant="primary">
        Medium
      </Button>
      <Button size="lg" variant="primary">
        Large
      </Button>
    </div>
  ),
};

// All variants comparison
export const AllVariants: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

// Button with icon
export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <span>✓</span> Save
      </>
    ),
  },
};

// Interaction test
export const Interactive: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    // Storybook test can be added here
  },
};
