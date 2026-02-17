import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { colors, genres, borderRadius, fontSize, fontFamily } from '@/config'
import type { SetState } from '@/types'
import AppDropdown from './AppDropdown'

type Props = {
  genre: string;
  selected: string;
  setGenre: SetState<string>;
  setSelected: SetState<string>;
  setSortDirection: SetState<'asc' | 'desc'>;
  sortDirection: 'asc' | 'desc';
};

const allGenres = ['Genre', ...genres] as const

export default function SearchFilters({
  genre,
  selected,
  setGenre,
  setSelected,
  setSortDirection,
  sortDirection,
}: Props) {
  const toggleSortDirection = () => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')

  const handleRatingPress = () => {
    if (selected === 'rating') { toggleSortDirection(); return }
    setSelected('rating')
  }

  const handleYearPress = () => {
    if (selected === 'year') { toggleSortDirection(); return }
    setSelected('year')
  }

  const handleAzPress = () => {
    if (selected === 'az') { toggleSortDirection(); return }
    setSelected('az')
  }

  return (
    <View style={styles.container}>
      <View style={styles.underSearchContainer}>
        <View style={styles.sortRow}>
          <View style={styles.sortContainer}>
            <TouchableOpacity onPress={handleRatingPress} style={[styles.sortBtn, styles.ratingBtn, selected === 'rating' && styles.activeBtn]} accessibilityRole="button" accessibilityLabel="Sort by rating">
              <Text style={styles.label}>Rating</Text>
              <MaterialCommunityIcons
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleYearPress} style={[styles.sortBtn, selected === 'year' && styles.activeBtn]} accessibilityRole="button" accessibilityLabel="Sort by year">
              <Text style={styles.label}>Year</Text>
              <MaterialCommunityIcons
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAzPress} style={[styles.sortBtn, styles.azBtn, selected === 'az' && styles.activeBtn]} accessibilityRole="button" accessibilityLabel="Sort alphabetically">
              <Text style={styles.label}>{sortDirection === 'asc' ? 'A - Z' : 'Z - A'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.genreDropdownContainer}>
            <AppDropdown
              accessibilityLabel="Filter by genre"
              buttonOpenStyle={styles.genreButtonOpen}
              buttonStyle={styles.genreButton}
              buttonTextStyle={genre !== 'Genre' ? styles.gLabelActive : styles.gLabel}
              chevronColor={colors.white}
              items={allGenres}
              itemStyle={styles.genreItem}
              itemTextStyle={styles.itemTextStyle}
              listStyle={styles.genreList}
              onSelect={setGenre}
              overlayDropdown
              selectedValue={genre}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  underSearchContainer: {
    width: '92%',
  },
  sortRow: {
    flexDirection: 'row',
    width: '100%',
  },
  sortContainer: {
    backgroundColor: colors.dark,
    borderBottomLeftRadius: borderRadius.round,
    flexDirection: 'row',
    height: 45,
    width: '70%',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  gLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs + 2,
    color: colors.white,
  },
  gLabelActive: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs + 2,
    color: colors.orange,
  },
  sortBtn: {
    width: '33.33%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.white,
    borderBottomWidth: 1,
    backgroundColor: colors.black,
  },
  activeBtn: {
    backgroundColor: colors.orange,
  },
  ratingBtn: {
    borderBottomLeftRadius: borderRadius.round,
    borderLeftWidth: 1,
  },
  azBtn: {
    flexDirection: 'column',
  },
  genreDropdownContainer: {
    width: '30%',
  },
  genreButton: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: colors.white,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderBottomRightRadius: borderRadius.round,
    borderRadius: 0,
    backgroundColor: colors.black,
    paddingHorizontal: 0,
  },
  genreList: {
    height: 150,
    marginTop: 0,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    elevation: 5,
  },
  genreButtonOpen: {
    borderBottomRightRadius: 0,
  },
  genreItem: {
    alignItems: 'center',
    paddingVertical: fontSize.xs,
  },
  itemTextStyle: {
    fontSize: fontSize.sm,
  },
})
