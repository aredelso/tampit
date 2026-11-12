import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders the label and description when given', () => {
    render(
      <Toggle
        checked={false}
        onChange={() => {}}
        label="Notifications"
        description="Email me"
      />
    );
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Email me')).toBeInTheDocument();
  });

  it('omits the label and description when not given', () => {
    const { container } = render(<Toggle checked={false} onChange={() => {}} />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('calls onChange with true when currently unchecked', () => {
    const onChange = jest.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when currently checked', () => {
    const onChange = jest.fn();
    render(<Toggle checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders a button with type="button" so it never submits a form', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
