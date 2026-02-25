import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AccountButton from '@/components/AccountButton';
import AppLogo from '@/components/AppLogo';
import { screenOptions } from '@/navigation/stacks/screenOptions';
import HomeScreen from '@/screens/Home/HomeScreen';
import type { HomeTabParamList, Screen } from '@/types';

const Home_Tab = createNativeStackNavigator<HomeTabParamList>();

const screens: Array<Screen<HomeTabParamList>> = [
  {
    name: 'Home',
    component: HomeScreen,
    options: ({
      headerLeft: AppLogo,
      headerRight: AccountButton,
    }),
  },
];

export default function HomeStackScreen() {
  return (
    <Home_Tab.Navigator screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Home_Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options ?? {}}
        />
      ))}
    </Home_Tab.Navigator>
  );
}
