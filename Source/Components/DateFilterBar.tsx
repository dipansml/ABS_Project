
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------------------------------------------
// Constants
// ---------------------------------------------

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEKDAYS = [
  'S',
  'M',
  'T',
  'W',
  'T',
  'F',
  'S',
];

// ---------------------------------------------
// Date Helpers
// ---------------------------------------------

const formatDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')} ${
    MONTHS_SHORT[date.getMonth()]
  } ${date.getFullYear()}`;

const isSameDay = (
  a: Date,
  b: Date,
): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date): Date =>
  new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  );

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#0F1E4D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  android: {
    elevation: 3,
  },
});

// ---------------------------------------------
// Custom Calendar
// ---------------------------------------------

interface CustomCalendarProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  accentColor?: string;
}

const CustomCalendar: React.FC<
  CustomCalendarProps
> = ({
  visible,
  value,
  minimumDate,
  maximumDate,
  onSelect,
  onClose,
  accentColor = '#1E3A8A',
}) => {
  const [viewDate, setViewDate] =
    useState(
      new Date(
        value.getFullYear(),
        value.getMonth(),
        1,
      ),
    );

  useEffect(() => {
    if (visible) {
      setViewDate(
        new Date(
          value.getFullYear(),
          value.getMonth(),
          1,
        ),
      );
    }
  }, [visible, value]);

  const today = useMemo(
    () => startOfDay(new Date()),
    [],
  );

  const grid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex =
      new Date(
        year,
        month,
        1,
      ).getDay();

    const totalDays =
      new Date(
        year,
        month + 1,
        0,
      ).getDate();

    const cells: (Date | null)[] = [];

    for (
      let i = 0;
      i < firstDayIndex;
      i++
    ) {
      cells.push(null);
    }

    for (
      let d = 1;
      d <= totalDays;
      d++
    ) {
      cells.push(
        new Date(
          year,
          month,
          d,
        ),
      );
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    const rows: (Date | null)[][] = [];

    for (
      let i = 0;
      i < cells.length;
      i += 7
    ) {
      rows.push(
        cells.slice(i, i + 7),
      );
    }

    return rows;
  }, [viewDate]);

  const isDisabled = (
    date: Date,
  ): boolean => {
    if (
      minimumDate &&
      startOfDay(date) <
        startOfDay(minimumDate)
    ) {
      return true;
    }

    if (
      maximumDate &&
      startOfDay(date) >
        startOfDay(maximumDate)
    ) {
      return true;
    }

    return false;
  };

  const goPrevMonth = () =>
    setViewDate(prev =>
      new Date(
        prev.getFullYear(),
        prev.getMonth() - 1,
        1,
      ),
    );

  const goNextMonth = () =>
    setViewDate(prev =>
      new Date(
        prev.getFullYear(),
        prev.getMonth() + 1,
        1,
      ),
    );

  const goPrevYear = () =>
    setViewDate(prev =>
      new Date(
        prev.getFullYear() - 1,
        prev.getMonth(),
        1,
      ),
    );

  const goNextYear = () =>
    setViewDate(prev =>
      new Date(
        prev.getFullYear() + 1,
        prev.getMonth(),
        1,
      ),
    );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>

      <TouchableOpacity
        style={styles.calendarOverlay}
        activeOpacity={1}
        onPress={onClose}>

        <TouchableOpacity
          activeOpacity={1}
          style={styles.calendarCard}
          onPress={() => {}}>

          {/* Header */}

          <View
            style={[
              styles.calendarHeader,
              {
                backgroundColor:
                  accentColor,
              },
            ]}>

            <TouchableOpacity
              onPress={goPrevYear}
              style={styles.calendarNavBtn}
              hitSlop={8}>

              <Text
                style={
                  styles.calendarNavText
                }>
                «
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goPrevMonth}
              style={styles.calendarNavBtn}
              hitSlop={8}>

              <Text
                style={
                  styles.calendarNavText
                }>
                ‹
              </Text>
            </TouchableOpacity>

            <Text
              style={
                styles.calendarHeaderText
              }>
              {MONTHS[
                viewDate.getMonth()
              ]}{' '}
              {viewDate.getFullYear()}
            </Text>

            <TouchableOpacity
              onPress={goNextMonth}
              style={styles.calendarNavBtn}
              hitSlop={8}>

              <Text
                style={
                  styles.calendarNavText
                }>
                ›
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNextYear}
              style={styles.calendarNavBtn}
              hitSlop={8}>

              <Text
                style={
                  styles.calendarNavText
                }>
                »
              </Text>
            </TouchableOpacity>

          </View>

          {/* Weekdays */}

          <View
            style={styles.calendarWeekRow}>
            {WEEKDAYS.map(
              (w, idx) => (
                <View
                  key={`${w}-${idx}`}
                  style={
                    styles.calendarWeekCell
                  }>
                  <Text
                    style={
                      styles.calendarWeekText
                    }>
                    {w}
                  </Text>
                </View>
              ),
            )}
          </View>

          {/* Days */}

          <View>
            {grid.map(
              (row, rIdx) => (
                <View
                  key={`row-${rIdx}`}
                  style={
                    styles.calendarDayRow
                  }>
                  {row.map(
                    (
                      date,
                      cIdx,
                    ) => {
                      if (!date) {
                        return (
                          <View
                            key={`empty-${rIdx}-${cIdx}`}
                            style={
                              styles.calendarDayCell
                            }
                          />
                        );
                      }

                      const disabled =
                        isDisabled(
                          date,
                        );

                      const selected =
                        isSameDay(
                          date,
                          value,
                        );

                      const isToday =
                        isSameDay(
                          date,
                          today,
                        );

                      return (
                        <TouchableOpacity
                          key={date.toISOString()}
                          style={
                            styles.calendarDayCell
                          }
                          disabled={
                            disabled
                          }
                          onPress={() => {
                            onSelect(
                              date,
                            );
                            onClose();
                          }}>

                          <View
                            style={[
                              styles.calendarDayCircle,

                              selected && {
                                backgroundColor:
                                  accentColor,
                              },

                              !selected &&
                                isToday &&
                                styles.calendarTodayRing,
                            ]}>

                            <Text
                              style={[
                                styles.calendarDayText,

                                selected &&
                                  styles.calendarDayTextSelected,

                                disabled &&
                                  styles.calendarDayTextDisabled,
                              ]}>
                              {date.getDate()}
                            </Text>

                          </View>

                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              ),
            )}
          </View>

          {/* Footer */}

          <View
            style={styles.calendarFooter}>

            <TouchableOpacity
              onPress={() => {
                const t =
                  new Date();

                if (
                  !isDisabled(t)
                ) {
                  onSelect(t);
                  onClose();
                }
              }}>

              <Text
                style={[
                  styles.calendarFooterLink,
                  {
                    color:
                      accentColor,
                  },
                ]}>
                Today
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}>

              <Text
                style={
                  styles.calendarFooterCancel
                }>
                Close
              </Text>

            </TouchableOpacity>

          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};


// ---------------------------------------------
// Date Filter Bar
// ---------------------------------------------

interface DateFilterBarProps {
  startDate: Date;
  endDate: Date | null;
  onChangeStartDate: (
    date: Date,
  ) => void;
  onChangeEndDate: (
    date: Date | null,
  ) => void;
  onSearch?: () => void;
  searching?: boolean;
}

const DateFilterBar: React.FC<
  DateFilterBarProps
> = ({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onSearch,
  searching = false,
}) => {
  const [
    showStartPicker,
    setShowStartPicker,
  ] = useState(false);

  const [
    showEndPicker,
    setShowEndPicker,
  ] = useState(false);

  const today =
    startOfDay(new Date());

  return (
    <View style={styles.filterCard}>

      <View style={styles.filterRow}>

        {/* Start Date */}

        <View style={styles.dateField}>
          <Text
            style={styles.dateLabel}>
            Start Date
          </Text>

          <TouchableOpacity
            style={styles.dateInput}
            activeOpacity={0.7}
            onPress={() =>
              setShowStartPicker(true)
            }>

            <Text
              style={styles.dateValue}>
              {formatDate(startDate)}
            </Text>

            <Text
              style={styles.dateIcon}>
              📅
            </Text>

          </TouchableOpacity>
        </View>

        {/* End Date */}

        <View style={styles.dateField}>
          <Text
            style={styles.dateLabel}>
            End Date
          </Text>

          <TouchableOpacity
            style={styles.dateInput}
            activeOpacity={0.7}
            onPress={() =>
              setShowEndPicker(true)
            }>

            <Text
              style={styles.dateValue}>
              {endDate
                ? formatDate(endDate)
                : 'Select End Date'}
            </Text>

            <Text
              style={styles.dateIcon}>
              📅
            </Text>

          </TouchableOpacity>
        </View>

      </View>

      {/* Search */}

      <TouchableOpacity
        style={[
          styles.searchButton,
          searching &&
            styles.searchButtonDisabled,
        ]}
        activeOpacity={0.85}
        onPress={onSearch}
        disabled={searching}>

        <Text
          style={
            styles.searchButtonText
          }>
          Search
        </Text>

      </TouchableOpacity>

      {/* Start Calendar */}

      <CustomCalendar
        visible={showStartPicker}
        value={startDate}
        maximumDate={today}
        onSelect={date => {
          onChangeStartDate(date);
          onChangeEndDate(null);
        }}
        onClose={() =>
          setShowStartPicker(false)
        }
      />

      {/* End Calendar */}

      <CustomCalendar
        visible={showEndPicker}
        value={
          endDate ?? startDate
        }
        minimumDate={startDate}
        maximumDate={today}
        onSelect={onChangeEndDate}
        onClose={() =>
          setShowEndPicker(false)
        }
      />

    </View>
  );
};

export default DateFilterBar;

const styles = StyleSheet.create({
  // -----------------------------------------
  // Filter
  // -----------------------------------------

  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...CARD_SHADOW,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  dateField: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },

  dateInput: {
    borderWidth: 1,
    borderColor: '#D8DEEB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateValue: {
    fontSize: 14,
    color: '#1F2937',
  },

  dateIcon: {
    fontSize: 14,
  },

  searchButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },

  searchButtonDisabled: {
    opacity: 0.7,
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // -----------------------------------------
  // Calendar
  // -----------------------------------------

  calendarOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(15,30,77,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  calendarCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  calendarNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor:
      'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarNavText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },

  calendarHeaderText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
  },

  calendarWeekRow: {
    flexDirection: 'row',
    paddingTop: 14,
    paddingHorizontal: 10,
  },

  calendarWeekCell: {
    flex: 1,
    alignItems: 'center',
  },

  calendarWeekText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9AA5B8',
  },

  calendarDayRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  calendarDayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarDayCircle: {
    width: '78%',
    height: '78%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarTodayRing: {
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
  },

  calendarDayText: {
    fontSize: 13.5,
    color: '#1F2937',
    fontWeight: '500',
  },

  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  calendarDayTextDisabled: {
    color: '#CBD2E1',
  },

  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F8',
    marginTop: 6,
  },

  calendarFooterLink: {
    fontSize: 13.5,
    fontWeight: '700',
  },

  calendarFooterCancel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#9AA5B8',
  },
});
