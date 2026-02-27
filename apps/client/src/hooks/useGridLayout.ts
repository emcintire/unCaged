import { useWindowDimensions } from 'react-native';

import { spacing } from '@/config';

const POSTER_ASPECT_RATIO = 3 / 2;

export function useGridLayout() {
  const { width: screenWidth } = useWindowDimensions();

  const numColumns = screenWidth >= 900 ? 4 : screenWidth >= 600 ? 3 : 2;
  const cardGap = screenWidth >= 900 ? spacing.xxl : screenWidth >= 600 ? spacing.xl : spacing.sm;
  const rowGap = screenWidth >= 900 ? spacing.xxl * 2 : screenWidth >= 600 ? spacing.xxl : spacing.lg;
  const availableWidth = screenWidth - spacing.md * 2;
  // Reserve cardGap for each gap produced by justifyContent:'space-evenly'
  // (numColumns + 1 gaps: before first card, between each pair, after last card)
  const cardWidth = Math.floor((availableWidth - (numColumns + 1) * cardGap) / numColumns);
  const cardHeight = Math.round(cardWidth * POSTER_ASPECT_RATIO);

  return { numColumns, cardWidth, cardHeight, cardGap, rowGap };
}
