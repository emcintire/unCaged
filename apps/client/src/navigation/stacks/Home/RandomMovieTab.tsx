import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RandomTabParamList, Screen } from '@/types';
import { screenOptions } from '@/navigation/stacks/screenOptions';
import AccountButton from '@/components/AccountButton';
import AppLogo from '@/components/AppLogo';
import RandomMovieScreen from '@/screens/Home/RandomMovieScreen';

const Random_Movie_Tab = createNativeStackNavigator<RandomTabParamList>();

const screens: Array<Screen<RandomTabParamList>> = [
  {
    name: 'Random',
    component: RandomMovieScreen,
    options: ({
      headerLeft: AppLogo,
      headerRight: AccountButton,
    }),
  },
];

export default function RandomMovieTab() {
  return (
    <Random_Movie_Tab.Navigator screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Random_Movie_Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options ?? {}}
        />
      ))}
    </Random_Movie_Tab.Navigator>
  );
}
