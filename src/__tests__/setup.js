import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window and localStorage for node environment
const localStorageMock = {
  getItem: vi.fn((key) => {
    // Return stored value or null
    return localStorageMock._storage[key] || null;
  }),
  setItem: vi.fn((key, value) => {
    localStorageMock._storage[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock._storage[key];
  }),
  clear: vi.fn(() => {
    localStorageMock._storage = {};
  }),
  _storage: {}, // Internal storage
};

// Define window and localStorage globally
global.window = {
  localStorage: localStorageMock,
  dispatchEvent: vi.fn(),
  CustomEvent: vi.fn(),
};

global.localStorage = localStorageMock;

// Mock import.meta.env for tests
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_API_BASE_URL: undefined,
      VITE_API_URL: undefined,
      VITE_APP_NAME: 'Test App',
      VITE_APP_VERSION: '1.0.0',
    },
  },
});
