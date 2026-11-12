import { render, screen } from '@testing-library/react';
import { Link } from './Link';

describe('Link', () => {
  it('renders an anchor pointing at href', () => {
    render(<Link href="/recipes" path="/" label="Recipes" />);
    expect(screen.getByRole('link', { name: 'Recipes' })).toHaveAttribute(
      'href',
      '/recipes'
    );
  });

  it('shows the normal label when not active', () => {
    render(
      <Link href="/recipes" path="/" label="Recipes" activeLabel="Recipes!" />
    );
    expect(screen.getByRole('link')).toHaveTextContent('Recipes');
    expect(screen.queryByText('Recipes!')).not.toBeInTheDocument();
  });

  it('shows the active label when the path matches href', () => {
    render(
      <Link
        href="/recipes"
        path="/recipes"
        label="Recipes"
        activeLabel="Recipes!"
      />
    );
    expect(screen.getByText('Recipes!')).toBeInTheDocument();
  });

  it('falls back to the label when active but no activeLabel is given', () => {
    render(<Link href="/recipes" path="/recipes" label="Recipes" />);
    expect(screen.getByRole('link')).toHaveTextContent('Recipes');
  });

  it('uses the accent color only when active', () => {
    const { rerender } = render(<Link href="/a" path="/b" label="A" />);
    expect(screen.getByRole('link').style.color).toBe('var(--text-muted)');
    rerender(<Link href="/a" path="/a" label="A" />);
    expect(screen.getByRole('link').style.color).toBe('var(--accent)');
  });
});
