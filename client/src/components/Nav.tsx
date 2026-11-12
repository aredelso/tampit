'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { Link } from './Link';
import { Button } from './Button';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PersonIcon from '@mui/icons-material/Person';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export function Nav() {
  const path = usePathname();
  const router = useRouter();
  const { user, logout: ctxLogout } = useUser();
  const { theme, toggle } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function logout() {
    ctxLogout();
    router.push('/login');
  }

  useEffect(() => {
    if (!showMenu) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showMenu]);

  return (
    <nav className="flex flex-1 items-center gap-1">
      <Link
        href="/"
        path={path}
        label={<HomeOutlinedIcon sx={{ fontSize: 22 }} />}
        activeLabel={<HomeIcon sx={{ fontSize: 22 }} />}
      />
      <Link
        href="/recipes"
        path={path}
        label={<MenuBookOutlinedIcon sx={{ fontSize: 22 }} />}
        activeLabel={<MenuBookIcon sx={{ fontSize: 22 }} />}
      />
      <div className="ml-auto flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="md"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <LightModeIcon sx={{ fontSize: 18 }} />
          ) : (
            <DarkModeIcon sx={{ fontSize: 18 }} />
          )}
        </Button>
        {user ? (
          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="md"
              className="rounded-full"
              onClick={() => setShowMenu((v) => !v)}
              aria-label="User menu"
            >
              {path === '/profile' ? (
                <PersonIcon sx={{ fontSize: 22 }} />
              ) : (
                <PersonOutlinedIcon sx={{ fontSize: 22 }} />
              )}
            </Button>
            {showMenu && (
              <div
                className="absolute right-0 z-20 mt-2 rounded-lg shadow-lg py-1 min-w-[140px]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: 'var(--text-h)' }}
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: 'var(--text-h)' }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" path={path} label="Sign in" />
        )}
      </div>
    </nav>
  );
}
