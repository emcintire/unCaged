import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity,View } from 'react-native';
import { z } from 'zod';

import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import { borderRadius, colors, fontFamily,fontSize, spacing } from '@/config';
import { type AddQuoteBody, type CreateMovieBody, useAddQuote, useCreateMovie } from '@/services';
import type { SettingsTabParamList } from '@/types';
import { showSuccessToast, toFormikValidator } from '@/utils';

type MovieFormValues = Omit<CreateMovieBody, 'genres' | 'description' | 'img'> & {
  genres: string;
  description: string;
  img: string;
};

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  director: z.string().min(1, 'Director is required'),
  description: z.string().optional().or(z.literal('')),
  genres: z.string().optional().or(z.literal('')),
  runtime: z.string().min(1, 'Runtime is required'),
  rating: z.string().min(1, 'Rating is required'),
  date: z.string().min(1, 'Date is required'),
  img: z.string().optional().or(z.literal('')),
});

const validateMovie = toFormikValidator(movieSchema);

const initialMovieValues: MovieFormValues = {
  title: '',
  director: '',
  description: '',
  genres: '',
  runtime: '',
  rating: '',
  date: '',
  img: '',
};

type QuoteFormValues = AddQuoteBody;

const quoteSchema = z.object({
  quote: z.string().min(1, 'Quote is required'),
  subquote: z.string().min(1, 'Sub quote is required'),
});

const validateQuote = toFormikValidator(quoteSchema);

const initialQuoteValues: QuoteFormValues = {
  quote: '',
  subquote: '',
};

export default function AdminScreen() {
  const { navigate } = useNavigation<NativeStackNavigationProp<SettingsTabParamList>>();
  const addQuoteMutation = useAddQuote();
  const createMovieMutation = useCreateMovie();

  const submitQuote = async (values: QuoteFormValues, { resetForm }: { resetForm: () => void }) => {
    addQuoteMutation.mutate({
      data: {
        quote: values.quote.trim(),
        subquote: values.subquote.trim(),
      },
    }, {
      onSuccess: () => {
        resetForm();
        showSuccessToast('Quote added');
      },
    });
  };

  const submitMovie = (values: MovieFormValues, { resetForm }: { resetForm: () => void }) => {
    const genres = values.genres
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    createMovieMutation.mutate({
      data: {
        title: values.title.trim(),
        director: values.director.trim(),
        description: values.description.trim(),
        genres,
        runtime: values.runtime.trim(),
        rating: values.rating.trim(),
        date: values.date.trim(),
        img: values.img.trim(),
      },
    }, {
      onSuccess: () => resetForm(),
    });
  };

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} decelerationRate="fast">
        {/* Manage Reviews */}
        <TouchableOpacity style={styles.manageBtn} onPress={() => navigate('Admin Reviews')}>
          <MaterialCommunityIcons name="flag-outline" size={20} color={colors.orange} />
          <Text style={styles.manageBtnText}>Manage Reviews</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.medium} />
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Submit Quote</Text>
        <AppForm<QuoteFormValues>
          initialValues={initialQuoteValues}
          onSubmit={submitQuote}
          validate={validateQuote}
        >
          <AppFormField<QuoteFormValues> name="quote" placeholder="Quote" icon="format-quote-close" />
          <AppFormField<QuoteFormValues> name="subquote" placeholder="Sub quote" icon="format-quote-open" />
          <SubmitButton title="Submit Quote" style={styles.submitButton} />
        </AppForm>

        <Text style={[styles.sectionHeader, styles.movieSection]}>Create Movie</Text>
        <AppForm<MovieFormValues>
          initialValues={initialMovieValues}
          onSubmit={submitMovie}
          validate={validateMovie}
        >
          <AppFormField<MovieFormValues> name="title" placeholder="Title" icon="movie" />
          <AppFormField<MovieFormValues> name="director" placeholder="Director" icon="account" />
          <AppFormField<MovieFormValues> name="description" placeholder="Description (optional)" icon="text" />
          <AppFormField<MovieFormValues> name="genres" placeholder="Genres (comma separated)" icon="tag" />
          <AppFormField<MovieFormValues> name="runtime" placeholder="Runtime (e.g. 3h 34m)" icon="clock-outline" />
          <AppFormField<MovieFormValues> name="rating" placeholder="Rating (e.g. PG-13)" icon="star" />
          <AppFormField<MovieFormValues> name="date" placeholder="Release date (e.g. 2001-09-11)" icon="calendar" />
          <AppFormField<MovieFormValues> name="img" placeholder="https://i.imgur.com/eUjramKh.jpg" icon="image" />
          <SubmitButton title="Create Movie" style={styles.submitButton} />
        </AppForm>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.black,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  manageBtnText: {
    flex: 1,
    color: colors.white,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  sectionHeader: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.white,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  movieSection: {
    marginTop: spacing.xxl,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: 40,
  },
});
