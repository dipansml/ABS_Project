import React, { useEffect, useState } from 'react';

import {
  FlatList,
  Modal,
  Platform,
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

const MachineFilterModal: React.FC<MachineFilterModalProps> = ({
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

  const toggleAll = () => {
    if (allSelected) {
      setTempSelected([]);
    } else {
      setTempSelected([...machineIds]);
    }
  };

  const toggleMachine = (machineId: string) => {
    setTempSelected(prev => {
      if (prev.includes(machineId)) {
        return prev.filter(id => id !== machineId);
      }

      return [...prev, machineId];
    });
  };

  const handleApply = () => {
    if (tempSelected.length === 0) {
      return;
    }

    onApply(tempSelected);
  };

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
            <Text style={styles.title}>
              Select Machine
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {machineIds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No machines available
              </Text>
            </View>
          ) : (
            <FlatList
              data={machineIds}
              keyExtractor={item => item}
              ListHeaderComponent={
                <TouchableOpacity
                  style={styles.row}
                  onPress={toggleAll}
                >
                  <View
                    style={[
                      styles.checkbox,
                      allSelected && styles.checkboxSelected,
                    ]}
                  >
                    {allSelected && (
                      <Text style={styles.checkmark}>
                        ✓
                      </Text>
                    )}
                  </View>

                  <Text style={styles.machineText}>
                    All
                  </Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => {
                const selected = tempSelected.includes(item);

                return (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => toggleMachine(item)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected && (
                        <Text style={styles.checkmark}>
                          ✓
                        </Text>
                      )}
                    </View>

                    <Text style={styles.machineText}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          )}

          <TouchableOpacity
            style={[
              styles.applyButton,
              tempSelected.length === 0 &&
                styles.applyButtonDisabled,
            ]}
            disabled={tempSelected.length === 0}
            onPress={handleApply}
          >
            <Text style={styles.applyText}>
              Apply
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default MachineFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
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