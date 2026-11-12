import { render, screen, fireEvent } from '@testing-library/react';
import { CoffeeCombobox } from './CoffeeCombobox';

const mockCoffees = [
  { id: 10, name: 'Ethiopia Yirgacheffe' },
  { id: 11, name: 'Colombia Huila' },
];
const useCoffeesMock = jest.fn((_roasterId: number) => ({
  coffees: mockCoffees,
}));

jest.mock('@/hooks/useCoffees', () => ({
  useCoffees: (roasterId: number) => useCoffeesMock(roasterId),
}));

describe('CoffeeCombobox', () => {
  it('loads coffees for the given roaster', () => {
    render(
      <CoffeeCombobox
        roasterId={7}
        value=""
        onChange={() => {}}
        onConfirm={() => {}}
        onSelect={() => {}}
      />
    );
    expect(useCoffeesMock).toHaveBeenCalledWith(7);
  });

  it('filters coffees by the typed text and selects one', () => {
    const onSelect = jest.fn();
    const onConfirm = jest.fn();
    render(
      <CoffeeCombobox
        roasterId={7}
        value="colom"
        onChange={() => {}}
        onConfirm={onConfirm}
        onSelect={onSelect}
      />
    );
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.queryByText('Ethiopia Yirgacheffe')).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('Colombia Huila'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Colombia Huila' })
    );
    expect(onConfirm).toHaveBeenCalled();
  });
});
