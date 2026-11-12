import type { Meta, StoryObj } from '@storybook/react';
import { StarRating } from './StarRating';
import { useState } from 'react';

const fn = () => {
  const calls: any[] = [];
  const mock = (...args: any[]) => {
    calls.push(args);
  };
  mock.calls = calls;
  return mock;
};

const meta = {
  title: 'Components/StarRating',
  component: StarRating,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive rating component
export const Interactive: Story = {
  render: () => {
    const [rating, setRating] = useState<number | undefined>(0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <StarRating
          value={rating}
          onChange={setRating}
        />
        <p>Current rating: {rating || 'Not rated'}</p>
      </div>
    );
  },
};

// Unrated
export const Unrated: Story = {
  args: {
    value: undefined,
    onChange: fn(),
  },
};

// Different ratings
export const OneStarRating: Story = {
  args: {
    value: 1,
    onChange: fn(),
  },
};

export const TwoStarRating: Story = {
  args: {
    value: 2,
    onChange: fn(),
  },
};

export const ThreeStarRating: Story = {
  args: {
    value: 3,
    onChange: fn(),
  },
};

export const FourStarRating: Story = {
  args: {
    value: 4,
    onChange: fn(),
  },
};

export const FiveStarRating: Story = {
  args: {
    value: 5,
    onChange: fn(),
  },
};

// Fractional ratings
export const HalfStarRating: Story = {
  args: {
    value: 3.5,
    onChange: fn(),
  },
};

export const QuarterStarRating: Story = {
  args: {
    value: 2.25,
    onChange: fn(),
  },
};

// Read-only states (by not passing onChange)
export const ReadOnlyUnrated: Story = {
  args: {
    value: undefined,
  },
};

export const ReadOnlyThreeStars: Story = {
  args: {
    value: 3,
  },
};

export const ReadOnlyFiveStars: Story = {
  args: {
    value: 5,
  },
};

// All ratings comparison (read-only)
export const AllRatings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <StarRating value={1} />
        <span>1 star</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <StarRating value={2} />
        <span>2 stars</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <StarRating value={3} />
        <span>3 stars</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <StarRating value={4} />
        <span>4 stars</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <StarRating value={5} />
        <span>5 stars</span>
      </div>
    </div>
  ),
};

// Editable vs Read-only
export const EditableVsReadOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p>Editable (interactive)</p>
        <StarRating value={3} onChange={fn()} />
      </div>
      <div>
        <p>Read-only (display only)</p>
        <StarRating value={3} />
      </div>
    </div>
  ),
};

// In context (like review display)
export const ReviewDisplay: Story = {
  render: () => (
    <div style={{
      padding: '16px',
      border: '1px solid #e5d3bf',
      borderRadius: '8px',
      maxWidth: '400px',
    }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <StarRating value={4} />
        <span style={{ fontWeight: 'bold' }}>4.0</span>
      </div>
      <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
        Great coffee! The flavor notes were exactly as described.
      </p>
    </div>
  ),
};
