import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '@/config';
import { PROFILE_PICS } from '@/constants';
import { getGetCurrentUserQueryKey, useGetCurrentUser, useUpdateUser } from '@/services';

import AppButton from './AppButton';

type Props = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

export default function PicturePicker({ modalVisible, setModalVisible }: Props) {
  const [selected, setSelected] = useState(0);

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
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={styles.imagesContainer}>
          {PROFILE_PICS.map((pic, index) => (
            <View key={index} style={styles.imgContainer}>
              <View style={[styles.imgRing, selected === index && styles.imgRingSelected]}>
                <TouchableOpacity
                  style={styles.imgBtn}
                  onPress={() => setSelected(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Profile picture ${index + 1}${selected === index ? ', selected' : ''}`}
                >
                  <Image source={pic} style={styles.img} accessibilityLabel={`Profile picture option ${index + 1}`} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <AppButton title="Save" onPress={handleSubmit} style={styles.saveButton} />
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setModalVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close picture picker"
        >
          <MaterialCommunityIcons name="close" size={18} color={colors.light} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backdropBg,
  },
  card: {
    width: '90%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceFaint,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlayBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  imgContainer: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  imgRing: {
    borderRadius: 64,
    borderWidth: 2.5,
    borderColor: 'transparent',
    padding: 3,
  },
  imgRingSelected: {
    borderColor: colors.orange,
  },
  imgBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    width: '50%',
    alignSelf: 'center',
  },
});
