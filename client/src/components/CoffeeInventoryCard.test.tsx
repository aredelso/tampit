import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoffeeInventoryCard } from './CoffeeInventoryCard';

const inventory = { remove: jest.fn(), add: jest.fn(), update: jest.fn() };
jest.mock('@/hooks/useInventory', () => ({
  useInventory: () => inventory,
}));

const coffee = {
  id: 10,
  name: 'Ethiopia Yirgacheffe',
  origin: 'Ethiopia',
  process: 'Washed',
  photoUrl: null,
  roaster: { id: 1, name: 'Blue Bottle', logoUrl: null },
} as any;

function setup() {
  return render(<CoffeeInventoryCard id={99} coffee={coffee} />);
}

describe('CoffeeInventoryCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the coffee name, roaster and origin · process', () => {
    setup();
    expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(screen.getByText('Blue Bottle')).toBeInTheDocument();
    expect(screen.getByText('Ethiopia · Washed')).toBeInTheDocument();
  });

  it('links the card to the coffee page', () => {
    setup();
    expect(screen.getByText('Ethiopia Yirgacheffe').closest('a')).toHaveAttribute(
      'href',
      '/coffee/10'
    );
  });

  it('omits the meta line when there is no origin or process', () => {
    render(
      <CoffeeInventoryCard
        id={1}
        coffee={{ ...coffee, origin: null, process: null }}
      />
    );
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });

  it('opens the edit modal from the options menu', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByRole('heading', { name: 'Edit Inventory' })).toBeInTheDocument();
  });

  it('opens the duplicate modal from the options menu', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Duplicate'));
    expect(
      screen.getByRole('heading', { name: 'Duplicate Inventory' })
    ).toBeInTheDocument();
  });

  it('asks for confirmation before removing, then removes the item', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Delete'));
    expect(
      screen.getByRole('heading', { name: 'Remove from Inventory?' })
    ).toBeInTheDocument();
    expect(inventory.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(inventory.remove).toHaveBeenCalledWith(99);
  });

  it('keeps the confirmation open when removing fails', async () => {
    inventory.remove.mockRejectedValueOnce(new Error('network'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    // The modal stays open so the user can retry or cancel.
    expect(
      screen.getByRole('heading', { name: 'Remove from Inventory?' })
    ).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
