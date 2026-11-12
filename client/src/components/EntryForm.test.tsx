import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntryForm } from './EntryForm';
import { BREW_METHODS } from '@/lib/constants';

jest.mock('../hooks/useCoffees', () => ({
  useCoffees: () => ({ coffees: [] }),
}));
jest.mock('../hooks/useRecipes', () => ({
  useRecipes: () => ({
    recipes: [],
    createRecipe: jest.fn().mockResolvedValue(null),
  }),
}));
jest.mock('@/hooks/useRoasters', () => ({
  useRoasters: () => ({ roasters: [{ id: 1, name: 'Blue Bottle' }] }),
}));
jest.mock('@/hooks/useCoffees', () => ({
  useCoffees: () => ({ coffees: [] }),
}));
jest.mock('@/hooks/useTags', () => ({
  useTags: () => ({ tags: [] }),
}));
jest.mock('@/lib/api/uploads', () => ({
  uploadPhoto: jest.fn().mockResolvedValue('https://cdn.test/entry.jpg'),
}));
// The recipe form has its own tests; stub it here.
jest.mock('./RecipeForm', () => ({
  RecipeForm: () => <div data-testid="recipe-form" />,
}));

describe('EntryForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the brew fields once a coffee is known', () => {
    render(<EntryForm coffeeId={5} onSubmit={jest.fn()} />);
    expect(screen.getByText('Dose (g)')).toBeInTheDocument();
    expect(screen.getByText('Water (ml)')).toBeInTheDocument();
    expect(screen.getByText('Method')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
  });

  it('lists every supported brew method in the method select', () => {
    render(<EntryForm coffeeId={5} onSubmit={jest.fn()} />);
    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toEqual(BREW_METHODS);
  });

  it('hides the submit button until a coffee is chosen when no coffeeId is given', () => {
    render(<EntryForm onSubmit={jest.fn()} />);
    expect(
      screen.queryByRole('button', { name: 'Add Entry' })
    ).not.toBeInTheDocument();
  });

  it('submits the entered values with the coffee id', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<EntryForm coffeeId={5} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('18'), { target: { value: '18' } });
    fireEvent.change(screen.getByPlaceholderText('300'), { target: { value: '280' } });
    fireEvent.change(screen.getByPlaceholderText('Recipe tweaks, observations…'), {
      target: { value: 'Bright' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          coffeeId: 5,
          dose: 18,
          waterMl: 280,
          notes: 'Bright',
        })
      )
    );
  });

  it('sends the rating chosen on the star control', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    const { container } = render(<EntryForm coffeeId={5} onSubmit={onSubmit} />);
    // The first clickable star sets a rating of 1 in jsdom (zero-width layout).
    const firstStar = container.querySelector('.cursor-pointer') as HTMLElement;
    fireEvent.click(firstStar);
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ rating: 1 }))
    );
  });

  it('clears the form after a successful submit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<EntryForm coffeeId={5} onSubmit={onSubmit} />);
    const notes = screen.getByPlaceholderText('Recipe tweaks, observations…') as HTMLInputElement;
    fireEvent.change(notes, { target: { value: 'Sweet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    await waitFor(() => expect(notes.value).toBe(''));
  });

  it('keeps the entered values when the submit fails', async () => {
    const onSubmit = jest.fn().mockResolvedValue(false);
    render(<EntryForm coffeeId={5} onSubmit={onSubmit} />);
    const notes = screen.getByPlaceholderText('Recipe tweaks, observations…') as HTMLInputElement;
    fireEvent.change(notes, { target: { value: 'Sweet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(notes.value).toBe('Sweet');
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = jest.fn();
    render(<EntryForm coffeeId={5} onSubmit={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses the custom submit label', () => {
    render(<EntryForm coffeeId={5} onSubmit={jest.fn()} submitLabel="Save Changes" />);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });
});
