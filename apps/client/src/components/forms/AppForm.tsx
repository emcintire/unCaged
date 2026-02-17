import { Formik } from 'formik';
import type { FormikValues, FormikHelpers, FormikErrors } from 'formik';
import type { ReactNode } from 'react';

type Props<Values extends FormikValues> = {
  initialValues: Values;
  onSubmit: (values: Values, formikHelpers: FormikHelpers<Values>) => void;
  validate: (values: Values) => FormikErrors<Values>;
  children: ReactNode;
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
      onSubmit={onSubmit}
      validate={validate}
    >
      {() => <>{children}</>}
    </Formik>
  );
}
