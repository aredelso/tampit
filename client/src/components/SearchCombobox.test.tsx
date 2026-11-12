import { render, screen, fireEvent } from '@testing-library/react';
import { SearchCombobox } from './SearchCombobox';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const roasters = [
  { id: 1, name: 'Blue Bottle', location: 'Oakland', logoUrl: null },
  { id: 2, name: 'Counter Culture', location: 'Durham', logoUrl: null },
];
const coffees = [
  {
    id: 10,
    name: 'Blue Mountain Blend',
    roaster: { name: 'Blue Bottle', logoUrl: null },
  },
];

// Return fixture data for each SWR key the component uses.
jest.mock('swr', () => ({
  __esModule: true,
  default: (key: string) => ({
    data: key === '/roasters' ? roasters : key === '/coffees' ? coffees : [],
  }),
}));

function setup(value = '') {
  const onChange = jest.fn();
  const utils = render(<SearchCombobox value={value} onChange={onChange} />);
  return { ...utils, onChange };
}

describe('SearchCombobox', () => {
  beforeEach(() => push.mockClear());

  it('shows no results before the user types', () => {
    setup('');
    fireEvent.focus(screen.getByRole('searchbox'));
    expect(screen.queryByRole('button', { name: /Blue/ })).not.toBeInTheDocument();
  });

  it('shows matching roasters and coffees', () => {
    setup('blue');
    fireEvent.focus(screen.getByRole('searchbox'));
    // "Blue Bottle" is both a roaster result and the roaster of the coffee result.
    expect(screen.getAllByText('Blue Bottle').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Blue Mountain Blend')).toBeInTheDocument();
    expect(screen.queryByText('Counter Culture')).not.toBeInTheDocument();
  });

  it('matches coffees by their roaster name', () => {
    setup('bottle');
    fireEvent.focus(screen.getByRole('searchbox'));
    expect(screen.getByText('Blue Mountain Blend')).toBeInTheDocument();
  });

  it('navigates to a roaster page when a roaster is chosen', () => {
    const { onChange } = setup('counter');
    fireEvent.focus(screen.getByRole('searchbox'));
    fireEvent.mouseDown(screen.getByText('Counter Culture'));
    expect(push).toHaveBeenCalledWith('/roaster/2');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('navigates to a coffee page when a coffee is chosen', () => {
    setup('mountain');
    fireEvent.focus(screen.getByRole('searchbox'));
    fireEvent.mouseDown(screen.getByText('Blue Mountain Blend'));
    expect(push).toHaveBeenCalledWith('/coffee/10');
  });

  it('moves through results with the arrow keys and opens with Enter', () => {
    setup('blue');
    const input = screen.getByRole('searchbox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(push).toHaveBeenCalledWith('/coffee/10');
  });

  it('does nothing on Enter when no result is highlighted', () => {
    setup('blue');
    const input = screen.getByRole('searchbox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(push).not.toHaveBeenCalled();
  });

  it('closes the dropdown on Escape', () => {
    setup('blue');
    const input = screen.getByRole('searchbox');
    fireEvent.focus(input);
    expect(screen.getByText('Blue Mountain Blend')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('Blue Mountain Blend')).not.toBeInTheDocument();
  });

  it('clears the query with the clear button', () => {
    const { onChange } = setup('blue');
    fireEvent.click(screen.getByText('✕'));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
