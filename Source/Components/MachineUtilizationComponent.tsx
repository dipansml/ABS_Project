import React from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Svg, { Circle, Line, Path } from 'react-native-svg';

import CustomLoader from '../Components/CustomLoader';

type UtilizationStatus = 'Good' | 'Average' | 'Low';

/**
 * ---------------------------------------------
 * API Response
 * ---------------------------------------------
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
 * ---------------------------------------------
 * UI Data
 * ---------------------------------------------
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

/**
 * ---------------------------------------------
 * Status Colors
 * ---------------------------------------------
 */
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

/**
 * ---------------------------------------------
 * Gauge Configuration
 * ---------------------------------------------
 */

/**
 * The gauge will use:
 *
 * 0 - 100    -> green/yellow
 * 100 - 150  -> orange
 * 150 - 200  -> red
 *
 * If value > 200, gauge maximum automatically
 * increases.
 */
const getGaugeMax = (value: number): number => {
  if (value <= 200) {
    return 200;
  }

  if (value <= 300) {
    return 300;
  }

  if (value <= 500) {
    return 500;
  }

  return Math.ceil(value / 100) * 100;
};

/**
 * ---------------------------------------------
 * Speedometer
 * ---------------------------------------------
 */
interface SpeedometerProps {
  percent: number;
  status: UtilizationStatus;
  size?: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({
  percent,
  status,
  size = 108,
}) => {
  const value = Math.max(0, Number(percent) || 0);
  const maxValue = getGaugeMax(value);
  const valueColor = STATUS_COLORS[status]?.ring ?? '#1E3A8A';

  /**
   * Gauge dimensions
   */
  const centerX = size / 2;
  const centerY = size * 0.54;

  const radius = size * 0.4;

  const strokeWidth = size * 0.14;

  /**
   * Convert polar coordinates to SVG coordinates.
   *
   * 180° = left
   * 270° = top
   * 360° = right
   */
  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angle: number,
  ) => {
    const angleInRadians = (angle * Math.PI) / 180;

    return {
      x: cx + r * Math.cos(angleInRadians),

      y: cy + r * Math.sin(angleInRadians),
    };
  };

  /**
   * Create an arc path.
   */
  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const start = polarToCartesian(cx, cy, r, startAngle);

    const end = polarToCartesian(cx, cy, r, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `
      M ${start.x} ${start.y}
      A ${r} ${r} 0
        ${largeArcFlag}
        1
        ${end.x} ${end.y}
    `;
  };

  /**
   * -------------------------------------------
   * Multi-color gauge
   * -------------------------------------------
   *
   * 12 segments:
   *
   * Green
   * Lime
   * Yellow
   * Orange
   * Red
   */
  const gaugeColors = [
    '#008F39',
    '#00A63C',
    '#19B83C',
    '#3CCB2E',
    '#72D11F',
    '#B4D91B',
    '#E0C514',
    '#F29A00',
    '#F56A00',
    '#F33B00',
    '#F01C00',
    '#E60000',
  ];

  /**
   * Number of segments.
   */
  const segmentCount = gaugeColors.length;

  /**
   * Total semicircle = 180 degrees.
   */
  const segmentAngle = 180 / segmentCount;

  /**
   * Small gap between segments.
   */
  const segmentGap = 0.8;

  /**
   * Value ratio.
   */
  const valueRatio = Math.min(value / maxValue, 1);

  /**
   * Needle angle.
   *
   * 180 = left
   * 270 = top
   * 360 = right
   */
  const needleAngle = 180 + valueRatio * 180;

  /**
   * Needle.
   */
  const needleLength = radius - strokeWidth * 0.65;

  const needlePoint = polarToCartesian(
    centerX,
    centerY,
    needleLength,
    needleAngle,
  );

  /**
   * SVG height.
   */
  const svgHeight = size * 0.62;

  /**
   * Label values.
   */
  const labelCount = 5;

  const labels = Array.from({ length: labelCount }, (_, index) => {
    const labelValue = (maxValue / (labelCount - 1)) * index;

    const angle = 180 + (index / (labelCount - 1)) * 180;

    const labelRadius = radius + 12;

    const point = polarToCartesian(centerX, centerY, labelRadius, angle);

    return {
      value: Math.round(labelValue),
      x: point.x,
      y: point.y,
    };
  });

