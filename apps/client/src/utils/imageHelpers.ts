import type { Movie } from '@/services';

export const changeResolution = (res: string, movie: Movie): Movie => {
  const imgStr = movie.img.split('');
  imgStr[movie.img.length - 5] = res;
  const newImg = imgStr.join('');

  return { ...movie, img: newImg };
};

export const changeProfilePicRes = (res: string, imgStr: string): string => {
  const str = imgStr.split('');
  str[imgStr.length - 5] = res;
  const newImgStr = str.join('');

  return newImgStr;
};
