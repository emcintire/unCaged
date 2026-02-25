import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { StyleSheet,TouchableOpacity } from 'react-native';

import { borderRadius } from '@/config';
import { getProfilePic } from '@/constants';
import { useGetCurrentUser } from '@/services';
import { type HomeStackParamList } from '@/types';

export default function AccountButton() {
  const { data: user, refetch } = useGetCurrentUser();
  const { navigate } = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const handleNavigate = () => {
    refetch();
    navigate('SettingsTab');
  };

  return (
    <TouchableOpacity onPress={handleNavigate} accessibilityRole="button" accessibilityLabel="Account settings">
      <Image source={getProfilePic(user?.image)} style={styles.image} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 35,
    height: 35,
    borderRadius: borderRadius.circle / 2,
  },
});
