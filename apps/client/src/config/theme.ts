import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
  xxl: 30,
} as const;

export const borderRadius = {
  sm: 8,
  md: 10,
  lg: 20,
  round: 25,
  circle: 35,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 26,
  xxxl: 30,
} as const;

export const fontFamily = {
  extraLight: 'Montserrat-ExtraLight',
  light: 'Montserrat-Light',
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  bold: 'Montserrat-Bold',
  extraBold: 'Montserrat-ExtraBold',
  black: 'Montserrat-Black',
} as const;

export const shadow = {
  sm: {
    shadowColor: '#00000060',
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 1.0,
    elevation: 2,
  },
  md: {
    shadowColor: '#00000070',
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 5,
    shadowOpacity: 1.0,
    elevation: 3,
  },
  lg: {
    shadowColor: '#00000080',
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 6,
    shadowOpacity: 1.0,
    elevation: 5,
  },
} as const;

export const layout = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fullWidth: {
    width: '100%',
  },
  screenPadding: {
    paddingHorizontal: spacing.md,
  },
});

export const typography = StyleSheet.create({
  h1: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.xxxl,
    color: colors.white,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.white,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  h4: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.white,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.white,
  },
  bodyLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  caption: {
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    color: colors.light,
  },
  error: {
    fontSize: fontSize.md,
    paddingLeft: spacing.sm,
    color: '#ff4949',
  },
});

export const form = StyleSheet.create({
  container: {
    width: '100%',
    top: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xxl,
  },
  input: {
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: borderRadius.round,
    flexDirection: 'row',
    marginVertical: spacing.sm,
    padding: spacing.sm,
  },
});

export const movieCard = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    width: 150,
    height: 230,
    ...shadow.md,
    borderRadius: borderRadius.sm,
  },
  image: {
    borderColor: 'transparent',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  scrollContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginTop: spacing.xl,
    width: '100%',
  },
});

export const screen = StyleSheet.create({
  withPadding: {
    paddingHorizontal: spacing.md,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  noPadding: {
    paddingTop: 0,
    paddingBottom: 0,
  },
});

export const utils = StyleSheet.create({
  textCenter: {
    textAlign: 'center',
  },
  selfCenter: {
    alignSelf: 'center',
  },
  mt5: { marginTop: 5 },
  mt10: { marginTop: spacing.sm },
  mt15: { marginTop: spacing.md },
  mt20: { marginTop: spacing.lg },
  mt30: { marginTop: spacing.xxl },
  mb10: { marginBottom: spacing.sm },
  mb20: { marginBottom: spacing.lg },
  mb30: { marginBottom: spacing.xxl },
  p15: { padding: spacing.md },
});

export const defaultStyles = StyleSheet.create({
  text: {
    color: colors.dark,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
  },
});

export const modal = StyleSheet.create({
  background: {
    backgroundColor: '#00000090',
    height: '100%',
    width: '100%',
  },
  container: {
    width: '90%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.orange,
    borderWidth: 4,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: 40,
  },
});

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type FontSize = typeof fontSize;
export type FontFamily = typeof fontFamily;
