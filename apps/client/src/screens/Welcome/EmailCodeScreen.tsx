import { View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import type { WelcomeAuthTabParamList } from '@/types';
import { useCheckCode } from '@/services';
import { form, typography, utils, showErrorToast, screen } from '@/config';
import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import { toFormikValidator } from '@/utils/toFormikValidator';
import { STORAGE_KEYS } from '@/constants';

const schema = z.object({
  code: z.string().min(1, 'Code is required'),
});

const validate = toFormikValidator(schema);

type EmailCodeFormValues = {
  code: string;
};

export default function EmailCodeScreen() {
  const checkCodeMutation = useCheckCode();
  const { navigate } = useNavigation<NativeStackNavigationProp<WelcomeAuthTabParamList>>();

  const handleSubmit = async (values: EmailCodeFormValues) => {
    try {
      const email = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_EMAIL);
      if (!email) {
        navigate('Forgot Password');
        return;
      }

      await checkCodeMutation.mutateAsync({ data: { code: values.code, email } });
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_CODE, values.code);
      navigate('Password Reset');
    } catch {
      showErrorToast('Invalid code');
    }
  };

  return (
    <Screen style={screen.withPadding}>
      <Text style={[typography.h1, utils.selfCenter, utils.mt10]}>Check Email</Text>
      <Text style={[typography.caption, utils.selfCenter]}>(Check spam folder)</Text>
      <View style={form.container}>
        <AppForm<EmailCodeFormValues>
          initialValues={{ code: '' }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <AppFormField<EmailCodeFormValues>
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="code"
            placeholder="Enter Code                                  "
          />
          <SubmitButton<EmailCodeFormValues> title="Submit" style={form.submitButton} />
        </AppForm>
      </View>
    </Screen>
  );
}
