import type { MaterialCommunityIcons as MaterialCommunityIconsType } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Fragment, type ReactNode, useCallback, useMemo } from 'react';
import { Alert,ScrollView, StyleSheet, View } from 'react-native';

import BuyMeCoffeeButton from '@/components/BuyMeCoffeeButton';
import Icon from '@/components/Icon';
import ListItem from '@/components/ListItem';
import Screen from '@/components/Screen';
import Separator from '@/components/Separator';
import { colors, spacing } from '@/config';
import { getProfilePic } from '@/constants';
import { useAuth } from '@/hooks';
import { useDeleteUser,useGetCurrentUser } from '@/services';
import type { SettingsTabParamList } from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';

export default function SettingsScreen() {
  const { data: user, isLoading } = useGetCurrentUser();
  const deleteUserMutation = useDeleteUser();
  const { signOut } = useAuth();
  const { navigate } = useNavigation<NativeStackNavigationProp<SettingsTabParamList>>();

  const deleteAccount = useCallback(() => {
    Alert.alert('Are you sure?', 'Nicolas would not be pleased', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ok',
        onPress: () => {
          if (!user?._id) {
            showErrorToast('Failed to delete account');
            return;
          }

          deleteUserMutation.mutate(
            { data: { id: user._id } },
            {
              onSuccess: async () => {
                showSuccessToast('Account deleted :(');
                await signOut();
              },
            },
          );
        },
      },
    ]);
  }, [user, deleteUserMutation, signOut]);

  const logOut = useCallback(() => {
    Alert.alert('Are you sure you want to log out?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ok',
        onPress: () => signOut(),
      },
    ]);
  }, [signOut]);

  const accountItems: Array<{
    children?: ReactNode;
    disabled?: boolean;
    iconColor: string;
    iconName: keyof typeof MaterialCommunityIconsType.glyphMap;
    onPress: () => void;
    title: string;
  }> = useMemo(() => [{
    children: <Separator />,
    iconColor: colors.orange,
    iconName: 'movie-open',
    onPress: () => navigate('My Collection'),
    title: 'My Collection',
  }, {
    children: <View style={styles.spacer} />,
    iconColor: colors.orange,
    iconName: 'star-outline',
    onPress: () => navigate('My Reviews'),
    title: 'My Reviews',
  }, {
    children: <Separator />,
    iconColor: colors.white,
    iconName: 'lock',
    onPress: () => navigate('Security'),
    title: 'Security',
  }, {
    children: <Separator />,
    iconColor: colors.white,
    iconName: 'shield-alert',
    onPress: () => navigate('Privacy Policy'),
    title: 'Privacy Policy',
  }, {
    children: <View style={styles.spacer} />,
    iconColor: colors.white,
    iconName: 'help',
    onPress: () => navigate('About'),
    title: 'About',
  }, {
    children: <View style={styles.spacer} />,
    disabled: !user?.isAdmin,
    iconColor: colors.orange,
    iconName: 'shield-crown',
    onPress: () => navigate('Admin'),
    title: 'Admin',
  }, {
    children: <Separator />,
    iconColor: colors.red,
    iconName: 'logout',
    onPress: logOut,
    title: 'Log Out',
  }, {
    iconColor: colors.red,
    iconName: 'delete',
    onPress: deleteAccount,
    title: 'Delete Account',
  }], [navigate, user, deleteAccount, logOut]);

  return (
    <Screen isLoading={isLoading}>
      <ScrollView showsVerticalScrollIndicator={false} decelerationRate="fast">
        <BuyMeCoffeeButton style={styles.coffeeButton} />
        <View style={styles.container}>
          <ListItem
            onPress={() => navigate('My Account')}
            title={user?.name ?? user?.email ?? ''}
            subTitle={user?.email ?? ''}
            image={getProfilePic(user?.image)}
          />
        </View>
        <Separator modal={false} />
        <View>
          {accountItems.filter((item) => !item.disabled).map((item) => (
            <Fragment key={item.title}>
              <ListItem
                onPress={item.onPress}
                title={item.title}
                IconComponent={(
                  <Icon name={item.iconName} iconColor={item.iconColor} backgroundColor={colors.bg} />
                )}
              />
              {item.children}
            </Fragment>
          ))}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
    backgroundColor: colors.bg,
    width: '100%',
  },
  coffeeButton: {
    marginBottom: 0,
  },
  spacer: {
    height: 20,
    backgroundColor: colors.bg,
  },
  bottomSpacer: {
    height: 40,
    backgroundColor: colors.bg,
  },
});
