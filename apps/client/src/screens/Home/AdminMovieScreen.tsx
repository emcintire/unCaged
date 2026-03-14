import { ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import { screen, spacing } from '@/config';
import { type CreateMovieBody, useCreateMovie } from '@/services';
import { toFormikValidator } from '@/utils';

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

const validate = toFormikValidator(movieSchema);

const initialValues: MovieFormValues = {
  title: '',
  director: '',
  description: '',
  genres: '',
  runtime: '',
  rating: '',
  date: '',
  img: '',
};

export default function AdminMovieScreen() {
  const createMovieMutation = useCreateMovie();

  const handleSubmit = (values: MovieFormValues, { resetForm }: { resetForm: () => void }) => {
    const genres = values.genres.split(',').map((g) => g.trim()).filter(Boolean);

    createMovieMutation.mutate(
      {
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
      },
      { onSuccess: () => resetForm() },
    );
  };

  return (
    <Screen style={screen.withPadding}>
      <ScrollView showsVerticalScrollIndicator={false} decelerationRate="fast">
        <AppForm<MovieFormValues> initialValues={initialValues} onSubmit={handleSubmit} validate={validate}>
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
  submitButton: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: 40,
  },
});
