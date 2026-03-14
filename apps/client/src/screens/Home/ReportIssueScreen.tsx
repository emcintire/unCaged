import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import { borderRadius, colors, fontFamily, fontSize, screen, spacing } from '@/config';
import { type SubmitIssueBody, useSubmitIssue } from '@/services';
import { showSuccessToast, toFormikValidator } from '@/utils';

type IssueType = 'bug' | 'feature' | 'other';

const TYPE_OPTIONS: Array<{ value: IssueType; label: string }> = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2048, 'Description too long'),
});

const validate = toFormikValidator(issueSchema);

type FormValues = { title: string; description: string };
const initialValues: FormValues = { title: '', description: '' };

export default function ReportIssueScreen() {
  const [selectedType, setSelectedType] = useState<IssueType>('bug');
  const submitMutation = useSubmitIssue();

  const handleSubmit = (values: FormValues, { resetForm }: { resetForm: () => void }) => {
    submitMutation.mutate(
      { data: { ...values, type: selectedType } as SubmitIssueBody },
      {
        onSuccess: () => {
          resetForm();
          setSelectedType('bug');
          showSuccessToast('Issue reported — thanks!');
        },
      },
    );
  };

  return (
    <Screen style={screen.withPadding}>
      <ScrollView showsVerticalScrollIndicator={false} decelerationRate="fast">
        <Text style={styles.description}>
          Found a bug or have a suggestion? Let us know and we'll look into it.
        </Text>

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, selectedType === opt.value && styles.chipActive]}
              onPress={() => setSelectedType(opt.value)}
            >
              <Text style={[styles.chipText, selectedType === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppForm<FormValues> initialValues={initialValues} onSubmit={handleSubmit} validate={validate}>
          <AppFormField<FormValues> name="title" placeholder="Short summary" icon="text-short" />
          <AppFormField<FormValues>
            name="description"
            placeholder="Describe the issue in detail..."
            icon="text"
            multiline
          />
          <SubmitButton title="Submit Report" style={styles.submitButton} />
        </AppForm>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: {
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    color: colors.medium,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  chipActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeBg,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.medium,
  },
  chipTextActive: {
    color: colors.orange,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: 40,
  },
});
