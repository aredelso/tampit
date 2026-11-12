import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from './TagInput';

jest.mock('@/hooks/useTags', () => ({
  useTags: () => ({ tags: ['blueberry', 'chocolate', 'citrus'] }),
}));

describe('TagInput', () => {
  it('renders existing tags as pills', () => {
    render(<TagInput value={['floral', 'honey']} onChange={() => {}} />);
    expect(screen.getByText('floral')).toBeInTheDocument();
    expect(screen.getByText('honey')).toBeInTheDocument();
  });

  it('adds a typed tag on Enter and clears the input', () => {
    const onChange = jest.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  nutty ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['nutty']);
  });

  it('does not add a duplicate tag, ignoring case', () => {
    const onChange = jest.fn();
    render(<TagInput value={['Floral']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'floral' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a tag when its remove button is clicked', () => {
    const onChange = jest.fn();
    render(<TagInput value={['a', 'b']} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('removes the last tag on Backspace when the input is empty', () => {
    const onChange = jest.fn();
    render(<TagInput value={['a', 'b']} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['a']);
  });

  it('shows matching suggestions that are not already selected', () => {
    render(<TagInput value={['citrus']} onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'c' } });
    expect(screen.getByText('chocolate')).toBeInTheDocument();
    expect(screen.queryByText('citrus', { selector: 'li' })).not.toBeInTheDocument();
  });

  it('adds a suggestion when it is picked', () => {
    const onChange = jest.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'blue' } });
    fireEvent.mouseDown(screen.getByText('blueberry'));
    expect(onChange).toHaveBeenCalledWith(['blueberry']);
  });

  it('shows the example placeholder only when there are no tags', () => {
    const { rerender } = render(<TagInput value={[]} onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/blueberry, chocolate/)).toBeInTheDocument();
    rerender(<TagInput value={['x']} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', '');
  });
});
