import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import Screen from '@/components/Screen';
import { borderRadius, colors, fontFamily, fontSize, screen, spacing } from '@/config';
import type { SettingsTabParamList } from '@/types';

type AdminNavItem = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  route: keyof SettingsTabParamList;
};

const ITEMS: Array<AdminNavItem> = [
  { label: 'Manage Reviews', icon: 'flag-outline', route: 'Admin Reviews' },
  { label: 'Manage Issues', icon: 'alert-circle-outline', route: 'Admin Issues' },
  { label: 'Submit Quote', icon: 'format-quote-close', route: 'Admin Quote' },
  { label: 'Create Movie', icon: 'movie-plus-outline', route: 'Admin Movie' },
];

export default function AdminScreen() {
  const { navigate } = useNavigation<NativeStackNavigationProp<SettingsTabParamList>>();

  return (
    <Screen style={screen.withPadding}>
      <ScrollView showsVerticalScrollIndicator={false} decelerationRate="fast">
        {ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.btn}
            onPress={() => navigate(item.route)}
          >
            <MaterialCommunityIcons name={item.icon} size={20} color={colors.orange} />
            <Text style={styles.btnText}>{item.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.medium} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.black,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  btnText: {
    flex: 1,
    color: colors.white,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
});
