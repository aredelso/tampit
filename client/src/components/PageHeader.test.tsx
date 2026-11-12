import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title as a heading', () => {
    render(<PageHeader title="My Recipes" />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'My Recipes' })
    ).toBeInTheDocument();
  });

  it('renders meta, children and right-hand content', () => {
    render(
      <PageHeader
        title="Profile"
        meta={<span>12 entries</span>}
        right={<button>Edit</button>}
      >
        <p>Bio text</p>
      </PageHeader>
    );
    expect(screen.getByText('12 entries')).toBeInTheDocument();
    expect(screen.getByText('Bio text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders the avatar and bottom sections when provided', () => {
    render(
      <PageHeader
        title="Profile"
        avatar={<img alt="avatar" />}
        bottom={<div>Tabs go here</div>}
      />
    );
    expect(screen.getByAltText('avatar')).toBeInTheDocument();
    expect(screen.getByText('Tabs go here')).toBeInTheDocument();
  });

  it('omits optional sections when they are not provided', () => {
    const { container } = render(<PageHeader title="Plain" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('.flex-col')).toHaveLength(0);
  });

  it('shows skeleton placeholders instead of the title while loading', () => {
    const { container } = render(<PageHeader title="Hidden" loading />);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });
});
