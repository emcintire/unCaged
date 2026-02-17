import Toast, { ToastType } from 'react-native-toast-message';
import type { Movie } from '@/services';
import { TOAST_DURATION } from '@/constants';

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

const showToast = (
  text1: string,
  duration: number = TOAST_DURATION.MEDIUM,
  type: ToastType,
): void => Toast.show({
  type,
  text1,
  autoHide: true,
  visibilityTime: duration,
});

export const showSuccessToast = (
  text1: string = 'Changes saved successfully!',
  duration: number = TOAST_DURATION.MEDIUM
): void => showToast(text1, duration, 'success');

export const showErrorToast = (
  text1: string = 'Something went wrong',
  duration: number = TOAST_DURATION.MEDIUM
): void => showToast(text1, duration, 'error');

export const showInfoToast = (
  text1: string,
  duration: number = TOAST_DURATION.MEDIUM
): void => showToast(text1, duration, 'info');

export const genres = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
] as const;

