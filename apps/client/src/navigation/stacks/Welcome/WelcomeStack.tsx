import {
  MaterialCommunityIcons, type MaterialCommunityIcons as MaterialCommunityIconsType,
} from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '@/config';
import type { Screen,WelcomeStackParamList } from '@/types';

import AuthTab from './AuthTab';
import WelcomeHomeTab from './WelcomeHomeTab';
import WelcomeSearchTab from './WelcomeSearchTab';

const Welcome_Stack = createBottomTabNavigator<WelcomeStackParamList>();

const bottomTabOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.orange,
  tabBarInactiveTintColor: colors.medium,
  tabBarShowLabel: false,
  tabBarStyle: {
    backgroundColor: colors.black,
    height: 60,
    borderTopWidth: 0,
    elevation: 0,
  },
};

const screens: Array<Screen<WelcomeStackParamList> & { icon: keyof typeof MaterialCommunityIconsType.glyphMap }> = [{
  component: AuthTab,
  name: 'AuthTab',
  icon: 'account',
}, {
  component: WelcomeHomeTab,
  name: 'HomeTab',
  icon: 'home',
}, {
  component: WelcomeSearchTab,
  name: 'SearchTab',
  icon: 'magnify',
}];

export default function WelcomeStack() {
  return (
    <Welcome_Stack.Navigator screenOptions={bottomTabOptions} initialRouteName="AuthTab">
      {screens.map((screen) => (
        <Welcome_Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialCommunityIcons name={screen.icon} color={color} size={28} />
            ),
          }}
        />
      ))}
    </Welcome_Stack.Navigator>
  );
}
