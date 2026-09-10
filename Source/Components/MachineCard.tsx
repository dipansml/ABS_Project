import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Machine, STATUS_TO_SIGNAL } from '../Types/machine';
import { resolveMediaUrl } from '../API/machines';
import SignalIndicator from './SignalIndicator';
import { formatDuration } from '../Utils/CommonUtils';

type Props = {
  machine: Machine;
  onPress?: () => void;
};

function MachineCard({ machine, onPress }: Props) {
  const hasVideo = Boolean(machine.video_url);
  const isOffline = machine.camera_status === 'offline';
  const imageUri = resolveMediaUrl(machine.image_url);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    let hh = date.getHours();
    const min = String(date.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${String(hh).padStart(2, '0')}:${min} ${ampm}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <TouchableOpacity
          style={styles.imageBox}
          onPress={onPress}
          disabled={!onPress || !hasVideo || isOffline}
          activeOpacity={0.7}
        >
          {isOffline ? (
            // Camera offline: show the "no camera / no video" icon
            <View style={styles.offlineBox}>
              <Image
                source={require('../Images/camera_no_bg.png')} // Replace with your actual "no camera" icon path
                style={styles.offlineIcon}
                resizeMode="contain"
              />
              <Text style={styles.offlineText}>Camera Offline</Text>
            </View>
          ) : (
            <>
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}

              {hasVideo && (
                <View style={styles.playOverlay}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.label}>
            Machine ID :{' '}
            <Text style={styles.machineIdValue}>{machine.mc_id}</Text>
          </Text>
          {!isOffline && (
            <View>
              <Text style={styles.label}>
                Capture Date :{' '}
                <Text style={styles.machineIdValue}>
                  {formatDate(machine.detected_at)}
                </Text>
              </Text>
              <Text style={styles.label}>
                Capture Time :{' '}
                <Text style={styles.machineIdValue}>
                  {formatTime(machine.detected_at)}
                </Text>
              </Text>
              {machine.undetected_time>0 && (
               <Text style={styles.label}>
                Undetected Time :{' '}
                <Text style={styles.machineIdValue}>
                  {formatDuration(machine.undetected_time)}
                </Text>
              </Text>
              )}
            </View>
          )}{' '}
        </View>

        {!isOffline && (
          <View style={styles.signalBox}>
            <SignalIndicator
              status={STATUS_TO_SIGNAL[machine.status]}
              size={50}
            />
          </View>
        )}

        {/* <View style={styles.signalBox}>
          <SignalIndicator status={STATUS_TO_SIGNAL[machine.status]} size={50} />
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBox: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    ...StyleSheet.absoluteFillObject,
  },
  playIcon: {
    color: '#fff',
    fontSize: 26,
  },
  offlineBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineIcon: {
    width: 40,
    height: 40,
    tintColor: '#9CA3AF',
  },
  offlineText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  infoBox: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '400',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  machineIdValue: {
    color: '#1E3A8A',
    fontWeight: '600',
    fontSize: 11,
  },
  signalBox: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MachineCard;
