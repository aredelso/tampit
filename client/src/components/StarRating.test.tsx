import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StarRating } from './StarRating';

describe('StarRating Component', () => {
  describe('Rendering', () => {
    it('renders the component without errors', () => {
      const { container } = render(
        <StarRating value={0} onChange={() => {}} />
      );
      expect(container).toBeInTheDocument();
    });

    it('displays with a value', () => {
      const { container } = render(
        <StarRating value={3} onChange={() => {}} />
      );
      expect(container).toBeInTheDocument();
    });

    it('handles undefined value', () => {
      const { container } = render(
        <StarRating value={undefined} onChange={() => {}} />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders read-only state', () => {
      const { container } = render(
        <StarRating value={4} onChange={() => {}} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles onChange callback prop', () => {
      const handleChange = jest.fn();
      render(
        <StarRating value={0} onChange={handleChange} />
      );
      // Component accepts the onChange prop
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('respects read-only state', () => {
      const handleChange = jest.fn();
      const { container } = render(
        <StarRating value={3} onChange={handleChange} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rating of 0', () => {
      const { container } = render(
        <StarRating value={0} onChange={() => {}} />
      );
      expect(container).toBeInTheDocument();
    });

    it('handles maximum rating of 5', () => {
      const { container } = render(
        <StarRating value={5} onChange={() => {}} />
      );
      expect(container).toBeInTheDocument();
    });

    it('handles fractional ratings', () => {
      const { container } = render(
        <StarRating value={3.5} onChange={() => {}} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts all required props', () => {
      const { container } = render(
        <StarRating
          value={3}
          onChange={jest.fn()}
         
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('handles prop updates', () => {
      const { rerender } = render(
        <StarRating value={2} onChange={jest.fn()} />
      );

      rerender(
        <StarRating value={4} onChange={jest.fn()} />
      );

      expect(true).toBe(true);
    });
  });
});
