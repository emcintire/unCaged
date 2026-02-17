import { createNativeStackNavigator } from '@react-navigation/native-stack';


import type { Screen, SettingsTabParamList } from '@/types';
import { screenOptions } from '@/navigation/stacks/screenOptions';
import AboutScreen from '@/screens/Home/AboutScreen';
import AdminScreen from '@/screens/Home/AdminScreen';
import AccountButton from '@/components/AccountButton';
import AppLogo from '@/components/AppLogo';
import AccountDetailsScreen from '@/screens/Home/AccountDetailsScreen';
import CollectionScreen from '@/screens/Home/CollectionScreen';
import PrivacyPolicyScreen from '@/screens/Home/PrivacyPolicy';
import SecurityScreen from '@/screens/Home/SecurityScreen';
import SettingsScreen from '@/screens/Home/SettingsScreen';

const Settings_Tab = createNativeStackNavigator<SettingsTabParamList>();

const screens: Array<Screen<SettingsTabParamList>> = [{
  name: 'Settings',
  component: SettingsScreen,
  options: ({
    headerLeft: AppLogo,
    headerRight: AccountButton,
  }),
}, {
  name: 'My Account',
  component: AccountDetailsScreen,
}, {
  name: 'My Collection',
  component: CollectionScreen,
}, {
  name: 'Security',
  component: SecurityScreen,
  options: ({ title: 'Change Password' }),
}, {
  name: 'About',
  component: AboutScreen,
}, {
  name: 'Admin',
  component: AdminScreen,
}, {
  name: 'Privacy Policy',
  component: PrivacyPolicyScreen,
}];

export default function SettingsTab() {
  return (
    <Settings_Tab.Navigator screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Settings_Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options ?? {}}
        />
      ))}
    </Settings_Tab.Navigator>
  );
}
