import type { Movie } from '@/services';

export const changeResolution = (res: string, movie: Movie): Movie => {
  const imgStr = movie.img.split('');
  imgStr[movie.img.length - 5] = res;
  const newImg = imgStr.join('');

  return { ...movie, img: newImg };
};
