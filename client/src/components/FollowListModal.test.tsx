import { render, screen, fireEvent } from '@testing-library/react';
import { FollowListModal } from './FollowListModal';

const followers = [
  { id: 'u1', name: 'Alice', photo: null },
  { id: 'u2', name: 'Bob', photo: null },
] as any[];
const followingUsers = [{ id: 'u3', name: 'Carol', photo: null }] as any[];
const followingRoasters = [
  { id: 5, name: 'Blue Bottle', logoUrl: null },
] as any[];

function setup(overrides: Partial<React.ComponentProps<typeof FollowListModal>> = {}) {
  const onClose = jest.fn();
  render(
    <FollowListModal
      isOpen
      onClose={onClose}
      title="Connections"
      followers={followers}
      followingUsers={followingUsers}
      followingRoasters={followingRoasters}
      {...overrides}
    />
  );
  return { onClose };
}

describe('FollowListModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <FollowListModal
        isOpen={false}
        onClose={() => {}}
        title="Hidden"
        followers={[]}
        followingUsers={[]}
        followingRoasters={[]}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the title and the count on each tab', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Connections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Followers (2)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Following Users (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Following Roasters (1)' })).toBeInTheDocument();
  });

  it('lists followers on the default tab', () => {
    setup();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Carol')).not.toBeInTheDocument();
  });

  it('switches to the following users tab', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Following Users (1)' }));
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('switches to the following roasters tab and links to the roaster', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Following Roasters (1)' }));
    expect(screen.getByText('Blue Bottle').closest('a')).toHaveAttribute(
      'href',
      '/roaster/5'
    );
  });

  it('links each user to their profile', () => {
    setup();
    expect(screen.getByText('Alice').closest('a')).toHaveAttribute('href', '/user/u1');
  });

  it('hides the roasters tab when showFollowingRoasters is false', () => {
    setup({ showFollowingRoasters: false });
    expect(
      screen.queryByRole('button', { name: /Following Roasters/ })
    ).not.toBeInTheDocument();
  });

  it('shows an empty state when a list has no entries', () => {
    setup({ followers: [] });
    expect(screen.getByText('No users')).toBeInTheDocument();
  });

  it('calls onClose from the close button and from the backdrop', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('heading', { name: 'Connections' }).closest('.fixed') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
