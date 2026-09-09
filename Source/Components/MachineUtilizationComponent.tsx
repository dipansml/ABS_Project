import React from 'react';

import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Svg, { Circle } from 'react-native-svg';

import CustomLoader from '../Components/CustomLoader';

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
export interface MachineData {
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
// Circular Progress
// ---------------------------------------------

interface CircularProgressProps {
  percent: number;
  status: UtilizationStatus;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percent,
  status,
  size = 60,
  strokeWidth = 6,
}) => {
  const colors = STATUS_COLORS[status];

  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;

  const progress = Math.max(0, Math.min(100, percent));

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
      }}
    >
      <Svg width={size} height={size}>
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
              fontSize: size * 0.2,
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
// Statistic row
// ---------------------------------------------

const STAT_DOT_COLORS: Record<string, string> = {
  Runtime: '#22C55E',
  'Idle Time': '#3B82F6',
  Downtime: '#F97316',
  'Total Available Time': '#8B5CF6',
};

const StatRow: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <View style={styles.statRow}>
    <View style={styles.statLabelWrap}>
      <View
        style={[
          styles.statDot,
          {
            backgroundColor: STAT_DOT_COLORS[label] ?? '#999',
          },
        ]}
      />

      <Text style={styles.statLabel}>{label}</Text>
    </View>

    <Text style={styles.statValue}>{value}</Text>
  </View>
);

// ---------------------------------------------
// Machine Card
// ---------------------------------------------

const MachineCard: React.FC<{
  machine: MachineData;
}> = ({ machine }) => {
  const colors = STATUS_COLORS[machine.status];

  return (
    <View style={styles.machineCard}>
      <View style={styles.machineTopRow}>
        {/* Machine Image */}

        <Image
          source={{
            uri: machine.image,
          }}
          style={styles.machineImage}
          resizeMode="cover"
        />

        {/* Machine Information */}

        <View style={styles.machineInfo}>
          {/* Machine Name */}

          {machine.name ? (
            <Text style={styles.machineName}>{machine.name}</Text>
          ) : null}

          {/* Machine ID */}

          <Text style={styles.machineIdText}>
            Machine ID :{' '}
            <Text style={styles.machineIdValue}>{machine.machineId}</Text>
          </Text>

          {/* Date */}

          {/* {machine.date ? (
            <Text
              style={
                styles.machineDateText
              }
            >
              Date : {machine.date}
            </Text>
          ) : null} */}

          <Text style={styles.machineIdText}>
            Date : <Text style={styles.dateLabel}>{machine.date}</Text>
          </Text>

          {/* Runtime */}

          <StatRow label="Runtime" value={machine.runtime} />

          {/* Idle */}

          {/* <StatRow
            label="Idle Time"
            value={
              machine.idle
            }
          /> */}

          {/* Downtime */}

          <StatRow label="Downtime" value={machine.downtime} />

          {/* Total Available */}

          <StatRow
            label="Total Available Time"
            value={machine.totalAvailable}
          />
        </View>

        {/* Utilization */}

        <View style={styles.utilizationBox}>
          <Text style={styles.utilizationLabel}>Utilization</Text>

          <CircularProgress
            percent={machine.utilizationPercent}
            status={machine.status}
          />

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: colors.badgeBg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: colors.badgeText,
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
// Machine Utilization Component
// ---------------------------------------------

export interface MachineUtilizationComponentProps {
  machines: MachineData[];
  loading?: boolean;
  error?: string | null;
  headerComponent?: React.ReactElement | null;
}

const MachineUtilizationComponent: React.FC<
  MachineUtilizationComponentProps
> = ({ machines, loading = false, error = null, headerComponent = null }) => {
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      data={machines}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <MachineCard machine={item} />}
      ListHeaderComponent={headerComponent}
      ListEmptyComponent={
        !loading ? (
          error ? (
            <View style={styles.centerWrap}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.centerWrap}>
              <Text style={styles.noDataText}>
                No machine utilization
                {
                  '\
'
                }
                data found.
              </Text>
            </View>
          )
        ) : null
      }
      ListFooterComponent={<CustomLoader visible={loading} />}
    />
  );
};

export default MachineUtilizationComponent;

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#0F1E4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  android: {
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  centerWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#D0342C',
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  noDataText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  machineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 11,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  machineTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  machineImage: {
    width: 80,
    height: 106,
    marginTop: 5,
    borderRadius: 14,
    backgroundColor: '#EEE',
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
    fontWeight: '600',
  },
  dateLabel: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 3,
  },

  statLabelWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },

  statDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
    marginTop: 3,
  },

  statLabel: {
    fontSize: 11,
    color: '#374151',
    flexShrink: 1,
  },

  statValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 4,
  },
  utilizationBox: {
    backgroundColor: '#F7F9FD',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: 100,
    height: 115,
  },
  utilizationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressLabelWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    fontWeight: '600',
    fontSize: 10,
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
