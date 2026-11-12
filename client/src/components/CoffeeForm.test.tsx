import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoffeeForm } from './CoffeeForm';

let mockRoasters: { id: number; name: string }[] = [];
let mockExisting: { id: number; name: string }[] = [];
const extract = jest.fn();

jest.mock('../hooks/useRoasters', () => ({
  useRoasters: () => ({ roasters: mockRoasters }),
}));
jest.mock('../hooks/useExtractCoffeeData', () => ({
  useExtractCoffeeData: () => ({ loading: false, error: null, extract }),
}));
jest.mock('@/lib/api/uploads', () => ({
  uploadPhoto: jest.fn().mockResolvedValue('https://cdn.test/photo.jpg'),
}));
// Existing coffees for the duplicate-name check.
jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({ data: mockExisting }),
}));
jest.mock('@/lib/api', () => ({
  api: { coffees: { list: jest.fn().mockResolvedValue([]) } },
}));

describe('CoffeeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoasters = [{ id: 1, name: 'Blue Bottle' }];
    mockExisting = [];
  });

  it('keeps submit disabled until a name is entered', () => {
    render(<CoffeeForm roasterId={1} onSubmit={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Add Coffee' })).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('e.g. Ethiopia Yirgacheffe'), {
      target: { value: 'Kenya AA' },
    });
    expect(screen.getByRole('button', { name: 'Add Coffee' })).toBeEnabled();
  });

  it('submits the entered values with the locked roaster id', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<CoffeeForm roasterId={1} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Ethiopia Yirgacheffe'), {
      target: { value: 'Kenya AA' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. Ethiopia'), {
      target: { value: 'Kenya' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Add Coffee' }).closest('form')!);
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ roasterId: 1, name: 'Kenya AA', origin: 'Kenya' })
      )
    );
  });

  it('warns and blocks submit when the name already exists for the roaster', () => {
    mockExisting = [{ id: 9, name: 'Kenya AA' }];
    render(<CoffeeForm roasterId={1} onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Ethiopia Yirgacheffe'), {
      target: { value: 'kenya aa' },
    });
    expect(
      screen.getByText('A coffee with this name already exists for this roaster.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Coffee' })).toBeDisabled();
  });

  it('requires a matching roaster when the roaster is not locked', () => {
    render(<CoffeeForm onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Ethiopia Yirgacheffe'), {
      target: { value: 'Kenya AA' },
    });
    // No roaster has been chosen yet, so submit stays disabled.
    expect(screen.getByRole('button', { name: 'Add Coffee' })).toBeDisabled();
  });

  it('pre-fills from initialValues', () => {
    render(
      <CoffeeForm
        roasterId={1}
        initialValues={{ name: 'Yirgacheffe', process: 'Washed' }}
        onSubmit={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue('Yirgacheffe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Washed')).toBeInTheDocument();
  });

  it('shows the photo and removes it when Remove is clicked', () => {
    render(
      <CoffeeForm
        roasterId={1}
        initialValues={{ photoUrl: 'https://cdn.test/a.jpg' }}
        onSubmit={jest.fn()}
      />
    );
    expect(screen.getByAltText('Coffee photo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByAltText('Coffee photo')).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = jest.fn();
    render(<CoffeeForm roasterId={1} onSubmit={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('fills the form from AI extraction results', async () => {
    extract.mockResolvedValueOnce({
      name: 'Extracted Name',
      origin: 'Brazil',
      process: 'Natural',
    });
    render(<CoffeeForm roasterId={1} onSubmit={jest.fn()} />);
    const fileInput = document.querySelector(
      'input[type="file"][accept="image/*"]:not(.sr-only)'
    ) as HTMLInputElement;
    const file = new File(['x'], 'bag.jpg', { type: 'image/jpeg' });
    const inputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(inputs[0] ?? fileInput, { target: { files: [file] } });
    await waitFor(() =>
      expect(screen.getByDisplayValue('Extracted Name')).toBeInTheDocument()
    );
    expect(screen.getByDisplayValue('Brazil')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Natural')).toBeInTheDocument();
  });
});
