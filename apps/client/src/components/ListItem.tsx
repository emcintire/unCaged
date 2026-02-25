import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ImageSource } from 'expo-image';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { memo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet,TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';

import AppText from './AppText';

type Props = {
  IconComponent?: ReactNode;
  image?: ImageSource;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  subTitle?: string;
  title: string;
};

export default memo(function ListItem({ title, subTitle, image, IconComponent, onPress, style }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={style} accessibilityRole="button" accessibilityLabel={title}>
      <View style={styles.container}>
        {IconComponent}
        {image && <Image style={styles.image} source={image} />}
        <View style={styles.detailsContainer}>
          <AppText style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          {subTitle && (
            <AppText style={styles.subTitle} numberOfLines={2}>
              {subTitle}
            </AppText>
          )}
        </View>
        <MaterialCommunityIcons color={colors.medium} name="chevron-right" size={25} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.black,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.circle,
  },
  subTitle: {
    color: colors.light,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.light,
  },
  title: {
    fontSize: fontSize.lg,
    color: colors.white,
    fontFamily: fontFamily.medium,
  },
});
