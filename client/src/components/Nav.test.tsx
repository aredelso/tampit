import { render, screen, fireEvent } from '@testing-library/react';
import { Nav } from './Nav';

const push = jest.fn();
let mockPath = '/';
let mockUser: { id: number } | null = null;
const logout = jest.fn();
const toggle = jest.fn();
let mockTheme: 'light' | 'dark' = 'light';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPath,
  useRouter: () => ({ push }),
}));
jest.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: mockUser, logout }),
}));
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme, toggle }),
}));

describe('Nav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPath = '/';
    mockUser = null;
    mockTheme = 'light';
  });

  it('renders links to home and recipes', () => {
    render(<Nav />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/', '/recipes']));
  });

  it('shows a sign-in link when logged out', () => {
    render(<Nav />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login'
    );
    expect(screen.queryByRole('button', { name: 'User menu' })).not.toBeInTheDocument();
  });

  it('shows the user menu when logged in and opens it on click', () => {
    mockUser = { id: 1 };
    render(<Nav />);
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('signs out and redirects to /login', () => {
    mockUser = { id: 1 };
    render(<Nav />);
    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
    fireEvent.click(screen.getByText('Sign out'));
    expect(logout).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('navigates to the profile page from the menu', () => {
    mockUser = { id: 1 };
    render(<Nav />);
    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));
    fireEvent.click(screen.getByText('My Profile'));
    expect(push).toHaveBeenCalledWith('/profile');
  });

  it('toggles the theme', () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(toggle).toHaveBeenCalled();
  });
});
