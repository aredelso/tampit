import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic avatar with initials
export const WithInitials: Story = {
  args: {
    name: 'John Doe',
    size: 48,
    rounded: true,
  },
};

// Avatar with image
export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'Jane Smith',
    size: 48,
    rounded: true,
  },
};

// Different sizes
export const SmallAvatar: Story = {
  args: {
    name: 'Alice Johnson',
    size: 32,
    rounded: true,
  },
};

export const MediumAvatar: Story = {
  args: {
    name: 'Bob Wilson',
    size: 48,
    rounded: true,
  },
};

export const LargeAvatar: Story = {
  args: {
    name: 'Charlie Brown',
    size: 64,
    rounded: true,
  },
};

export const ExtraLargeAvatar: Story = {
  args: {
    name: 'David Lee',
    size: 96,
    rounded: true,
  },
};

// Square vs rounded
export const SquareAvatar: Story = {
  args: {
    name: 'Emma Davis',
    size: 48,
    rounded: false,
  },
};

export const RoundedAvatar: Story = {
  args: {
    name: 'Frank Miller',
    size: 48,
    rounded: true,
  },
};

// Multiple avatars
export const AvatarGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Avatar name="Alice" size={40} rounded />
      <Avatar name="Bob" size={40} rounded />
      <Avatar name="Charlie" size={40} rounded />
      <Avatar name="Diana" size={40} rounded />
    </div>
  ),
};

// With image URL
export const WithProfileImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=3',
    name: 'Sarah Connor',
    size: 56,
    rounded: true,
  },
};

// Fallback when image fails
export const ImageFallback: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.jpg',
    name: 'Fallback User',
    size: 48,
    rounded: true,
  },
};

// Various name formats
export const SingleName: Story = {
  args: {
    name: 'Madonna',
    size: 48,
    rounded: true,
  },
};

export const TwoPartName: Story = {
  args: {
    name: 'John Smith',
    size: 48,
    rounded: true,
  },
};

export const ThreePartName: Story = {
  args: {
    name: 'Mary Jane Watson',
    size: 48,
    rounded: true,
  },
};

// Empty name handling
export const NoName: Story = {
  args: {
    name: '',
    size: 48,
    rounded: true,
  },
};

// With different images
export const MultipleProfiles: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=1" name="User 1" size={40} rounded />
        <span>User 1</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=2" name="User 2" size={40} rounded />
        <span>User 2</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Avatar src="https://i.pravatar.cc/150?img=3" name="User 3" size={40} rounded />
        <span>User 3</span>
      </div>
    </div>
  ),
};
