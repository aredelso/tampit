import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard } from './RecipeCard';

let mockUserId: number | null = 1;
jest.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: mockUserId === null ? null : { id: mockUserId } }),
}));

const recipe = {
  id: 7,
  title: 'Classic Pour Over',
  description: 'Balanced and clean',
  brewMethod: 'PourOver',
  grindSize: 'Medium',
  dose: 20,
  brewTime: 180,
  notes: 'Bloom longer for fresh beans',
  userId: 1,
  userName: 'Dev',
  userPhoto: null,
  likes: 12,
  likedBy: [{ userId: 2, userName: 'Alice' }],
  createdAt: new Date().toISOString(),
  phases: [
    { name: 'Bloom', waterTemp: 95, waterAmount: 40, startTime: 0 },
    { name: 'Pour', waterTemp: 95, waterAmount: 260, startTime: 45 },
  ],
} as any;

function setup(overrides: Record<string, unknown> = {}) {
  const props = {
    recipe,
    onLike: jest.fn(),
    onUnlike: jest.fn(),
    isLiked: false,
    onEdit: jest.fn(),
    onSave: jest.fn().mockResolvedValue(true),
    onCancel: jest.fn(),
    onDelete: jest.fn(),
    ...overrides,
  };
  render(<RecipeCard {...props} />);
  return props;
}

describe('RecipeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserId = 1;
  });

  it('shows the title, description and method', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Classic Pour Over' })).toBeInTheDocument();
    expect(screen.getByText('Balanced and clean')).toBeInTheDocument();
    expect(screen.getByText('PourOver')).toBeInTheDocument();
  });

  it('shows the dose, total water and each phase', () => {
    setup();
    expect(screen.getByText('20g')).toBeInTheDocument();
    expect(screen.getByText('300ml')).toBeInTheDocument();
    expect(screen.getByText(/95°C • 40ml/)).toBeInTheDocument();
    expect(screen.getByText(/Start: 45s/)).toBeInTheDocument();
  });

  it('adds µm to numeric grind sizes only', () => {
    const { unmount } = render(<RecipeCard recipe={{ ...recipe, grindSize: '200' }} onLike={() => {}} onUnlike={() => {}} isLiked={false} />);
    expect(screen.getByText('200 µm')).toBeInTheDocument();
    unmount();
    render(<RecipeCard recipe={recipe} onLike={() => {}} onUnlike={() => {}} isLiked={false} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('shows the owner menu only to the recipe owner', () => {
    setup();
    expect(screen.getByRole('button', { name: 'More options' })).toBeInTheDocument();
  });

  it('hides the owner menu from other users', () => {
    mockUserId = 99;
    setup();
    expect(screen.queryByRole('button', { name: 'More options' })).not.toBeInTheDocument();
  });

  it('hides the owner menu when logged out', () => {
    mockUserId = null;
    setup();
    expect(screen.queryByRole('button', { name: 'More options' })).not.toBeInTheDocument();
  });

  it('calls onEdit with the recipe from the menu', () => {
    const props = setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Edit'));
    expect(props.onEdit).toHaveBeenCalledWith(recipe);
  });

  it('calls onDelete with the recipe id from the menu', () => {
    const props = setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Delete'));
    expect(props.onDelete).toHaveBeenCalledWith(7);
  });

  it('likes an unliked recipe and unlikes a liked one', () => {
    const { onLike, onUnlike } = setup({ isLiked: false });
    fireEvent.click(screen.getByText('12').closest('button') as HTMLElement);
    expect(onLike).toHaveBeenCalledWith(7);
    expect(onUnlike).not.toHaveBeenCalled();
  });

  it('unlikes a recipe that is already liked', () => {
    const { onLike, onUnlike } = setup({ isLiked: true });
    fireEvent.click(screen.getByText('12').closest('button') as HTMLElement);
    expect(onUnlike).toHaveBeenCalledWith(7);
    expect(onLike).not.toHaveBeenCalled();
  });

  it('switches to the edit form when isEditing is set', () => {
    setup({ isEditing: true });
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Classic Pour Over')).toBeInTheDocument();
  });
});