  return (
    <View
      style={[
        styles.speedometer,
        {
          width: size + 12,
          height: size * 0.76,
        },
      ]}
    >
      {/* ---------------------------------- */}
      {/* Gauge */}
      {/* ---------------------------------- */}

      <Svg width={size} height={svgHeight} viewBox={`0 0 ${size} ${svgHeight}`}>
        {gaugeColors.map((color, index) => {
          const startAngle = 180 + index * segmentAngle + segmentGap;

          const endAngle = 180 + (index + 1) * segmentAngle - segmentGap;

          const path = describeArc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle,
          );

          return (
            <Path
              key={`gauge-${index}`}
              d={path}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}

        {/* -------------------------------- */}
        {/* Needle */}
        {/* -------------------------------- */}

        <Line
          x1={centerX}
          y1={centerY}
          x2={needlePoint.x}
          y2={needlePoint.y}
          stroke="#EF1B16"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Needle center */}
        <Circle cx={centerX} cy={centerY} r={5} fill="#EF1B16" />
      </Svg>

      {/* ---------------------------------- */}
      {/* Scale labels */}
      {/* ---------------------------------- */}

      {labels.map(label => (
        <Text
          key={`label-${label.value}`}
          style={[
            styles.gaugeLabel,
            {
              left: label.x - 4,
              top: label.y - 7,
            },
          ]}
        >
          {label.value}
        </Text>
      ))}

      {/* ---------------------------------- */}
      {/* Current Value */}
      {/* ---------------------------------- */}

      <View
        style={[
          styles.currentValueContainer,
          {
            width: size,
            top: size * 0.51,
            left: size * 0.15,
          },
        ]}
      >
        <Text
          style={[
            styles.currentValue,
            {
              color: valueColor,
              fontSize: size * 0.16,
            },
          ]}
        >
          {value}%
        </Text>
      </View>
    </View>
  );
};

/**
 * ---------------------------------------------
 * Statistic row
 * ---------------------------------------------
 */
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

/**
 * ---------------------------------------------
 * Machine Card
 * ---------------------------------------------
 */
const MachineCard: React.FC<{
  machine: MachineData;
}> = ({ machine }) => {
  const colors = STATUS_COLORS[machine.status];

  return (
    <View style={styles.machineCard}>
      <View style={styles.machineTopRow}>
        {/* -------------------------------- */}
        {/* Machine Image */}
        {/* -------------------------------- */}

        <Image
          source={{
            uri: machine.image,
          }}
          style={styles.machineImage}
          resizeMode="cover"
        />

        {/* -------------------------------- */}
        {/* Machine Information */}
        {/* -------------------------------- */}

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
          <Text style={styles.machineIdText}>
            Date : <Text style={styles.dateLabel}>{machine.date}</Text>
          </Text>

          {/* Runtime */}
          <StatRow label="Runtime" value={machine.runtime} />

          {/* Downtime */}
          <StatRow label="Downtime" value={machine.downtime} />

          {/* Total Available */}
          <StatRow
            label="Total Available Time"
            value={machine.totalAvailable}
          />
        </View>

        {/* -------------------------------- */}
        {/* Utilization */}
        {/* -------------------------------- */}

        <View style={styles.utilizationBox}>
          <Text style={styles.utilizationLabel}>Utilization</Text>

          <Speedometer
            percent={machine.utilizationPercent}
            status={machine.status}
            size={90}
          />

          {/* Status Badge */}
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

/**
 * ---------------------------------------------
 * Machine Utilization Component
 * ---------------------------------------------
 */
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
                {'\n'}
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

/**
 * ---------------------------------------------
 * Styles
 * ---------------------------------------------
 */

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
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

  /**
   * -----------------------------------------
   * Machine Card
   * -----------------------------------------
   */

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
    marginRight: 5,
    minWidth: 0,
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

  dateLabel: {
    color: '#1E3A8A',
    fontWeight: '600',
  },

  /**
   * -----------------------------------------
   * Statistics
   * -----------------------------------------
   */

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
    minWidth: 0,
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

  /**
   * -----------------------------------------
   * Utilization Box
   * -----------------------------------------
   */

  utilizationBox: {
    backgroundColor: '#F7F9FD',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    width: 125,
    minHeight: 140,
  },

  utilizationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 0,
    textAlign: 'center',
  },

  /**
   * -----------------------------------------
   * Speedometer
   * -----------------------------------------
   */

  speedometer: {
    alignItems: 'center',
    position: 'relative',
    marginTop: 10,
  },

  gaugeLabel: {
    position: 'absolute',
    fontSize: 8,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    width: 24,
    includeFontPadding: false,
    lineHeight: 10,
  },

  currentValueContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    top: 0,
  },

  currentValue: {
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    includeFontPadding: false,
  },

  /**
   * -----------------------------------------
   * Status Badge
   * -----------------------------------------
   */

  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
