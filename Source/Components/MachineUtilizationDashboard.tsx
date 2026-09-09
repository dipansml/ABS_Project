import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Alert,
} from 'react-native';

import { fetchUtilizationState, resolveMediaUrl } from '../API/machines';

import { formatToDDMMYYYY } from '../Utils/CommonUtils';

import MachineUtilizationComponent, {
  MachineData,
  MachineUtilization,
} from './MachineUtilizationComponent';

import MachineFilterModal from './MachineFilterModal';
import DateFilterBar from './DateFilterBar';
import { API_BASE_URL } from '../API/machines';

// ---------------------------------------------
// Fallback image
// ---------------------------------------------

const MACHINE_IMAGE_URL =
  'http://182.73.216.91:8000/static/images/MC-001_Running_2026-08-14_15-35-47.jpg';

// ---------------------------------------------
// Duration
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
// Status
// ---------------------------------------------

const statusForPercent = (percent: number): UtilizationStatus => {
  if (percent >= 70) {
    return 'Good';
  }

  if (percent >= 40) {
    return 'Average';
  }

  return 'Low';
};

// ---------------------------------------------
// API -> UI DATA
// ---------------------------------------------

const mapUtilizationState = (state: MachineUtilization[]): MachineData[] => {
  if (!Array.isArray(state)) {
    return [];
  }

  return state
    .filter(item => item && item.mc_id)
    .sort((a, b) => a.mc_id.localeCompare(b.mc_id))
    .map(entry => {
      const utilization = Number(entry.utilization_percent || 0);

      return {
        id: entry.mc_id,

        name: '',

        machineId: entry.mc_id,

        date: formatToDDMMYYYY(entry.date),

        runtime: formatDuration(entry.runtime),

        idle: formatDuration(entry.idle),

        downtime: formatDuration(entry.downtime),

        totalAvailable:
          entry.total_available_time_formatted ||
          formatDuration(entry.total_available_time),

        utilizationPercent: Number(utilization.toFixed(2)),

        status: statusForPercent(utilization),

        image: resolveMediaUrl(entry.image_url) ?? MACHINE_IMAGE_URL,
      };
    });
};

// ---------------------------------------------
// Dashboard
// ---------------------------------------------

const MachineUtilizationDashboard: React.FC = () => {
  // -----------------------------------------
  // Dates
  // -----------------------------------------

  const today = useMemo(() => new Date(), []);

  const defaultStart = useMemo(() => {
    const d = new Date(today);

    d.setDate(d.getDate() - 0);

    return d;
  }, [today]);

  // -----------------------------------------
  // States
  // -----------------------------------------

  const [startDate, setStartDate] = useState<Date>(defaultStart);

  const [endDate, setEndDate] = useState<Date>(today);

  const [machines, setMachines] = useState<MachineData[]>([]);

  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);

  const [availableMachineIds, setAvailableMachineIds] = useState<string[]>([]);

  const [showMachineFilter, setShowMachineFilter] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------
  // API
  // -----------------------------------------

  const fetchUtilizationWithFilter = fetchUtilizationState as unknown as (
    from: Date,
    to: Date,
    machineIds?: string,
  ) => Promise<MachineUtilization[]>;

  const loadUtilization = useCallback(
    async (from: Date, to: Date, machineIds?: string) => {
      try {
        setLoading(true);
        setError(null);

        const state = await fetchUtilizationWithFilter(from, to, machineIds);

        if (!Array.isArray(state)) {
          throw new Error('Invalid utilization response');
        }

        const mappedMachines = mapUtilizationState(state);

        setMachines(mappedMachines);

        // Get machine IDs from API response
        const uniqueIds = Array.from(
          new Set(mappedMachines.map(item => item.machineId).filter(Boolean)),
        ).sort();

        // Initial / All request
        if (!machineIds) {
          setAvailableMachineIds(uniqueIds);
          setSelectedMachineIds(uniqueIds);
        }

        console.log('Mapped machines:', mappedMachines);
        console.log('Machine IDs:', uniqueIds);
      } catch (err: any) {
        console.error('Utilization API Error:', err);
        setError(err?.message || 'Failed to load machine utilization data.');
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
    //loadUtilization(today, today, 'All');
    loadUtilization(today, today);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------
  // Machine IDs
  // -----------------------------------------

  const machineIds = useMemo(() => availableMachineIds, [availableMachineIds]);

  // -----------------------------------------
  // Search
  // -----------------------------------------

  const handleSearch = () => {
    if (!endDate) {
      setError('Please select an End Date before searching.');

      return;
    }

    const isAllSelected =
      machineIds.length > 0 &&
      selectedMachineIds.length === machineIds.length &&
      machineIds.every(id => selectedMachineIds.includes(id));

    loadUtilization(
      startDate,
      endDate,
      isAllSelected ? undefined : selectedMachineIds.join(','),
    );
  };

  // -----------------------------------------
  // Machine Filter
  // -----------------------------------------

  const handleMachineFilterApply = (ids: string[]) => {
    setSelectedMachineIds(ids);

    setShowMachineFilter(false);

    if (!endDate) {
      setError('Please select an End Date before filtering.');

      return;
    }

    const isAllSelected =
      machineIds.length > 0 &&
      ids.length === machineIds.length &&
      machineIds.every(id => ids.includes(id));

    loadUtilization(
      startDate,
      endDate,
      isAllSelected ? undefined : ids.join(','),
    );
  };

  const downloadReport = async (
    machines: MachineData[],
    from: Date,
    to: Date,
  ) => {
    try {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
      };

      const fromDate = formatDate(from);
      const toDate = formatDate(to);

      const machineIds = machines
        .map(machine => machine.machineId)
        .filter(Boolean);

      const mcIds = machineIds.length > 0 ? machineIds.join(',') : 'ALL';

      const url =
        `${API_BASE_URL}/api/machines/utilization/download` +
        `?from=${fromDate}` +
        `&to=${toDate}` +
        `&mc_ids=${mcIds}`;

      console.log('Download URL:', url);

      await Linking.openURL(url);
    } catch (error) {
      console.error('Download Error:', error);

      Alert.alert('Download Failed', 'Unable to download the report.');
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <>
      <MachineUtilizationComponent
        machines={machines}
        loading={loading}
        error={error}
        headerComponent={
          <>
            {/* Date Filter */}

            <DateFilterBar
              startDate={startDate}
              endDate={endDate}
              onChangeStartDate={setStartDate}
              onChangeEndDate={setEndDate}
              onSearch={handleSearch}
              searching={loading}
            />

            {/* Section Header */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Machine Utilization Overview
              </Text>

              {machines.length > 0 ? (
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowMachineFilter(true)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../Images/filter.png')}
                    style={styles.filterIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ) : null}
              {machines.length > 0 ? (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => downloadReport(machines, startDate, endDate)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../Images/download.png')}
                    style={styles.filterIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.sectionDivider} />
          </>
        }
      />

      {/* Machine Filter Modal */}

      <MachineFilterModal
        visible={showMachineFilter}
        machineIds={availableMachineIds}
        selectedMachineIds={selectedMachineIds}
        onClose={() => setShowMachineFilter(false)}
        onApply={handleMachineFilterApply}
      />
    </>
  );
};

export default MachineUtilizationDashboard;

// ---------------------------------------------
// Styles
// ---------------------------------------------

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom: 6,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: '#222',
  },

  filterButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#afccf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -40,
  },

  downloadButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#afccf8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterIcon: {
    width: 20,
    height: 20,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: '#E2E6F0',
    marginBottom: 16,
  },
});
