import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'

import { borderRadius, colors, fontFamily,fontSize, spacing } from '@/config'
import { genres } from '@/constants'
import { type SetState } from '@/types'

import AppDropdown from './AppDropdown'
import Separator from './Separator'

type Props = {
  genreFilter: string;
  mandyFilter: boolean;
  setFiltersModalVisible: SetState<boolean>;
  setGenreFilter: (genre: string) => void;
  setMandyFilter: SetState<boolean>;
  setUnseenFilter: SetState<boolean>;
  setWatchlistFilter: SetState<boolean>;
  unseenFilter: boolean;
  watchlistFilter: boolean;
};

const genreOptions = ['All', ...genres] as const

export default function RandomMovieFilters({
  genreFilter,
  mandyFilter,
  setFiltersModalVisible,
  setGenreFilter,
  setMandyFilter,
  setUnseenFilter,
  setWatchlistFilter,
  unseenFilter,
  watchlistFilter,
}: Props) {
  return (
    <View style={styles.filtersModalContainer}>
      <Pressable
        style={styles.transparentBg}
        onPress={() => setFiltersModalVisible(false)}
        accessibilityRole="button"
        accessibilityLabel="Close filters"
      />
      <View style={styles.filtersModal}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Filters</Text>
        </View>
        <Separator modal />
        <View style={{ width: '75%' }}>
          <Text style={styles.label}>Unseen</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Switch
            onValueChange={setUnseenFilter}
            value={unseenFilter}
            trackColor={{ true: colors.orange }}
            thumbColor={colors.light}
            accessibilityLabel="Filter unseen movies"
          />
        </View>
        <Separator modal />
        <View style={{ width: '75%' }}>
          <Text style={styles.label}>On Watchlist</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Switch
            onValueChange={setWatchlistFilter}
            value={watchlistFilter}
            trackColor={{ true: colors.orange }}
            thumbColor={colors.light}
            accessibilityLabel="Filter watchlist movies"
          />
        </View>
        <Separator modal />
        <View style={{ width: '75%' }}>
          <Text style={styles.label}>Masterpieces</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Switch
            onValueChange={setMandyFilter}
            value={mandyFilter}
            trackColor={{ true: colors.orange }}
            thumbColor={colors.light}
            accessibilityLabel="Filter masterpiece movies"
          />
        </View>
        <Separator modal />
        <View style={{ width: '50%' }}>
          <Text style={styles.label}>Genre</Text>
        </View>
        <View style={{ width: '50%' }}>
          <AppDropdown
            items={genreOptions}
            selectedValue={genreFilter}
            onSelect={setGenreFilter}
            listStyle={styles.dropdownList}
            accessibilityLabel="Select genre filter"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: spacing.sm,
  },
  headerText: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.xxl + 1,
  },
  filtersModalContainer: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  transparentBg: {
    height: '100%',
    backgroundColor: '#0000007b',
  },
  filtersModal: {
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: borderRadius.circle + 15,
    borderTopRightRadius: borderRadius.circle + 15,
    borderColor: colors.orange,
    borderWidth: 4,
    borderBottomWidth: 0,
    backgroundColor: colors.white,
    height: '50%',
    padding: spacing.lg,
    paddingTop: borderRadius.circle + 15,
    alignItems: 'center',
    alignContent: 'space-evenly',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    color: 'black',
    fontSize: fontSize.base,
    fontFamily: fontFamily.bold,
  },
  dropdownList: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    elevation: 5,
  },
})
