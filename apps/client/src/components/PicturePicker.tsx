import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { borderRadius, colors, spacing } from '@/config';
import { PROFILE_PICS } from '@/constants';
import AppButton from './AppButton';
import Icon from './Icon';
import { useGetCurrentUser, useUpdateUser, getGetCurrentUserQueryKey } from '@/services';

type Props = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

export default function PicturePicker({ modalVisible, setModalVisible }: Props) {
  const [selected, setSelected] = useState(0); // 0-based index

  const { data: user } = useGetCurrentUser();
  const updateUserMutation = useUpdateUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.image != null) {
      setSelected(user.image - 1); // 1-based → 0-based
    }
  }, [user]);

  const handleSubmit = async () => {
    await updateUserMutation.mutateAsync({ data: { image: selected + 1 } }); // 0-based → 1-based
    setModalVisible(false);
    void queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
  };

  if (!modalVisible) { return null; }

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.closeButton}>
          <TouchableOpacity onPress={() => setModalVisible(false)} accessibilityRole="button" accessibilityLabel="Close picture picker">
            <Icon name="close" size={50} backgroundColor="transparent" iconColor={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.imagesContainer}>
          {PROFILE_PICS.map((pic, index) => (
            <View style={styles.imgContainer} key={index}>
              <View style={selected === index ? styles.selected : styles.notSelected}>
                <MaterialCommunityIcons name="check" size={40} color={colors.white} />
              </View>
              <TouchableOpacity style={styles.imgBtn} onPress={() => setSelected(index)} accessibilityRole="button" accessibilityLabel={`Profile picture ${index + 1}${selected === index ? ', selected' : ''}`}>
                <Image source={pic} style={styles.img} accessibilityLabel={`Profile picture option ${index + 1}`} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <AppButton
          title="Save"
          onPress={handleSubmit}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: `${colors.black}80`,
  },
  container: {
    backgroundColor: colors.bg,
    width: '90%',
    padding: spacing.md,
    borderColor: colors.orange,
    borderWidth: 4,
    borderRadius: borderRadius.md,
  },
  closeButton: {
    position: 'absolute',
    right: -5,
    top: -5,
  },
  imagesContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  imgContainer: {
    width: '50%',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: `${colors.black}80`,
    height: 120,
    width: 120,
    zIndex: 1,
    borderRadius: borderRadius.circle * 2,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: spacing.sm,
  },
  notSelected: {
    display: 'none',
  },
  imgBtn: {
    width: 120,
    height: 120,
    marginVertical: spacing.sm,
  },
  img: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.circle * 2,
  },
  saveButton: {
    width: '50%',
    alignSelf: 'center',
  },
});
