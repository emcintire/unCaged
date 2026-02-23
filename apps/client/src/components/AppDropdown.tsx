import { useRef, useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { colors, borderRadius, fontSize, fontFamily, spacing } from '@/config'

type Props = {
  accessibilityLabel?: string;
  buttonOpenStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  chevronColor?: string;
  items: ReadonlyArray<string>;
  itemStyle?: ViewStyle;
  itemTextStyle?: TextStyle;
  listStyle?: ViewStyle;
  onOpenChange?: (open: boolean) => void;
  onSelect: (item: string) => void;
  overlayDropdown?: boolean;
  selectedValue: string;
};

export default function AppDropdown({
  accessibilityLabel = 'Select an option',
  buttonOpenStyle,
  buttonStyle,
  buttonTextStyle,
  chevronColor = colors.black,
  items,
  itemStyle,
  itemTextStyle,
  listStyle,
  onOpenChange,
  onSelect,
  overlayDropdown = false,
  selectedValue,
}: Props) {
  const [open, setOpen] = useState(false)
  const [dropdownTop, setDropdownTop] = useState(0)
  const [dropdownLeft, setDropdownLeft] = useState(0)
  const [dropdownWidth, setDropdownWidth] = useState(0)
  const buttonRef = useRef<View>(null)

  const toggle = () => {
    if (!open && overlayDropdown) {
      buttonRef.current?.measureInWindow((x, y, width, height) => {
        setDropdownTop(y + height)
        setDropdownLeft(x)
        setDropdownWidth(width)
        setOpen(true)
        onOpenChange?.(true)
      })
    } else {
      const next = !open
      setOpen(next)
      onOpenChange?.(next)
    }
  }

  const close = () => {
    setOpen(false)
    onOpenChange?.(false)
  }

  const listItems = items.map((item) => (
    <TouchableOpacity
      key={item}
      style={[styles.item, itemStyle, item === selectedValue && styles.itemSelected]}
      onPress={() => { onSelect(item); close() }}
      accessibilityRole="button"
      accessibilityLabel={item}
    >
      <Text style={[styles.itemText, itemTextStyle, item === selectedValue && styles.itemTextSelected]}>
        {item}
      </Text>
    </TouchableOpacity>
  ))

  return (
    <View ref={buttonRef}>
      <TouchableOpacity
        style={[styles.button, buttonStyle, open && buttonOpenStyle]}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={[styles.buttonText, buttonTextStyle]}>{selectedValue}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={chevronColor}
        />
      </TouchableOpacity>
      {overlayDropdown ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={close}>
            <View
              style={[
                styles.list,
                listStyle,
                {
                  position: 'absolute',
                  top: dropdownTop,
                  left: dropdownLeft,
                  width: dropdownWidth,
                },
              ]}
            >
              <ScrollView nestedScrollEnabled>
                {listItems}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      ) : (
        open && (
          <ScrollView style={[styles.list, listStyle]} nestedScrollEnabled>
            {listItems}
          </ScrollView>
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
  },
  buttonText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: 'black',
  },
  list: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
  },
  item: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  itemSelected: {
    backgroundColor: colors.orange,
  },
  itemText: {
    fontFamily: fontFamily.bold,
    color: 'black',
  },
  itemTextSelected: {
    color: colors.white,
  },
})
