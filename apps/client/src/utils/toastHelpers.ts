import Toast, { ToastType } from 'react-native-toast-message';
import { TOAST_DURATION } from '@/constants';

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
