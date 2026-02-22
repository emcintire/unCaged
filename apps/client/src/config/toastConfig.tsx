import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from './colors';
import { borderRadius, spacing, fontSize, fontFamily } from './theme';

type ToastConfigProps = {
  text1?: string;
  text2?: string;
};

const styles = StyleSheet.create({
  successContainer: {
    minHeight: 60,
    height: 'auto',
    width: '90%',
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  errorContainer: {
    minHeight: 60,
    height: 'auto',
    width: '90%',
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  notificationText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.light,
    paddingLeft: spacing.sm,
    width: '88%',
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const toastConfig = {
  success: ({ text1 }: ToastConfigProps) => (
    <View style={styles.successContainer}>
      <View style={[styles.iconContainer, { backgroundColor: colors.green }]}>
        <MaterialCommunityIcons name="check-bold" color={colors.white} size={17} />
      </View>
      <Text style={styles.notificationText}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }: ToastConfigProps) => (
    <View style={styles.errorContainer}>
      <View style={[styles.iconContainer, { backgroundColor: colors.red }]}>
        <MaterialCommunityIcons name="exclamation-thick" color={colors.white} size={17} />
      </View>
      <Text style={styles.notificationText}>{text1}</Text>
    </View>
  ),
};
