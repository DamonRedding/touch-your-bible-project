/**
 * Unit Tests: DashboardScreen Component
 * Touch Your Bible - iOS MVP
 * Tests: Rendering, user interactions, state updates
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../../src/screens/DashboardScreen';

// Mock dependencies
jest.mock('../../src/contexts/auth', () => ({
  useAuth: jest.fn(() => ({
    user: { uid: 'test-user', email: 'test@example.com', displayName: 'Test User' },
    profile: {},
    signOut: jest.fn(),
    isLoading: false,
  })),
}));

jest.mock('../../src/services/verification', () => ({
  calculateCurrentStreak: jest.fn(() => Promise.resolve(3)),
  calculateLongestStreak: jest.fn(() => Promise.resolve(7)),
  getTotalVerifications: jest.fn(() => Promise.resolve(15)),
}));

describe('<DashboardScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      const { getByTestId } = render(<DashboardScreen />);
      // TODO: Add testID to ActivityIndicator in component
      // expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render greeting message', async () => {
      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText(/Good morning|Good afternoon|Good evening/)).toBeTruthy();
      });
    });

    it('should display user name from displayName', async () => {
      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText('Test User')).toBeTruthy();
      });
    });

    it('should display current streak', async () => {
      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText('3')).toBeTruthy(); // Streak number
        expect(getByText('3 days in a row')).toBeTruthy();
      });
    });

    it('should display flame emojis for active streak', async () => {
      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText('🔥🔥🔥')).toBeTruthy();
      });
    });

    it('should display total verifications and points', async () => {
      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText('15')).toBeTruthy(); // Total verifications
        expect(getByText('150')).toBeTruthy(); // Points (15 * 10)
      });
    });
  });

  describe('Greeting Logic', () => {
    it('should show "Good morning" before noon', async () => {
      // Mock Date to return 10 AM
      const mockDate = new Date('2025-10-07T10:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText('Good morning! 👋')).toBeTruthy();
      });
    });

    it('should show "Good afternoon" between noon and 5pm', async () => {
      const mockDate = new Date('2025-10-07T14:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText('Good afternoon! 👋')).toBeTruthy();
      });
    });

    it('should show "Good evening" after 5pm', async () => {
      const mockDate = new Date('2025-10-07T19:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText('Good evening! 👋')).toBeTruthy();
      });
    });
  });

  describe('User Interactions', () => {
    it('should open verify modal when CTA is pressed', async () => {
      const { getByText } = render(<DashboardScreen />);
      // TODO: Add fireEvent.press and verify modal opens
      // const button = getByText('Verify Bible Reading');
      // fireEvent.press(button);
      // expect modal to be visible
    });

    it('should trigger confetti on verification success', async () => {
      // TODO: Mock VerifyModal onVerifySuccess callback
      // Verify showConfetti state becomes true
    });

    it('should reload data after successful verification', async () => {
      // TODO: Verify loadUserData is called again after verification
    });
  });

  describe('Empty States', () => {
    it('should show encouraging message for 0 streak', async () => {
      // Mock services to return 0 streak
      const mockCalculateCurrentStreak = require('../../src/services/verification')
        .calculateCurrentStreak;
      mockCalculateCurrentStreak.mockResolvedValueOnce(0);

      const { getByText } = render(<DashboardScreen />);
      await waitFor(() => {
        expect(getByText('Start your streak today!')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockCalculateCurrentStreak = require('../../src/services/verification')
        .calculateCurrentStreak;
      mockCalculateCurrentStreak.mockRejectedValueOnce(new Error('Network error'));

      const { queryByText } = render(<DashboardScreen />);
      await waitFor(() => {
        // Should not crash, should show previous data or 0
        expect(queryByText('Good')).toBeTruthy();
      });
    });

    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockCalculateCurrentStreak = require('../../src/services/verification')
        .calculateCurrentStreak;
      mockCalculateCurrentStreak.mockRejectedValueOnce(new Error('Test error'));

      render(<DashboardScreen />);
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error loading user data:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
