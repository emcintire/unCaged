declare module '*.svg' {
  import { type SvgProps } from 'react-native-svg';
  const content: (props: SvgProps) => JSX.Element;
  export default content;
}

declare module '*.png' {
  import { type ImageSourcePropType } from 'react-native';
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  import { type ImageSourcePropType } from 'react-native';
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.jpeg' {
  import { type ImageSourcePropType } from 'react-native';
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.gif' {
  import { type ImageSourcePropType } from 'react-native';
  const value: ImageSourcePropType;
  export default value;
}

declare module '*.webp' {
  import { type ImageSourcePropType } from 'react-native';
  const value: ImageSourcePropType;
  export default value;
}
