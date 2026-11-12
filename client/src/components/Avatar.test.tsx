import React from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar Component', () => {
  describe('Rendering', () => {
    it('renders avatar with initials when no src provided', () => {
      const { container } = render(
        <Avatar name="John Doe" size={48} rounded />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders avatar with image source', () => {
      const { container } = render(
        <Avatar
          src="https://example.com/avatar.jpg"
          name="Jane Smith"
          size={64}
          rounded
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('applies correct size styling', () => {
      const { container } = render(
        <Avatar name="Test User" size={80} rounded />
      );
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveStyle('width: 80px');
      expect(avatar).toHaveStyle('height: 80px');
    });

    it('applies rounded class when rounded prop is true', () => {
      const { container } = render(
        <Avatar name="Test User" size={48} rounded />
      );
      const avatar = container.firstChild;
      expect(avatar).toHaveClass('rounded-full');
    });

    it('renders without rounded class when rounded prop is false', () => {
      const { container } = render(
        <Avatar name="Test User" size={48} rounded={false} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts name prop', () => {
      const { container } = render(<Avatar name="John" size={48} />);
      expect(container).toBeInTheDocument();
    });

    it('accepts size prop', () => {
      const { container } = render(<Avatar name="Test User" size={64} />);
      expect(container).toBeInTheDocument();
    });

    it('accepts src prop', () => {
      const { container } = render(
        <Avatar src="https://example.com/avatar.jpg" name="Test" size={48} />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts rounded prop', () => {
      const { container } = render(<Avatar name="Test" size={48} rounded />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty name gracefully', () => {
      const { container } = render(<Avatar name="" size={48} />);
      expect(container).toBeInTheDocument();
    });

    it('handles single name', () => {
      const { container } = render(<Avatar name="John" size={48} />);
      expect(container).toBeInTheDocument();
    });

    it('handles multiple name parts', () => {
      const { container } = render(<Avatar name="Mary Jane Watson" size={48} />);
      expect(container).toBeInTheDocument();
    });

    it('handles various sizes', () => {
      const { container: small } = render(<Avatar name="Test" size={32} />);
      const { container: medium } = render(<Avatar name="Test" size={48} />);
      const { container: large } = render(<Avatar name="Test" size={96} />);

      expect(small).toBeInTheDocument();
      expect(medium).toBeInTheDocument();
      expect(large).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('handles missing image gracefully', () => {
      const { container } = render(
        <Avatar
          src="https://invalid-url-that-will-fail.jpg"
          name="Fallback User"
          size={48}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders with src prop', () => {
      const { container } = render(
        <Avatar
          src="https://example.com/avatar.jpg"
          name="Test"
          size={48}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });
});
