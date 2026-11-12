import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal } from './ConfirmationModal';

const baseProps = {
  isOpen: true,
  title: 'Delete entry?',
  message: 'This cannot be undone.',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe('ConfirmationModal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmationModal {...baseProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and message when open', () => {
    render(<ConfirmationModal {...baseProps} />);
    expect(
      screen.getByRole('heading', { name: 'Delete entry?' })
    ).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('uses default Confirm and Cancel labels', () => {
    render(<ConfirmationModal {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('uses custom labels when provided', () => {
    render(
      <ConfirmationModal
        {...baseProps}
        confirmLabel="Yes, delete"
        cancelLabel="Keep it"
      />
    );
    expect(
      screen.getByRole('button', { name: 'Yes, delete' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
  });

  it('calls onConfirm and onCancel when the buttons are clicked', () => {
    render(<ConfirmationModal {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons and shows a loading label while loading', () => {
    render(<ConfirmationModal {...baseProps} isLoading />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    const confirm = screen.getByRole('button', { name: 'Loading…' });
    expect(confirm).toBeDisabled();
  });

  it('accepts a React node as the message', () => {
    render(
      <ConfirmationModal
        {...baseProps}
        message={<strong>Bold warning</strong>}
      />
    );
    expect(screen.getByText('Bold warning')).toBeInTheDocument();
  });
});
