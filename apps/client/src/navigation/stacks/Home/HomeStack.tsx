import {
  MaterialCommunityIcons, type MaterialCommunityIcons as MaterialCommunityIconsType,
} from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '@/config';
import type { HomeStackParamList, Screen } from '@/types';

import HomeTab from './HomeTab';
import RandomMovieTab from './RandomMovieTab';
import SearchTab from './SearchTab';
import SettingsTab from './SettingsTab';
import WatchlistTab from './WatchlistTab';

const Home_Stack = createBottomTabNavigator<HomeStackParamList>();

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

const screens: Array<Screen<HomeStackParamList> & { icon: keyof typeof MaterialCommunityIconsType.glyphMap }> = [{
  component: HomeTab,
  name: 'HomeTab',
  icon: 'home',
}, {
  component: WatchlistTab,
  name: 'WatchlistTab',
  icon: 'bookmark',
}, {
  component: SearchTab,
  name: 'SearchTab',
  icon: 'magnify',
}, {
  component: RandomMovieTab,
  name: 'RandomTab',
  icon: 'dice-3',
}, {
  component: SettingsTab,
  name: 'SettingsTab',
  icon: 'cog',
}];

export default function HomeStack() {
  return (
    <Home_Stack.Navigator screenOptions={bottomTabOptions} initialRouteName="HomeTab">
      {screens.map((screen) => (
        <Home_Stack.Screen
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
    </Home_Stack.Navigator>
  );
}
