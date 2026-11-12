import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntryCard } from './EntryCard';

const likeEntry = jest.fn().mockResolvedValue(undefined);
const unlikeEntry = jest.fn().mockResolvedValue(undefined);
const commentEntry = jest.fn().mockResolvedValue(undefined);
const likeComment = jest.fn().mockResolvedValue(undefined);
const unlikeComment = jest.fn().mockResolvedValue(undefined);
const followToggle = jest.fn();
let mockFollow = { following: false, canFollow: false, isPending: false };

jest.mock('@/hooks/useEntries', () => ({
  useEntries: () => ({ likeEntry, unlikeEntry, commentEntry, likeComment, unlikeComment }),
}));
jest.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: { id: 1 } }),
}));
jest.mock('@/hooks/useFollows', () => ({
  useUserFollow: () => ({ ...mockFollow, toggle: followToggle }),
}));
jest.mock('./EntryForm', () => ({
  EntryForm: ({ submitLabel }: { submitLabel: string }) => (
    <div data-testid="entry-form">{submitLabel}</div>
  ),
}));

const entry = {
  id: 5,
  userId: 2,
  userName: 'Dev',
  userPhoto: null,
  roasterId: 3,
  roasterName: 'Blue Bottle',
  roasterLogoUrl: null,
  coffeeId: 8,
  coffeeName: 'Ethiopia Yirgacheffe',
  coffeePhotoUrl: null,
  origin: 'Ethiopia',
  brewMethod: 'PourOver',
  dose: 18,
  waterMl: 280,
  notes: 'Bright citrus',
  rating: 4,
  photoUrl: null,
  flavorNotes: ['citrus', 'floral'],
  likes: 7,
  likedBy: [{ userId: 3, userName: 'Alice' }],
  comments: [
    {
      id: 21,
      userId: 3,
      userName: 'Alice',
      userPhoto: null,
      content: 'Nice cup',
      createdAt: new Date().toISOString(),
      likes: 2,
      likedBy: [],
    },
  ],
  createdAt: new Date().toISOString(),
} as any;

function setup(overrides: Record<string, unknown> = {}) {
  const props = {
    entry,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onSave: jest.fn().mockResolvedValue(true),
    onCancel: jest.fn(),
    onToggleFollow: jest.fn(),
    ...overrides,
  };
  render(
    <ul>
      <EntryCard {...props} />
    </ul>
  );
  return props;
}

describe('EntryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFollow = { following: false, canFollow: false, isPending: false };
  });

  it('shows the coffee, roaster, notes and flavor tags', () => {
    setup();
    expect(screen.getByText('Ethiopia Yirgacheffe').closest('a')).toHaveAttribute(
      'href',
      '/coffee/8'
    );
    expect(screen.getByText('Blue Bottle').closest('a')).toHaveAttribute(
      'href',
      '/roaster/3'
    );
    expect(screen.getByText('Bright citrus')).toBeInTheDocument();
    expect(screen.getByText('citrus').closest('a')).toHaveAttribute('href', '/tag/citrus');
  });

  it('shows dose and water amount', () => {
    setup();
    expect(screen.getByText(/18g \/ 280ml/)).toBeInTheDocument();
  });

  it('shows the brew method icon when one exists', () => {
    setup();
    expect(screen.getByAltText('PourOver')).toBeInTheDocument();
  });

  it('shows the rating stars when a rating exists', () => {
    const { container } = render(
      <ul>
        <EntryCard entry={{ ...entry, rating: 4 }} />
      </ul>
    );
    expect(container.querySelector('.cursor-pointer')).toBeNull();
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('likes an entry that the user has not liked', () => {
    setup();
    fireEvent.click(screen.getByText('7').closest('button') as HTMLElement);
    expect(likeEntry).toHaveBeenCalledWith(5);
    expect(unlikeEntry).not.toHaveBeenCalled();
  });

  it('unlikes an entry the user already liked', () => {
    setup({ entry: { ...entry, likedBy: [{ userId: 1, userName: 'Me' }] } });
    fireEvent.click(screen.getByText('7').closest('button') as HTMLElement);
    expect(unlikeEntry).toHaveBeenCalledWith(5);
  });

  it('shows the owner menu actions when edit and delete handlers are given', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onDelete with the entry id', () => {
    const props = setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Delete'));
    expect(props.onDelete).toHaveBeenCalledWith(5);
  });

  it('calls onEdit with the entry', () => {
    const props = setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Edit'));
    expect(props.onEdit).toHaveBeenCalledWith(entry);
  });

  it('does not show the menu when there are no actions for this user', () => {
    setup({ onEdit: undefined, onDelete: undefined });
    expect(screen.queryByRole('button', { name: 'More options' })).not.toBeInTheDocument();
  });

  it('offers to follow the author when they can be followed', () => {
    mockFollow = { following: false, canFollow: true, isPending: false };
    const props = setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Follow Dev'));
    expect(followToggle).toHaveBeenCalled();
    expect(props.onToggleFollow).toHaveBeenCalled();
  });

  it('offers to unfollow when already following', () => {
    mockFollow = { following: true, canFollow: true, isPending: false };
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    expect(screen.getByText('Unfollow Dev')).toBeInTheDocument();
  });

  it('reveals comments and the comment count when the bubble is clicked', () => {
    setup();
    expect(screen.queryByText('Nice cup')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('1').closest('button') as HTMLElement);
    expect(screen.getByText('Nice cup')).toBeInTheDocument();
  });

  it('posts a comment on Enter', async () => {
    setup();
    fireEvent.click(screen.getByText('1').closest('button') as HTMLElement);
    const input = screen.getByPlaceholderText('Add a comment…');
    fireEvent.change(input, { target: { value: 'Great shot' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(commentEntry).toHaveBeenCalledWith(5, 'Great shot'));
  });

  it('likes a comment', () => {
    setup();
    fireEvent.click(screen.getByText('1').closest('button') as HTMLElement);
    fireEvent.click(screen.getByText('2').closest('button') as HTMLElement);
    expect(likeComment).toHaveBeenCalledWith(5, 21);
  });

  it('switches to the entry form in edit mode', () => {
    setup({ isEditing: true });
    expect(screen.getByTestId('entry-form')).toHaveTextContent('Save');
  });
});
