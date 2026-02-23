import { Formik, type FormikValues, type FormikHelpers, type FormikErrors } from 'formik';
import type { PropsWithChildren } from 'react';

type Props<Values extends FormikValues> = PropsWithChildren<{
  initialValues: Values;
  onSubmit: (values: Values, formikHelpers: FormikHelpers<Values>) => void | Promise<void>;
  validate: (values: Values) => FormikErrors<Values>;
}>;
  
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
        } catch {
        }
      }}
      validate={validate}
    >
      {() => <>{children}</>}
    </Formik>
  );
}
