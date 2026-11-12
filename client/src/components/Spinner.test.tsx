import { render } from '@testing-library/react';
import { Spinner, SkeletonLoader } from './Spinner';

describe('Spinner', () => {
  it('renders a circle sized to the size prop', () => {
    const { container } = render(<Spinner size={32} />);
    const spinner = container.querySelector('div[style]') as HTMLElement;
    expect(spinner.style.width).toBe('32px');
    expect(spinner.style.height).toBe('32px');
    expect(spinner.style.borderRadius).toBe('50%');
  });

  it('defaults to 16px and currentColor', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('div[style]') as HTMLElement;
    expect(spinner.style.width).toBe('16px');
    expect(spinner.style.height).toBe('16px');
    expect(spinner.style.border).toContain('solid');
  });

  it('uses the provided color and className', () => {
    const { container } = render(<Spinner color="red" className="extra" />);
    const spinner = container.querySelector('div[style]') as HTMLElement;
    expect(spinner.style.border).toContain('red');
    expect(spinner.className).toBe('extra');
  });

  it('includes the spin keyframes animation', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('style')?.textContent).toContain(
      '@keyframes spin'
    );
  });
});

describe('SkeletonLoader', () => {
  it('applies default width and height', () => {
    const { container } = render(<SkeletonLoader />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('20px');
    expect(el.className).toContain('animate-pulse');
  });

  it('applies custom width, height and className', () => {
    const { container } = render(
      <SkeletonLoader width={120} height="2rem" className="custom" />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('2rem');
    expect(el.className).toContain('custom');
  });
});
