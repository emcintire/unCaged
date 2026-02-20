import { TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useGetCurrentUser } from '@/services';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/types';
import { borderRadius } from '@/config';

export default function AccountButton() {
  const { data: user, refetch } = useGetCurrentUser();
  const { navigate } = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const handleNavigate = () => {
    refetch();
    navigate('SettingsTab');
  };

  return (
    <TouchableOpacity onPress={handleNavigate} accessibilityRole="button" accessibilityLabel="Account settings">
      <Image source={user?.img || ''} style={styles.image} />
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
