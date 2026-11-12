import { Nav } from '@/components/Nav';
import { UserProvider } from '@/context/UserContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ApolloProvider } from '@/context/ApolloProvider';
import { AddEntryFAB } from '@/components/AddEntryFAB';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './tailwind.css';
import './theme.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>TampIt</title>
      </head>
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <ApolloProvider>
            <ThemeProvider>
              <UserProvider>
                <div
                  className="min-h-screen"
                  style={{ background: 'var(--bg)' }}
                >
                  <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
                    <header className="mb-8 sm:mb-10">
                      <div className="flex items-center gap-3 mb-5 sm:mb-6">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base leading-none select-none"
                          style={{
                            background: 'var(--accent)',
                            color: 'var(--accent-fg)',
                          }}
                        >
                          ☕
                        </div>
                        <div
                          className="text-lg font-semibold tracking-tight mr-4"
                          style={{ color: 'var(--text-h)' }}
                        >
                          TampIt
                        </div>
                        <Nav />
                      </div>
                    </header>
                    <main>{children}</main>
                  </div>
                </div>
                <AddEntryFAB />
              </UserProvider>
            </ThemeProvider>
          </ApolloProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
