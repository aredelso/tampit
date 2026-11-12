import { render } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonPageHeader } from './Skeleton';

describe('Skeleton', () => {
  it('uses default width and height classes', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('w-full', 'h-4', 'animate-pulse');
  });

  it('uses provided width, height and className', () => {
    const { container } = render(
      <Skeleton width="w-12" height="h-12" className="rounded-full" />
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('w-12', 'h-12', 'rounded-full');
  });

  it('forwards extra props to the element', () => {
    const { container } = render(<Skeleton data-testid="sk" />);
    expect(container.querySelector('[data-testid="sk"]')).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('renders the placeholder blocks for a card', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
  });
});

describe('SkeletonPageHeader', () => {
  it('renders an avatar placeholder and two text placeholders', () => {
    const { container } = render(<SkeletonPageHeader />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });
});
