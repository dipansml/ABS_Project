import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const colors = {
  primaryBlue: '#0A5FCC',
  navy: '#071E57',
  white: '#FFFFFF',
  background: '#F2F4F8',
  cardShadow: '#000000',
  textMuted: '#667085',
} as const;
