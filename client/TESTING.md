# Testing Guide

## Overview

This project includes comprehensive testing infrastructure with Jest, React Testing Library, and Storybook for component documentation and visual testing.

## Running Tests

### Jest Unit Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm test:watch

# Generate coverage report
npm test:coverage
```

### Test Files

Test files are located next to their components with `.test.tsx` extension:
- `src/components/Button.test.tsx` - 29 tests
- `src/components/Avatar.test.tsx` - 15 tests
- `src/components/StarRating.test.tsx` - 10 tests
- `src/components/Tabs.test.tsx` - 10 tests

## Storybook

Storybook provides interactive component documentation and visual testing.

### Running Storybook

```bash
# Start Storybook dev server (opens on http://localhost:6006)
npm run storybook

# Build static Storybook site
npm run build-storybook
```

### Story Files

Component stories are located with `.stories.tsx` extension:
- `src/components/Button.stories.tsx` - All variants, sizes, and states
- `src/components/Avatar.stories.tsx` - Various sizes, rounded vs square, image fallbacks
- `src/components/StarRating.stories.tsx` - Ratings, interactive examples, read-only states

## Test Coverage

### Components Tested

#### Button Component (29 tests)
- All variants: primary, secondary, ghost, danger
- All sizes: sm, md, lg
- States: disabled, loading, fullWidth
- Interactions: onClick, disabled prevention
- Cursor styling
- Ref forwarding
- Edge cases

#### Avatar Component (15 tests)
- Rendering with and without images
- Size variations (32px, 48px, 64px, 96px)
- Rounded vs square
- Initials generation
- Fallback behavior
- Props validation

#### StarRating Component (10 tests)
- Rendering and display
- Value handling (undefined, fractional ratings)
- Read-only state
- Props validation
- Edge cases

#### Tabs Component (10 tests)
- Tab rendering
- Active tab highlighting
- Prop updates
- Edge cases (empty array, non-existent active tab)
- Special characters handling

### Coverage by Tool

- **Jest**: Unit and integration tests with React Testing Library
- **Storybook**: Visual tests and interactive component exploration
- **Storybook Vitest Integration**: Browser-based testing within Storybook

## Writing New Tests

### Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      const { container } = render(<MyComponent value={0} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles user events', async () => {
      const handleClick = jest.fn();
      render(<MyComponent onClick={handleClick} />);
      
      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
```

### Best Practices

1. **Test behavior, not implementation** - Focus on what users see and do
2. **Use semantic queries** - `getByRole`, `getByLabelText` instead of `getByTestId`
3. **Test accessibility** - Ensure components are keyboard accessible
4. **Keep tests focused** - One assertion per test when possible
5. **Use descriptive test names** - Should explain what is being tested

## Creating Stories

### Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 0 },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return <MyComponent value={value} onChange={setValue} />;
  },
};
```

### Story Best Practices

1. **Show all variants** - Create stories for each meaningful variant
2. **Interactive examples** - Use render functions for stateful demos
3. **Edge cases** - Include stories for empty states, errors, loading
4. **Accessibility** - Use `tags: ['autodocs']` for auto-generated docs
5. **Organize** - Group related stories in the same file

## Continuous Integration

Tests run automatically on:
- Pre-commit (via husky hooks if configured)
- Pull requests (via CI/CD pipeline)
- Before builds

## Debugging Tests

### Run Single Test File

```bash
npm test -- Button.test.tsx
```

### Debug in Browser

Storybook provides interactive debugging:
```bash
npm run storybook
# Navigate to the component's story
# Use browser DevTools to inspect and debug
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Storybook Docs](https://storybook.js.org/)
- [Testing Best Practices](https://testing-library.com/docs/queries/about)
