import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import { AuthProvider } from '../contexts/AuthContext.jsx';

// Mock del authService
vi.mock('../services/authService.js', () => ({
  authService: {
    login: vi.fn(),
    verifyToken: vi.fn()
  }
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Error Display Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should display enhanced error message when login fails with 404', async () => {
    const mockError = new Error('El servicio de inicio de sesión no está disponible. Intenta más tarde.');
    mockError.type = 'http';
    mockError.suggestions = [
      'El servicio de autenticación no está disponible',
      'Intenta de nuevo en unos minutos',
      'Si el problema persiste, contacta soporte técnico'
    ];

    const { authService } = require('../services/authService.js');
    authService.login.mockRejectedValue(mockError);

    renderWithProviders(<Login />);

    // Llenar formulario
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Enviar formulario
    fireEvent.click(submitButton);

    // Verificar que se muestra el error mejorado
    await expect(screen.findByText('El servicio de inicio de sesión no está disponible. Intenta más tarde.')).toBeInTheDocument();
    expect(screen.getByText('¿Qué puedes hacer?')).toBeInTheDocument();
    expect(screen.getByText('El servicio de autenticación no está disponible')).toBeInTheDocument();
    expect(screen.getByText('Intenta de nuevo en unos minutos')).toBeInTheDocument();
  });

  it('should display error with retry button for network errors', async () => {
    const mockError = new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    mockError.type = 'network';
    mockError.suggestions = [
      'Verifica tu conexión a internet',
      'Intenta recargar la página',
      'Si el problema persiste, contacta soporte técnico'
    ];

    const { authService } = require('../services/authService.js');
    authService.login.mockRejectedValue(mockError);

    renderWithProviders(<Login />);

    // Llenar y enviar formulario
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Verificar mensaje de red y botón de reintentar
    await expect(screen.findByText('No se pudo conectar con el servidor. Verifica tu conexión a internet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recargar página/i })).toBeInTheDocument();
  });
});
