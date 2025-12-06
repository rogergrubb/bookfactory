import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  auth: () => ({ userId: 'test-user-id' }),
  currentUser: () => Promise.resolve({ id: 'test-user-id', emailAddresses: [{ emailAddress: 'test@example.com' }] }),
  useAuth: () => ({ isLoaded: true, userId: 'test-user-id', isSignedIn: true }),
  useUser: () => ({
    isLoaded: true,
    user: { id: 'test-user-id', emailAddresses: [{ emailAddress: 'test@example.com' }] },
  }),
  SignIn: () => null,
  SignUp: () => null,
  UserButton: () => null,
}));

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    mutate: vi.fn(),
  })),
}));

// Global fetch mock
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as any;
