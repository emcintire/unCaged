import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AccountButton from '@/components/AccountButton';
import AppLogo from '@/components/AppLogo';
import { screenOptions } from '@/navigation/stacks/screenOptions';
import WatchlistScreen from '@/screens/Home/WatchlistScreen';
import type { Screen, WatchlistTabParamList } from '@/types';

const Watchlist_Tab = createNativeStackNavigator<WatchlistTabParamList>();

const screens: Array<Screen<WatchlistTabParamList>> = [
  {
    name: 'Watchlist',
    component: WatchlistScreen,
    options: ({
      headerLeft: AppLogo,
      headerRight: AccountButton,
    }),
  },
];

export default function WatchlistTab() {
  return (
    <Watchlist_Tab.Navigator screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Watchlist_Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options ?? {}}
        />
      ))}
    </Watchlist_Tab.Navigator>
  );
}
