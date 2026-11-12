import { render, screen, fireEvent } from '@testing-library/react';
import { RoasterCombobox } from './RoasterCombobox';

const mockRoasters = [
  { id: 1, name: 'Blue Bottle' },
  { id: 2, name: 'Counter Culture' },
];

jest.mock('@/hooks/useRoasters', () => ({
  useRoasters: () => ({ roasters: mockRoasters }),
}));

function setup(value = '') {
  const handlers = {
    onChange: jest.fn(),
    onConfirm: jest.fn(),
    onSelect: jest.fn(),
  };
  render(<RoasterCombobox value={value} {...handlers} />);
  return handlers;
}

describe('RoasterCombobox', () => {
  it('shows roasters whose names contain the typed text', () => {
    setup('blue');
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByText('Blue Bottle')).toBeInTheDocument();
    expect(screen.queryByText('Counter Culture')).not.toBeInTheDocument();
  });

  it('selects a roaster, passing it to onSelect and onConfirm', () => {
    const handlers = setup('count');
    fireEvent.focus(screen.getByRole('textbox'));
    fireEvent.mouseDown(screen.getByText('Counter Culture'));
    expect(handlers.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Counter Culture' })
    );
    expect(handlers.onConfirm).toHaveBeenCalled();
  });

  it('offers to add a new roaster that is not in the list', () => {
    const handlers = setup('Stumptown');
    fireEvent.focus(screen.getByRole('textbox'));
    fireEvent.mouseDown(screen.getByText(/Add/));
    expect(handlers.onConfirm).toHaveBeenCalledWith(true);
  });
});
