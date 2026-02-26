import { colors, fontSize } from '@/config';

export const screenOptions = {
  headerStyle: { backgroundColor: colors.black },
  headerTintColor: colors.white,
  headerBackTitleVisible: false,
  headerStatusBarHeight: 0,
  headerTitleAlign: 'center' as const,
  headerTitleStyle: { fontFamily: 'Montserrat-Bold', fontSize: fontSize.xl },
};
