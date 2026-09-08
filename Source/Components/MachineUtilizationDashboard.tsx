import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import Svg, { Circle } from 'react-native-svg';

import {
  fetchUtilizationState,
  resolveMediaUrl,
} from '../API/machines';

import CustomLoader from '../Components/CustomLoader';

// ---------------------------------------------
// Date helpers
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

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const formatDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')} ${
    MONTHS_SHORT[date.getMonth()]
  } ${date.getFullYear()}`;

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

// ---------------------------------------------
// Types
// ---------------------------------------------

type UtilizationStatus = 'Good' | 'Average' | 'Low';

/**
 * New API response structure
 */
export interface MachineUtilization {
  mc_id: string;
  date: string;
  runtime: number;
  downtime: number;
  idle: number;
  total_available_time: number;
  total_available_time_formatted: string;
  utilization_percent: number;
  image_url: string;
}

/**
 * Data used by UI
 */
interface MachineData {
  id: string;
  name: string;
  machineId: string;
  date: string;
  runtime: string;
  idle: string;
  downtime: string;
  totalAvailable: string;
  utilizationPercent: number;
  status: UtilizationStatus;
  image: string;
}

// ---------------------------------------------
// Fallback image
// ---------------------------------------------

const MACHINE_IMAGE_URL =
  'http://182.73.216.91:8000/static/images/MC-001_Running_2026-08-14_15-35-47.jpg';

// ---------------------------------------------
// Seconds -> "1h 5m 20s"
// ---------------------------------------------

const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const parts: string[] = [];

  if (h > 0) {
    parts.push(`${h}h`);
  }

  if (m > 0) {
    parts.push(`${m}m`);
  }

  if (s > 0 || parts.length === 0) {
    parts.push(`${s}s`);
  }

  return parts.join(' ');
};

// ---------------------------------------------
// Utilization -> Status
// ---------------------------------------------

const statusForPercent = (
  percent: number,
): UtilizationStatus => {
  if (percent >= 70) {
    return 'Good';
  }

  if (percent >= 40) {
    return 'Average';
  }

  return 'Low';
};

// ---------------------------------------------
// NEW API ARRAY -> UI DATA
// ---------------------------------------------

const mapUtilizationState = (
  state: MachineUtilization[],
): MachineData[] => {
  if (!Array.isArray(state)) {
    return [];
  }

  return state
    .filter(item => item && item.mc_id)
    .sort((a, b) =>
      a.mc_id.localeCompare(b.mc_id),
    )
    .map(entry => {
      const utilization = Number(
        entry.utilization_percent || 0,
      );

      return {
        id: entry.mc_id,

        // API does not currently provide machine name
        name: '',

        // New API machine ID
        machineId: entry.mc_id,

        // New API date
        date: entry.date,

        // Convert seconds to readable format
        runtime: formatDuration(entry.runtime),

        idle: formatDuration(entry.idle),

        downtime: formatDuration(entry.downtime),

        // Prefer API formatted value
        totalAvailable:
          entry.total_available_time_formatted ||
          formatDuration(entry.total_available_time),

        // Keep decimal value instead of rounding
        utilizationPercent: Number(
          utilization.toFixed(2),
        ),

        status: statusForPercent(utilization),

        // Resolve API image URL
        image:
          resolveMediaUrl(entry.image_url) ??
          MACHINE_IMAGE_URL,
      };
    });
};

// ---------------------------------------------
// Status -> color mapping
// ---------------------------------------------

const STATUS_COLORS: Record<
  UtilizationStatus,
  {
    ring: string;
    ringTrack: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  Good: {
    ring: '#1E3A8A',
    ringTrack: '#DCE6FA',
    badgeBg: '#DFF3E3',
    badgeText: '#1E8A4C',
  },

  Average: {
    ring: '#F5871F',
    ringTrack: '#FBE4CC',
    badgeBg: '#FDECD0',
    badgeText: '#C4780A',
  },

  Low: {
    ring: '#D0342C',
    ringTrack: '#F7D9D7',
    badgeBg: '#FBDBDA',
    badgeText: '#D0342C',
  },
};

// ---------------------------------------------
// Circular Progress
// ---------------------------------------------

interface CircularProgressProps {
  percent: number;
  status: UtilizationStatus;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<
  CircularProgressProps
> = ({
  percent,
  status,
  size = 42,
  strokeWidth = 7,
}) => {
  const colors = STATUS_COLORS[status];

  const radius = (size - strokeWidth) / 2;

  const circumference =
    2 * Math.PI * radius;

  const progress = Math.max(
    0,
    Math.min(100, percent),
  );

  const strokeDashoffset =
    circumference -
    (progress / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
      }}
    >
      <Svg
        width={size}
        height={size}
      >
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ring}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.progressLabelWrap}>
        <Text
          style={[
            styles.progressLabel,
            {
              color: colors.ring,
              fontSize: size * 0.24,
            },
          ]}
        >
          {progress}%
        </Text>
      </View>
    </View>
  );
};

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
      new Date(year, month, 1).getDay();

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
        new Date(year, month, d),
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
    setViewDate(
      prev =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() - 1,
          1,
        ),
    );

  const goNextMonth = () =>
    setViewDate(
      prev =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() + 1,
          1,
        ),
    );

  const goPrevYear = () =>
    setViewDate(
      prev =>
        new Date(
          prev.getFullYear() - 1,
          prev.getMonth(),
          1,
        ),
    );

  const goNextYear = () =>
    setViewDate(
      prev =>
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
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.calendarOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.calendarCard}
          onPress={() => {}}
        >
          {/* Header */}

          <View
            style={[
              styles.calendarHeader,
              {
                backgroundColor:
                  accentColor,
              },
            ]}
          >
            <TouchableOpacity
              onPress={goPrevYear}
              style={styles.calendarNavBtn}
              hitSlop={8}
            >
              <Text
                style={
                  styles.calendarNavText
                }
              >
                «
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goPrevMonth}
              style={styles.calendarNavBtn}
              hitSlop={8}
            >
              <Text
                style={
                  styles.calendarNavText
                }
              >
                ‹
              </Text>
            </TouchableOpacity>

            <Text
              style={
                styles.calendarHeaderText
              }
            >
              {MONTHS[
                viewDate.getMonth()
              ]}{' '}
              {viewDate.getFullYear()}
            </Text>

            <TouchableOpacity
              onPress={goNextMonth}
              style={styles.calendarNavBtn}
              hitSlop={8}
            >
              <Text
                style={
                  styles.calendarNavText
                }
              >
                ›
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNextYear}
              style={styles.calendarNavBtn}
              hitSlop={8}
            >
              <Text
                style={
                  styles.calendarNavText
                }
              >
                »
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weekdays */}

          <View
            style={styles.calendarWeekRow}
          >
            {WEEKDAYS.map(
              (w, idx) => (
                <View
                  key={`${w}-${idx}`}
                  style={
                    styles.calendarWeekCell
                  }
                >
                  <Text
                    style={
                      styles.calendarWeekText
                    }
                  >
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
                  }
                >
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
                          }}
                        >
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
                            ]}
                          >
                            <Text
                              style={[
                                styles.calendarDayText,

                                selected &&
                                  styles.calendarDayTextSelected,

                                disabled &&
                                  styles.calendarDayTextDisabled,
                              ]}
                            >
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
            style={styles.calendarFooter}
          >
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
              }}
            >
              <Text
                style={[
                  styles.calendarFooterLink,
                  {
                    color:
                      accentColor,
                  },
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
            >
              <Text
                style={
                  styles.calendarFooterCancel
                }
              >
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
            style={styles.dateLabel}
          >
            Start Date
          </Text>

          <TouchableOpacity
            style={styles.dateInput}
            activeOpacity={0.7}
            onPress={() =>
              setShowStartPicker(
                true,
              )
            }
          >
            <Text
              style={styles.dateValue}
            >
              {formatDate(
                startDate,
              )}
            </Text>

            <Text
              style={styles.dateIcon}
            >
              📅
            </Text>
          </TouchableOpacity>
        </View>

        {/* End Date */}

        <View style={styles.dateField}>
          <Text
            style={styles.dateLabel}
          >
            End Date
          </Text>

          <TouchableOpacity
            style={styles.dateInput}
            activeOpacity={0.7}
            onPress={() =>
              setShowEndPicker(
                true,
              )
            }
          >
            <Text
              style={styles.dateValue}
            >
              {endDate
                ? formatDate(
                    endDate,
                  )
                : 'Select End Date'}
            </Text>

            <Text
              style={styles.dateIcon}
            >
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
        disabled={searching}
      >
        <Text
          style={
            styles.searchButtonText
          }
        >
          Search
        </Text>
      </TouchableOpacity>

      {/* Start Calendar */}

      <CustomCalendar
        visible={
          showStartPicker
        }
        value={startDate}
        maximumDate={today}
        onSelect={date => {
          onChangeStartDate(
            date,
          );

          // Clear end date when
          // start date changes
          onChangeEndDate(
            null,
          );
        }}
        onClose={() =>
          setShowStartPicker(
            false,
          )
        }
      />

      {/* End Calendar */}

      <CustomCalendar
        visible={showEndPicker}
        value={
          endDate ??
          startDate
        }
        minimumDate={
          startDate
        }
        maximumDate={today}
        onSelect={
          onChangeEndDate
        }
        onClose={() =>
          setShowEndPicker(
            false,
          )
        }
      />
    </View>
  );
};

// ---------------------------------------------
// Statistic row
// ---------------------------------------------

const STAT_DOT_COLORS: Record<
  string,
  string
> = {
  Runtime: '#22C55E',
  'Idle Time': '#3B82F6',
  Downtime: '#F97316',
  'Total Available Time':
    '#8B5CF6',
};

const StatRow: React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value,
}) => (
  <View style={styles.statRow}>
    <View
      style={
        styles.statLabelWrap
      }
    >
      <View
        style={[
          styles.statDot,
          {
            backgroundColor:
              STAT_DOT_COLORS[
                label
              ] ?? '#999',
          },
        ]}
      />

      <Text
        style={styles.statLabel}
      >
        {label}
      </Text>
    </View>

    <Text
      style={styles.statValue}
    >
      {value}
    </Text>
  </View>
);

// ---------------------------------------------
// Machine Card
// ---------------------------------------------

const MachineCard: React.FC<{
  machine: MachineData;
}> = ({
  machine,
}) => {
  const colors =
    STATUS_COLORS[
      machine.status
    ];

  return (
    <View
      style={styles.machineCard}
    >
      <View
        style={styles.machineTopRow}
      >
        {/* Machine Image */}

        <Image
          source={{
            uri: machine.image,
          }}
          style={
            styles.machineImage
          }
          resizeMode="cover"
        />

        {/* Machine Information */}

        <View
          style={styles.machineInfo}
        >
          {/* Machine Name */}

          {machine.name ? (
            <Text
              style={
                styles.machineName
              }
            >
              {machine.name}
            </Text>
          ) : null}

          {/* Machine ID */}

          <Text
            style={
              styles.machineIdText
            }
          >
            Machine ID :{' '}
            <Text
              style={
                styles.machineIdValue
              }
            >
              {machine.machineId}
            </Text>
          </Text>

          {/* Date */}

          {machine.date ? (
            <Text
              style={
                styles.machineDateText
              }
            >
              Date : {machine.date}
            </Text>
          ) : null}

          {/* Runtime */}

          <StatRow
            label="Runtime"
            value={
              machine.runtime
            }
          />

          {/* Idle */}

          <StatRow
            label="Idle Time"
            value={
              machine.idle
            }
          />

          {/* Downtime */}

          <StatRow
            label="Downtime"
            value={
              machine.downtime
            }
          />

          {/* Total Available */}

          <StatRow
            label="Total Available Time"
            value={
              machine.totalAvailable
            }
          />
        </View>

        {/* Utilization */}

        <View
          style={
            styles.utilizationBox
          }
        >
          <Text
            style={
              styles.utilizationLabel
            }
          >
            Utilization
          </Text>

          <CircularProgress
            percent={
              machine.utilizationPercent
            }
            status={
              machine.status
            }
          />

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  colors.badgeBg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color:
                    colors.badgeText,
                },
              ]}
            >
              {machine.status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ---------------------------------------------
// Main Dashboard
// ---------------------------------------------

const MachineUtilizationDashboard: React.FC =
  () => {
    // -----------------------------------------
    // Default dates
    // -----------------------------------------

    const today = useMemo(
      () => new Date(),
      [],
    );

    const defaultStart =
      useMemo(() => {
        const d =
          new Date(today);

        d.setDate(
          d.getDate() - 30,
        );

        return d;
      }, [today]);

    // -----------------------------------------
    // States
    // -----------------------------------------

    const [
      startDate,
      setStartDate,
    ] =
      useState<Date>(
        defaultStart,
      );

    const [
      endDate,
      setEndDate,
    ] =
      useState<Date | null>(
        today,
      );

    const [
      machines,
      setMachines,
    ] =
      useState<MachineData[]>(
        [],
      );

    const [
      loading,
      setLoading,
    ] =
      useState(true);

    const [
      error,
      setError,
    ] =
      useState<string | null>(
        null,
      );

    // -----------------------------------------
    // Load API
    // -----------------------------------------

    const loadUtilization =
      useCallback(
        async (
          from: Date,
          to: Date,
        ) => {
          setLoading(true);
          setError(null);

          try {
            /**
             * New API returns:
             *
             * [
             *   {
             *     mc_id: "MC-001",
             *     date: "2026-09-07",
             *     runtime: 35000,
             *     ...
             *   }
             * ]
             */

            const response =
              await fetchUtilizationState(
                from,
                to,
              );

            console.log(
              'Utilization API response:',
              response,
            );

            // Make sure response is array
            if (
              !Array.isArray(
                response,
              )
            ) {
              console.warn(
                'Expected array but received:',
                response,
              );

              setMachines([]);
              setError(
                'Invalid utilization data received from server.',
              );

              return;
            }

            // Convert API array to UI array
            const mappedData =
              mapUtilizationState(
                response,
              );

            console.log(
              'Mapped machine data:',
              mappedData,
            );

            setMachines(
              mappedData,
            );
          } catch (err) {
            console.warn(
              'fetchUtilizationState failed:',
              err,
            );

            setMachines([]);

            setError(
              'Could not load utilization data. Tap Search to retry.',
            );
          } finally {
            setLoading(false);
          }
        },
        [],
      );

    // -----------------------------------------
    // Initial API call
    // -----------------------------------------

    useEffect(() => {
      loadUtilization(
        startDate,
        endDate ?? today,
      );

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -----------------------------------------
    // Search
    // -----------------------------------------

    const handleSearch =
      () => {
        if (!endDate) {
          setError(
            'Please select an End Date before searching.',
          );

          return;
        }

        loadUtilization(
          startDate,
          endDate,
        );
      };

    // -----------------------------------------
    // UI
    // -----------------------------------------

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Date Filter */}

        <DateFilterBar
          startDate={
            startDate
          }
          endDate={
            endDate
          }
          onChangeStartDate={
            setStartDate
          }
          onChangeEndDate={
            setEndDate
          }
          onSearch={
            handleSearch
          }
          searching={
            loading
          }
        />

        {/* Section title */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Machine Utilization
          Overview
        </Text>

        <View
          style={
            styles.sectionDivider
          }
        />

        {/* Error */}

        {error &&
        machines.length ===
          0 &&
        !loading ? (
          <View
            style={
              styles.centerWrap
            }
          >
            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        ) : machines.length ===
          0 &&
          !loading ? (
          <View
            style={
              styles.centerWrap
            }
          >
            <Text
              style={
                styles.noDataText
              }
            >
              No machine utilization
              data found.
            </Text>
          </View>
        ) : (
          machines.map(
            machine => (
              <MachineCard
                key={
                  machine.id
                }
                machine={
                  machine
                }
              />
            ),
          )
        )}

        {/* Loader */}

        <CustomLoader
          visible={loading}
        />
      </ScrollView>
    );
  };

export default MachineUtilizationDashboard;

// ---------------------------------------------
// Styles
// ---------------------------------------------

const CARD_SHADOW =
  Platform.select({
    ios: {
      shadowColor:
        '#0F1E4D',
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

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#F4F6FB',
    },

    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
    },

    // -----------------------------------------
    // Filter
    // -----------------------------------------

    filterCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      ...CARD_SHADOW,
    },

    filterRow: {
      flexDirection:
        'row',
      gap: 12,
      marginBottom: 12,
    },

    dateField: {
      flex: 1,
    },

    dateLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#1E3A8A',
      marginBottom: 6,
    },

    dateInput: {
      borderWidth: 1,
      borderColor:
        '#D8DEEB',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    dateValue: {
      fontSize: 14,
      color: '#1F2937',
    },

    dateIcon: {
      fontSize: 14,
    },

    searchButton: {
      backgroundColor:
        '#1E3A8A',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems:
        'center',
      justifyContent:
        'center',
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
      alignItems:
        'center',
      justifyContent:
        'center',
      padding: 24,
    },

    calendarCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 20,
      overflow: 'hidden',
      ...CARD_SHADOW,
    },

    calendarHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      paddingVertical: 14,
      paddingHorizontal: 18,
    },

    calendarNavBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor:
        'rgba(255,255,255,0.18)',
      alignItems:
        'center',
      justifyContent:
        'center',
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
      flexDirection:
        'row',
      paddingTop: 14,
      paddingHorizontal: 10,
    },

    calendarWeekCell: {
      flex: 1,
      alignItems:
        'center',
    },

    calendarWeekText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#9AA5B8',
    },

    calendarDayRow: {
      flexDirection:
        'row',
      paddingHorizontal: 10,
    },

    calendarDayCell: {
      flex: 1,
      aspectRatio: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    calendarDayCircle: {
      width: '78%',
      height: '78%',
      borderRadius: 999,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    calendarTodayRing: {
      borderWidth: 1.5,
      borderColor:
        '#1E3A8A',
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
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor:
        '#EEF1F8',
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

    // -----------------------------------------
    // Section
    // -----------------------------------------

    sectionTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: '#111827',
      marginTop: 24,
      marginBottom: 10,
    },

    sectionDivider: {
      height: 1,
      backgroundColor:
        '#E2E6F0',
      marginBottom: 16,
    },

    centerWrap: {
      paddingVertical: 48,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    errorText: {
      color: '#D0342C',
      fontSize: 13.5,
      fontWeight: '600',
      textAlign:
        'center',
      paddingHorizontal: 16,
    },

    noDataText: {
      color: '#6B7280',
      fontSize: 14,
      fontWeight: '600',
      textAlign:
        'center',
    },

    // -----------------------------------------
    // Machine Card
    // -----------------------------------------

    machineCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      padding: 11,
      marginBottom: 16,
      ...CARD_SHADOW,
    },

    machineTopRow: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
    },

    machineImage: {
      width: 85,
      height: 110,
      marginTop: 5,
      borderRadius: 14,
      backgroundColor:
        '#EEE',
    },

    machineInfo: {
      flex: 1,
      marginLeft: 12,
      marginRight: 10,
    },

    machineName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111827',
    },

    machineIdText: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 2,
      marginBottom: 4,
    },

    machineIdValue: {
      color: '#1E3A8A',
      fontWeight: '600',
    },

    machineDateText: {
      fontSize: 11.5,
      color: '#6B7280',
      marginBottom: 5,
    },

    // -----------------------------------------
    // Stats
    // -----------------------------------------

    statRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginTop: 3,
    },

    statLabelWrap: {
      flexDirection:
        'row',
      alignItems:
        'center',
      flex: 1,
    },

    statDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 6,
    },

    statLabel: {
      fontSize: 12.5,
      color: '#374151',
    },

    statValue: {
      fontSize: 12.5,
      fontWeight: '700',
      color: '#111827',
      marginLeft: 4,
    },

    // -----------------------------------------
    // Utilization
    // -----------------------------------------

    utilizationBox: {
      backgroundColor:
        '#F7F9FD',
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems:
        'center',
      width: 90,
      height: 100,
    },

    utilizationLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#1E3A8A',
      marginBottom: 6,
      textAlign:
        'center',
    },

    progressLabelWrap: {
      position:
        'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    progressLabel: {
      fontWeight: '800',
    },

    statusBadge: {
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
    },

    statusBadgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
  });

