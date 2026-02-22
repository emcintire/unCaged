export type CreateReviewDto = {
  isSpoiler?: boolean;
  movieId: string;
  rating?: number;
  text: string;
};
