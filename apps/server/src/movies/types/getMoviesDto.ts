export type GetMoviesDto = {
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  search?: string;
  category?: string;
  direction?: 'asc' | 'desc' | 1 | -1;
};
