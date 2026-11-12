import { render, screen, fireEvent } from '@testing-library/react';
import { Combobox, ComboboxOption } from './Combobox';

const options: ComboboxOption[] = [
  { label: 'Ethiopia Yirgacheffe', sublabel: 'Blue Bottle' },
  { label: 'Colombia Huila' },
];

function setup(overrides: Partial<React.ComponentProps<typeof Combobox>> = {}) {
  const props = {
    value: '',
    onChange: jest.fn(),
    options,
    placeholder: 'Search coffees',
    ...overrides,
  };
  const utils = render(<Combobox {...props} />);
  return { ...utils, props };
}

describe('Combobox', () => {
  it('renders an input with the placeholder', () => {
    setup();
    expect(screen.getByPlaceholderText('Search coffees')).toBeInTheDocument();
  });

  it('calls onChange as the user types', () => {
    const { props } = setup();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'eth' } });
    expect(props.onChange).toHaveBeenCalledWith('eth');
  });

  it('shows matching options when focused', () => {
    setup();
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(screen.getByText('Colombia Huila')).toBeInTheDocument();
    expect(screen.getByText('Blue Bottle', { exact: false })).toBeInTheDocument();
  });

  it('selects an option on mousedown and calls onSelect and onConfirm', () => {
    const onSelect = jest.fn();
    const onConfirm = jest.fn();
    const { props } = setup({ onSelect, onConfirm });
    fireEvent.focus(screen.getByRole('textbox'));
    fireEvent.mouseDown(screen.getByText('Colombia Huila'));
    expect(props.onChange).toHaveBeenCalledWith('Colombia Huila');
    expect(onSelect).toHaveBeenCalledWith(options[1]);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('does not show options until minChars is reached', () => {
    setup({ value: 'e', minChars: 3 });
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.queryByText('Colombia Huila')).not.toBeInTheDocument();
  });

  it('offers an add action for a new value when addLabel is set', () => {
    const onAdd = jest.fn();
    setup({ value: 'Kenya AA', options: [], addLabel: 'Add', onAdd });
    fireEvent.focus(screen.getByRole('textbox'));
    const addItem = screen.getByText('Add', { exact: false });
    fireEvent.mouseDown(addItem);
    expect(onAdd).toHaveBeenCalled();
  });

  it('does not offer add when the value already matches an option', () => {
    setup({
      value: 'Colombia Huila',
      addLabel: 'Add',
      options: [{ label: 'Colombia Huila' }],
    });
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.queryByText('Add', { exact: false })).not.toBeInTheDocument();
  });

  it('calls onConfirm on Enter when the value is not empty', () => {
    const onConfirm = jest.fn();
    setup({ value: 'Kenya', onConfirm });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not call onConfirm on Enter when the value is blank', () => {
    const onConfirm = jest.fn();
    setup({ value: '   ', onConfirm });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('closes the dropdown on Escape', () => {
    setup();
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByText('Colombia Huila')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(screen.queryByText('Colombia Huila')).not.toBeInTheDocument();
  });

  it('calls onConfirm on blur when the value is not empty', () => {
    const onConfirm = jest.fn();
    setup({ value: 'Kenya', onConfirm });
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
