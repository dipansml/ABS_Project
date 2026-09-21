import React, { useCallback, useEffect, useState } from 'react';

import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface MachineFilterModalProps {
  visible: boolean;
  machineIds: string[];
  selectedMachineIds: string[];
  onClose: () => void;
  onApply: (selectedMachineIds: string[]) => void;
}

// ---------------------------------------------
// Shared: checkbox + row components
// ---------------------------------------------

interface SelectAllRowProps {
  allSelected: boolean;
  onPress: () => void;
}

const SelectAllRow: React.FC<SelectAllRowProps> = React.memo(
  ({ allSelected, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View
        style={[
          styles.checkbox,
          allSelected && styles.checkboxSelected,
        ]}
      >
        {allSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>
      <Text style={styles.machineText}>All</Text>
    </TouchableOpacity>
  ),
);

interface MachineRowProps {
  machineId: string;
  selected: boolean;
  onPress: (machineId: string) => void;
}

const MachineRow: React.FC<MachineRowProps> = React.memo(
  ({ machineId, selected, onPress }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(machineId)}
    >
      <View
        style={[
          styles.checkbox,
          selected && styles.checkboxSelected,
        ]}
      >
        {selected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>
      <Text style={styles.machineText}>{machineId}</Text>
    </TouchableOpacity>
  ),
);

// ---------------------------------------------
// Android: Modal + FlatList (original)
// ---------------------------------------------

const MachineFilterModalAndroid: React.FC<MachineFilterModalProps> = ({
  visible,
  machineIds,
  selectedMachineIds,
  onClose,
  onApply,
}) => {
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedMachineIds);
    }
  }, [visible, selectedMachineIds]);

  const allSelected =
    machineIds.length > 0 &&
    tempSelected.length === machineIds.length &&
    machineIds.every(id => tempSelected.includes(id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setTempSelected([]);
    } else {
      setTempSelected([...machineIds]);
    }
  }, [allSelected, machineIds]);

  const toggleMachine = useCallback((machineId: string) => {
    setTempSelected(prev => {
      if (prev.includes(machineId)) {
        return prev.filter(id => id !== machineId);
      }
      return [...prev, machineId];
    });
  }, []);

  const handleApply = useCallback(() => {
    if (tempSelected.length === 0) {
      return;
    }
    onApply(tempSelected);
  }, [tempSelected, onApply]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.title}>Select Machine</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {machineIds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No machines available</Text>
            </View>
          ) : (
            <FlatList
              data={machineIds}
              keyExtractor={item => item}
              ListHeaderComponent={
                <SelectAllRow allSelected={allSelected} onPress={toggleAll} />
              }
              renderItem={({ item }) => {
                const selected = tempSelected.includes(item);
                return (
                  <MachineRow
                    machineId={item}
                    selected={selected}
                    onPress={toggleMachine}
                  />
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          )}

          <TouchableOpacity
            style={[
              styles.applyButton,
              tempSelected.length === 0 && styles.applyButtonDisabled,
            ]}
            disabled={tempSelected.length === 0}
            onPress={handleApply}
          >
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------
// iOS: View overlay + ScrollView (no Modal/FlatList)
// ---------------------------------------------

const MachineFilterModalIOS: React.FC<MachineFilterModalProps> = ({
  visible,
  machineIds,
  selectedMachineIds,
  onClose,
  onApply,
}) => {
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedMachineIds);
    }
  }, [visible, selectedMachineIds]);

  const allSelected =
    machineIds.length > 0 &&
    tempSelected.length === machineIds.length &&
    machineIds.every(id => tempSelected.includes(id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setTempSelected([]);
    } else {
      setTempSelected([...machineIds]);
    }
  }, [allSelected, machineIds]);

  const toggleMachine = useCallback((machineId: string) => {
    setTempSelected(prev => {
      if (prev.includes(machineId)) {
        return prev.filter(id => id !== machineId);
      }
      return [...prev, machineId];
    });
  }, []);

  const handleApply = useCallback(() => {
    if (tempSelected.length === 0) {
      return;
    }
    onApply(tempSelected);
  }, [tempSelected, onApply]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.iosOverlay} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.iosOverlayBg}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.iosContainer}>

        <View style={styles.header}>
          <Text style={styles.title}>Select Machine</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {machineIds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No machines available</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.iosScroll}
            showsVerticalScrollIndicator={false}
          >
            <SelectAllRow allSelected={allSelected} onPress={toggleAll} />
            {machineIds.map(id => (
              <MachineRow
                key={id}
                machineId={id}
                selected={tempSelected.includes(id)}
                onPress={toggleMachine}
              />
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          style={[
            styles.applyButton,
            tempSelected.length === 0 && styles.applyButtonDisabled,
          ]}
          disabled={tempSelected.length === 0}
          onPress={handleApply}
        >
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

// ---------------------------------------------
// Platform switch
// ---------------------------------------------

const MachineFilterModal = React.memo(
  Platform.OS === 'ios' ? MachineFilterModalIOS : MachineFilterModalAndroid,
);

export default MachineFilterModal;

// ---------------------------------------------
// Styles
// ---------------------------------------------

const styles = StyleSheet.create({
  // Android Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // iOS View overlay
  iosOverlay: {
    position: 'absolute',
    // Bridge the parent container's 16px horizontal padding so the
    // dialog is perfectly centered on the screen.
    left: -16,
    right: -16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },

  iosOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  iosContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  iosScroll: {
    maxHeight: 400,
  },

  // Shared
  container: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },

  close: {
    fontSize: 22,
    color: '#555',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E6F0',
    marginVertical: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#999',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },

  checkmark: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  machineText: {
    fontSize: 16,
    color: '#222',
  },

  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: '#888',
  },

  applyButton: {
    marginTop: 12,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonDisabled: {
    opacity: 0.5,
  },

  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
