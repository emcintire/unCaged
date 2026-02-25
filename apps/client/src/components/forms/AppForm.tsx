import Axios from 'axios';
import { Formik, type FormikErrors,type FormikHelpers, type FormikValues } from 'formik';
import type { PropsWithChildren } from 'react';

import { env } from '@/config';
import { logger } from '@/utils';

type Props<Values extends FormikValues> = PropsWithChildren<{
  initialValues: Values;
  onSubmit: (values: Values, formikHelpers: FormikHelpers<Values>) => void | Promise<void>;
  validate: (values: Values) => FormikErrors<Values>;
}>;

const isHandledRequestError = (error: unknown): boolean => {
  if (Axios.isAxiosError(error)) return true;

  const maybeError = error as {
    response?: { status?: number };
  };

  return typeof maybeError?.response?.status === 'number';
};
  
export default function AppForm<Values extends FormikValues>({
  initialValues,
  onSubmit,
  validate,
  children,
}: Props<Values>) {
  return (
    <Formik<Values>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={async (values, formikHelpers) => {
        try {
          await onSubmit(values, formikHelpers);
        } catch (error) {
          if (isHandledRequestError(error)) return;

          if (env.isDev) {
            logger.error('Unhandled submit error', error, undefined, {
              context: 'form',
            });
          }
        }
      }}
      validate={validate}
    >
      {() => <>{children}</>}
    </Formik>
  );
}
