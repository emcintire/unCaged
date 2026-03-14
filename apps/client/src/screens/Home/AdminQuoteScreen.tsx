import { ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import { screen, spacing } from '@/config';
import { type AddQuoteBody, useAddQuote } from '@/services';
import { showSuccessToast, toFormikValidator } from '@/utils';

type QuoteFormValues = AddQuoteBody;

const quoteSchema = z.object({
  quote: z.string().min(1, 'Quote is required'),
  subquote: z.string().min(1, 'Sub quote is required'),
});

const validate = toFormikValidator(quoteSchema);
const initialValues: QuoteFormValues = { quote: '', subquote: '' };

export default function AdminQuoteScreen() {
  const addQuoteMutation = useAddQuote();

  const handleSubmit = (values: QuoteFormValues, { resetForm }: { resetForm: () => void }) => {
    addQuoteMutation.mutate(
      { data: { quote: values.quote.trim(), subquote: values.subquote.trim() } },
      {
        onSuccess: () => {
          resetForm();
          showSuccessToast('Quote added');
        },
      },
    );
  };

  return (
    <Screen style={screen.withPadding}>
      <ScrollView showsVerticalScrollIndicator={false} decelerationRate="fast">
        <AppForm<QuoteFormValues> initialValues={initialValues} onSubmit={handleSubmit} validate={validate}>
          <AppFormField<QuoteFormValues> name="quote" placeholder="Quote" icon="format-quote-close" />
          <AppFormField<QuoteFormValues> name="subquote" placeholder="Sub quote" icon="format-quote-open" />
          <SubmitButton title="Submit Quote" style={styles.submitButton} />
        </AppForm>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: 40,
  },
});
