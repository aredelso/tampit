import { render, screen, fireEvent } from '@testing-library/react';
import { AddEntryFAB } from './AddEntryFAB';

let mockUser: { id: number } | null = { id: 1 };
let mockPath = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPath,
}));
jest.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: mockUser }),
}));
jest.mock('@/lib/api', () => ({
  api: {
    entries: { create: jest.fn().mockResolvedValue({}) },
    coffees: { create: jest.fn().mockResolvedValue({}) },
    recipes: { create: jest.fn().mockResolvedValue({}) },
  },
}));
jest.mock('swr', () => ({ mutate: jest.fn().mockResolvedValue(undefined) }));
// Stub the forms: these tests cover the FAB's menu and modal behavior only.
jest.mock('./EntryForm', () => ({
  EntryForm: ({ submitLabel }: { submitLabel: string }) => (
    <div data-testid="entry-form">{submitLabel}</div>
  ),
}));
jest.mock('./CoffeeForm', () => ({
  CoffeeForm: ({ submitLabel }: { submitLabel: string }) => (
    <div data-testid="coffee-form">{submitLabel}</div>
  ),
}));
jest.mock('./RecipeForm', () => ({
  RecipeForm: ({ submitLabel }: { submitLabel: string }) => (
    <div data-testid="recipe-form">{submitLabel}</div>
  ),
}));

describe('AddEntryFAB', () => {
  beforeEach(() => {
    mockUser = { id: 1 };
    mockPath = '/';
  });

  it('renders nothing when no user is logged in', () => {
    mockUser = null;
    const { container } = render(<AddEntryFAB />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens the action menu when the FAB is clicked', () => {
    render(<AddEntryFAB />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    expect(screen.getByText('Add Entry')).toBeVisible();
    expect(screen.getByText('Add Coffee')).toBeVisible();
    expect(screen.getByText('Add Recipe')).toBeVisible();
  });

  it('closes the menu when the FAB is clicked a second time', () => {
    render(<AddEntryFAB />);
    const fab = screen.getByRole('button', { name: 'Open actions' });
    fireEvent.click(fab);
    fireEvent.click(fab);
    expect(screen.queryByTestId('entry-form')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open actions' })).toBeInTheDocument();
  });

  it('opens the entry form from the menu', () => {
    render(<AddEntryFAB />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    fireEvent.click(screen.getByText('Add Entry'));
    expect(screen.getByTestId('entry-form')).toHaveTextContent('Add Entry');
  });

  it('opens the coffee form from the menu', () => {
    render(<AddEntryFAB />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    fireEvent.click(screen.getByText('Add Coffee'));
    expect(screen.getByTestId('coffee-form')).toHaveTextContent('Add Coffee');
  });

  it('opens the recipe form from the menu', () => {
    render(<AddEntryFAB />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    fireEvent.click(screen.getByText('Add Recipe'));
    expect(screen.getByTestId('recipe-form')).toHaveTextContent('Create Recipe');
  });

  it('closes an open form when the backdrop is clicked', () => {
    render(<AddEntryFAB />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    fireEvent.click(screen.getByText('Add Entry'));
    expect(screen.getByTestId('entry-form')).toBeInTheDocument();
    const backdrop = document.querySelector('.fixed.inset-0.z-30') as HTMLElement;
    fireEvent.click(backdrop);
    expect(screen.queryByTestId('entry-form')).not.toBeInTheDocument();
  });

  it('opens the coffee form on a roaster page without error', () => {
    mockPath = '/roaster/42';
    render(<AddEntryFAB />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    fireEvent.click(screen.getByText('Add Coffee'));
    expect(screen.getByTestId('coffee-form')).toBeInTheDocument();
  });
});
