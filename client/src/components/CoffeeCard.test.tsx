import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoffeeCard } from './CoffeeCard';

const addEntry = jest.fn();
const wishlistAdd = jest.fn();
const wishlistRemove = jest.fn();
const inventoryAdd = jest.fn();
let mockWishlist: { coffeeId: number }[] = [];

jest.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: { id: 1 } }),
}));
jest.mock('@/hooks/useEntries', () => ({
  useEntries: () => ({ addEntry }),
}));
jest.mock('@/hooks/useWishlist', () => ({
  useWishlist: () => ({
    wishlist: mockWishlist,
    add: wishlistAdd,
    remove: wishlistRemove,
  }),
}));
jest.mock('@/hooks/useInventory', () => ({
  useInventory: () => ({ add: inventoryAdd }),
}));
jest.mock('./EntryForm', () => ({
  EntryForm: ({ submitLabel }: { submitLabel: string }) => (
    <div data-testid="entry-form">{submitLabel}</div>
  ),
}));

const coffee = {
  id: 10,
  name: 'Ethiopia Yirgacheffe',
  origin: 'Ethiopia',
  variety: 'Heirloom',
  farm: null,
  process: 'Washed',
  description: 'Bright and floral',
  photoUrl: null,
  roaster: { id: 1, name: 'Blue Bottle', logoUrl: null },
  avgRating: 4.25,
  entryCount: 1,
} as any;

// Icon-only buttons in this card, in visual order.
const CHECK_IN = 0;
const INVENTORY = 1;
const WISHLIST = 2;

function setup(overrides: Record<string, unknown> = {}) {
  const onEntryAdded = jest.fn();
  const utils = render(
    <CoffeeCard coffee={{ ...coffee, ...overrides }} onEntryAdded={onEntryAdded} />
  );
  return { ...utils, onEntryAdded };
}

describe('CoffeeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWishlist = [];
  });

  it('shows the name, roaster, description and metadata', () => {
    setup();
    expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(screen.getByText('Blue Bottle')).toBeInTheDocument();
    expect(screen.getByText('Bright and floral')).toBeInTheDocument();
    expect(screen.getByText('Ethiopia · Heirloom · Washed')).toBeInTheDocument();
  });

  it('links the card to the coffee page', () => {
    setup();
    expect(screen.getByText('Ethiopia Yirgacheffe').closest('a')).toHaveAttribute(
      'href',
      '/coffee/10'
    );
  });

  it('shows the rating to one decimal place and the check-in count', () => {
    setup();
    expect(screen.getByText('4.3')).toBeInTheDocument();
    expect(screen.getByText('1 check-in')).toBeInTheDocument();
  });

  it('uses the plural check-ins label when there are several', () => {
    setup({ entryCount: 3 });
    expect(screen.getByText('3 check-ins')).toBeInTheDocument();
  });

  it('hides the rating block when there are no ratings or check-ins', () => {
    setup({ avgRating: null, entryCount: null });
    expect(screen.queryByText(/check-in/)).not.toBeInTheDocument();
  });

  it('opens the check-in form and calls onEntryAdded after saving', async () => {
    addEntry.mockResolvedValueOnce(true);
    const { onEntryAdded } = setup();
    fireEvent.click(screen.getAllByRole('button')[CHECK_IN]);
    expect(screen.getByTestId('entry-form')).toHaveTextContent('Add Entry');
  });

  it('opens the inventory modal from the inventory button', () => {
    setup();
    fireEvent.click(screen.getAllByRole('button')[INVENTORY]);
    expect(
      screen.getByRole('heading', { name: 'Add to Inventory' })
    ).toBeInTheDocument();
  });

  it('adds the coffee to inventory when the modal is submitted', async () => {
    inventoryAdd.mockResolvedValueOnce(undefined);
    setup();
    fireEvent.click(screen.getAllByRole('button')[INVENTORY]);
    const form = screen.getByRole('heading', { name: 'Add to Inventory' })
      .parentElement as HTMLFormElement;
    fireEvent.submit(form);
    await waitFor(() =>
      expect(inventoryAdd).toHaveBeenCalledWith({
        coffeeId: 10,
        roastDate: undefined,
      })
    );
  });

  it('adds the coffee to the wishlist when it is not saved yet', async () => {
    wishlistAdd.mockResolvedValueOnce(undefined);
    setup();
    fireEvent.click(screen.getAllByRole('button')[WISHLIST]);
    await waitFor(() => expect(wishlistAdd).toHaveBeenCalledWith(10));
    expect(wishlistRemove).not.toHaveBeenCalled();
  });

  it('removes the coffee from the wishlist when it is already saved', async () => {
    mockWishlist = [{ coffeeId: 10 }];
    wishlistRemove.mockResolvedValueOnce(undefined);
    setup();
    fireEvent.click(screen.getAllByRole('button')[WISHLIST]);
    await waitFor(() => expect(wishlistRemove).toHaveBeenCalledWith(10));
    expect(wishlistAdd).not.toHaveBeenCalled();
  });
});
