import { Fragment, ReactNode } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MaterialCommunityIcons as MaterialCommunityIconsType } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsTabParamList } from '@/types';
import { colors, showErrorToast, showSuccessToast, spacing } from '@/config';
import { useCurrentUser, useDeleteUser } from '@/services';
import { useAuth } from '@/hooks';
import Screen from '@/components/Screen';
import ListItem from '@/components/ListItem';
import Separator from '@/components/Separator';
import Icon from '@/components/Icon';
import BuyMeCoffeeButton from '@/components/BuyMeCoffeeButton';

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

const accountItems: Array<{
  children?: ReactNode;
  title: keyof SettingsTabParamList;
  iconName: keyof typeof MaterialCommunityIconsType.glyphMap;
  iconColor: string;
}> = [{
  children: <View style={styles.spacer} />,
  title: 'My Collection',
  iconName: 'movie-open',
  iconColor: colors.orange,
}, {
  children: <Separator />,
  title: 'Security',
  iconName: 'lock',
  iconColor: colors.white,
}, {
  children: <Separator />,
  title: 'Privacy Policy',
  iconName: 'shield-alert',
  iconColor: colors.white,
}, {
  title: 'About',
  iconName: 'help',
  iconColor: colors.white,
}];

export default function SettingsScreen() {
  const { data: user, isLoading } = useCurrentUser();
  const deleteUserMutation = useDeleteUser();
  const { signOut } = useAuth();
  const { navigate } = useNavigation<NativeStackNavigationProp<SettingsTabParamList>>();

  const deleteAccount = () => {
    Alert.alert('Are you sure?', 'Nicolas would not be pleased', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ok',
        onPress: async () => {
          try {
            await deleteUserMutation.mutateAsync({ id: user!._id });
            showSuccessToast('Account deleted :(');
            await signOut();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete account';
            showErrorToast(message);
          }
        },
      },
    ]);
  };

  const logOut = () => {
    Alert.alert('Are you sure you want to log out?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ok',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <Screen isLoading={isLoading}>
      <ScrollView showsVerticalScrollIndicator={false} decelerationRate="fast">
        <BuyMeCoffeeButton style={styles.coffeeButton} />
        <View style={styles.container}>
          <ListItem
            onPress={() => navigate('My Account')}
            title={user!.name ?? user!.email}
            subTitle={user!.email}
            image={{ uri: user!.img }}
          />
        </View>
        <Separator modal={false} />
        <View>
          {accountItems.map((item) => (
            <Fragment key={item.title}>
              <ListItem
                onPress={() => navigate(item.title)}
                title={item.title}
                IconComponent={(
                  <Icon name={item.iconName} iconColor={item.iconColor} backgroundColor={colors.bg} />
                )}
              />
              {item.children}
            </Fragment>
          ))}
          {user?.isAdmin && (
            <>
              <Separator />
              <ListItem
                onPress={() => navigate('Admin')}
                title="Admin"
                IconComponent={<Icon name="shield-crown" iconColor={colors.orange} backgroundColor={colors.bg} />}
              />
            </>
          )}
        </View>
        <View style={styles.spacer} />
        <ListItem
          onPress={logOut}
          title="Log Out"
          IconComponent={<Icon name="logout" backgroundColor={colors.bg} iconColor={colors.red} />}
        />
        <Separator />
        <ListItem
          onPress={deleteAccount}
          title="Delete Account"
          IconComponent={<Icon name="delete" backgroundColor={colors.bg} iconColor={colors.red} />}
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}
