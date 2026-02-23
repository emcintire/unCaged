import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { z } from 'zod';

import type { HomeStackParamList } from '@/types';
import { useGetCurrentUser, useUpdateUser } from '@/services';
import { spacing } from '@/config';
import { showSuccessToast, toFormikValidator } from '@/utils';
import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import PicturePicker from '@/components/PicturePicker';

type FormValues = {
  name: string;
  email: string;
};

const schema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().min(1, 'Email is required').max(255).email('Email must be a valid email'),
});

const validate = toFormikValidator(schema);

export default function AccountDetailsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { navigate } = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'SettingsTab'>>();

  const { data: user, isLoading, refetch } = useGetCurrentUser();
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (values: FormValues) => {
    if (user == null || (values.name === user.name && values.email === user.email)) { return; }

    const email = values.email.toLowerCase().trim();
    const name = (values.name ?? '').trim();
    await updateUserMutation.mutateAsync({ data: { email, name }});
    navigate('SettingsTab');
    refetch();
    showSuccessToast();
  };

  return (
    <Screen isLoading={isLoading} style={styles.screen}>
      {user && (
        <>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <PicturePicker modalVisible={modalVisible} setModalVisible={setModalVisible} />
          </Modal>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => setModalVisible(true)} accessibilityRole="button" accessibilityLabel="Change profile picture">
              <View style={styles.overlay}>
                <MaterialCommunityIcons name="pencil" size={40} color="white" />
              </View>
              <Image source={user.img} style={styles.image} accessibilityLabel="Profile picture" />
            </TouchableOpacity>
          </View>
          <View style={styles.formContainer}>
            <AppForm<FormValues>
              initialValues={{ name: user.name ?? '', email: user.email }}
              onSubmit={handleSubmit}
              validate={validate}
            >
              <AppFormField<FormValues> autoComplete="name" icon="account" name="name" textContentType="name" placeholder="Name" />
              <AppFormField<FormValues>
                autoComplete="email"
                icon="email"
                keyboardType="email-address"
                name="email"
                textContentType="emailAddress"
                placeholder="Email"
              />
              <SubmitButton<FormValues> title="Save" style={styles.saveButton} />
            </AppForm>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: spacing.md,
  },
  imageContainer: {
    height: '20%',
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  image: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  saveButton: {
    marginTop: spacing.xxl,
  },
  formContainer: {
    marginTop: spacing.xxl + spacing.lg,
  },
  overlay: {
    position: 'absolute',
    height: 150,
    width: 150,
    borderRadius: 75,
    backgroundColor: '#00000060',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
