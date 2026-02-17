export type FindByTitleDto = {
  title: string;
  category?: string;
  direction?: 'asc' | 'desc' | 1 | -1;
};
