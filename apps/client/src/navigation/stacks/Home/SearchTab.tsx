import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AccountButton from '@/components/AccountButton';
import AppLogo from '@/components/AppLogo';
import { screenOptions } from '@/navigation/stacks/screenOptions';
import SearchScreen from '@/screens/Home/SearchScreen';
import type { Screen, SearchTabParamList } from '@/types';

const Search_Tab = createNativeStackNavigator<SearchTabParamList>();

const screens: Array<Screen<SearchTabParamList>> = [
  {
    name: 'Search',
    component: SearchScreen,
    options: ({
      headerLeft: AppLogo,
      headerRight: AccountButton,
    }),
  },
];

export default function SearchTab() {
  return (
    <Search_Tab.Navigator screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Search_Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options ?? {}}
        />
      ))}
    </Search_Tab.Navigator>
  );
}
