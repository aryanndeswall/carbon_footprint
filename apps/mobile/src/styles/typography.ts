import { TextStyle } from 'react-native';

export const typography = {
  fontFamilies: {
    heading: 'Outfit',
    body: 'Inter',
  },
  sizes: {
    h1: 36,
    h2: 28,
    h3: 20,
    body: 16,
    caption: 12,
    display: 48,
  },
  weights: {
    bold: '700' as const,
    semibold: '600' as const,
    regular: '400' as const,
    medium: '500' as const,
  },
};

export const fontStyles = {
  h1: {
    fontFamily: typography.fontFamilies.heading,
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
  } as TextStyle,
  h2: {
    fontFamily: typography.fontFamilies.heading,
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.semibold,
  } as TextStyle,
  h3: {
    fontFamily: typography.fontFamilies.heading,
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semibold,
  } as TextStyle,
  body: {
    fontFamily: typography.fontFamilies.body,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.regular,
  } as TextStyle,
  bodyMedium: {
    fontFamily: typography.fontFamilies.body,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
  } as TextStyle,
  caption: {
    fontFamily: typography.fontFamilies.body,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.regular,
  } as TextStyle,
  display: {
    fontFamily: typography.fontFamilies.heading,
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
  } as TextStyle,
};
