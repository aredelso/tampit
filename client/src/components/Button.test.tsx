import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders button with children text', () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole('button', { name: /click me/i })
      ).toBeInTheDocument();
    });

    it('renders as disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders as disabled when loading is true', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders with fullWidth class when fullWidth prop is true', () => {
      const { container } = render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Button className="custom-class">Button</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
      render(<Button style={{ color: 'red' }}>Styled</Button>);
      const button = screen.getByRole('button');
      const computedStyle = window.getComputedStyle(button);
      expect(computedStyle.color).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: var(--accent)');
      expect(button).toHaveStyle('color: var(--accent-fg)');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: var(--bg-card)');
      expect(button).toHaveStyle('color: var(--text)');
      expect(button).toHaveStyle('border: 1px solid var(--border)');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: transparent');
      expect(button).toHaveStyle('color: var(--text-muted)');
    });

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: #fef2f2');
      expect(button).toHaveStyle('color: #b91c1c');
      expect(button).toHaveStyle('border: 1px solid #fecaca');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('renders medium size by default', () => {
      const { container } = render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm', 'rounded-lg');
    });

    it('renders large size', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-5', 'py-2.5', 'text-sm', 'rounded-lg');
    });
  });

  describe('Loading State', () => {
    it('shows spinner when loading is true', () => {
      const { container } = render(<Button loading>Loading</Button>);
      const spinner = container.querySelector('div[style*="border"]');
      expect(spinner).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows children text when loading is false', () => {
      render(<Button loading={false}>Submit</Button>);
      expect(
        screen.getByRole('button', { name: /submit/i })
      ).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Click
        </Button>
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Click
        </Button>
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Close">X</Button>);
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
  });

  describe('Cursor Styling', () => {
    it('sets cursor to pointer when not disabled', () => {
      render(<Button>Enabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('cursor: pointer');
    });

    it('sets cursor to not-allowed when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('cursor: not-allowed');
    });

    it('sets cursor to not-allowed when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('cursor: not-allowed');
    });
  });

  describe('Forwarded Ref', () => {
    it('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Test</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Ref Test');
    });
  });

  describe('Base Classes', () => {
    it('includes base button classes', () => {
      const { container } = render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'gap-1.5',
        'font-medium',
        'transition-all',
        'duration-50',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
      );
    });
  });

  describe('Edge Cases', () => {
    it('renders with children as React node', () => {
      render(
        <Button>
          <span>React</span> Node
        </Button>
      );
      expect(screen.getByRole('button')).toHaveTextContent('React Node');
    });

    it('handles multiple prop combinations', () => {
      render(
        <Button
          variant="danger"
          size="lg"
          fullWidth
          disabled
          className="extra-class"
        >
          Complex Button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('w-full', 'extra-class', 'px-5', 'py-2.5');
      expect(button).toHaveStyle('background: #fef2f2');
    });

    it('preserves HTML button attributes', () => {
      render(
        <Button
          id="test-button"
          data-testid="custom-button"
          title="Button Title"
        >
          Attributes
        </Button>
      );
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('id', 'test-button');
      expect(button).toHaveAttribute('title', 'Button Title');
    });
  });
});
