import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import OnboardingModal from './OnboardingModal';

const mockNavigate = jest.fn();
const mockTrackEvent = jest.fn();

jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u-1', email: 'admin@clinic.com', role: 'admin' } }),
}));

jest.mock('../../services/analytics', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

describe('OnboardingModal', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    mockTrackEvent.mockReset();
  });

  it('renders onboarding for first run and supports a11y baseline', async () => {
    const { container } = render(
      <OnboardingModal />
    );

    expect(await screen.findByText('Start faster with guided setup')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('navigates to a core action in one click', async () => {
    render(
      <OnboardingModal />
    );

    userEvent.click(await screen.findByRole('button', { name: 'Add Appointment' }));

    expect(mockNavigate).toHaveBeenCalledWith('/appointments/new');
    expect(mockTrackEvent).toHaveBeenCalledWith('onboarding_completed', expect.any(Object));
  });
});
