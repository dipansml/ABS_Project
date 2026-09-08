import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../Types/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';

type VideoPlayerNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'VideoPlayer'
>;
type VideoPlayerRouteProp = RouteProp<RootStackParamList, 'VideoPlayer'>;

function VideoPlayerScreen() {
  const navigation = useNavigation<VideoPlayerNavProp>();
  const route = useRoute<VideoPlayerRouteProp>();
  const { videoUri, title } = route.params;
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false); // shuru me chhoti dialog
  const videoRef = useRef<any>(null);

  // Sirf jab isFullscreen change ho, tabhi orientation/statusbar change karo
  useEffect(() => {
    if (isFullscreen) {
      StatusBar.setHidden(true);
      Orientation.lockToLandscape();
    } else {
      StatusBar.setHidden(false);
      Orientation.lockToPortrait();
    }
  }, [isFullscreen]);

  // Screen unmount 
  useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
      StatusBar.setHidden(false);
    };
  }, []);

  const handleClose = useCallback(() => {
    Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    navigation.goBack();
  }, [navigation]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  return (
    <Modal
      visible
      transparent={!isFullscreen}
      animationType={isFullscreen ? 'none' : 'fade'}
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={isFullscreen ? toggleFullscreen : handleClose}
    >
      <View
        style={[
          styles.overlay,
          isFullscreen ? styles.overlayFullscreen : styles.overlayDialog,
        ]}
      >
        <SafeAreaView
          style={[
            styles.root,
            isFullscreen ? styles.rootFullscreen : styles.rootDialog,
          ]}
          edges={isFullscreen ? [] : ['top', 'bottom']}
        >
          <View style={styles.playerWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              style={styles.video}
              resizeMode="contain"
              controls
              muted={muted}
              onLoadStart={() => setLoading(true)}
              onLoad={() => setLoading(false)}
              onError={e => {
                console.warn('Video error', e);
                setLoading(false);
                setError('video not loaded');
              }}
            />

            {loading && !error && (
              <View style={styles.centerOverlay}>
                <Text style={styles.overlayText}>Loading...</Text>
              </View>
            )}

            {error && (
              <View style={styles.centerOverlay}>
                <Text style={styles.overlayText}>{error}</Text>
              </View>
            )}

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            {/* Mute/Unmute toggle button - top, close button ke left me */}
            <TouchableOpacity
              style={styles.muteBtnTop}
              onPress={() => setMuted(prev => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name={muted ? 'volume-mute' : 'volume-high'}
                size={18}
                color={muted ? '#ec0e0e' : '#fff'}
              />
            </TouchableOpacity>

            {/* Fullscreen toggle button */}
            <TouchableOpacity
              style={styles.fullscreenBtn}
              onPress={toggleFullscreen}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>
                {isFullscreen ? '⤡' : '⤢'}
              </Text>
            </TouchableOpacity>

            {title ? (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayDialog: {
    backgroundColor: 'transparent', // background hata diya, peeche ki screen dikhegi
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayFullscreen: {
    backgroundColor: '#000',
  },
  root: {
    backgroundColor: '#000',
  },
  // Chhoti dialog wala size — jaise WhatsApp/Instagram preview box
  rootDialog: {
    width: SCREEN_WIDTH * 0.9,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
 muteBtnTop: {
  position: 'absolute',
  top: 15,
  right: 50, // 👈 closeBtn (right:10 + width:30) + 10 gap
  backgroundColor: 'rgba(0,0,0,0.6)',
  width: 50,
  height: 30,
  borderRadius: 15,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
  // Fullscreen mode me poora screen cover karo
  rootFullscreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  playerWrapper: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullscreenBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    position: 'absolute',
    top: 14,
    left: 14,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '70%',
  },
});

export default VideoPlayerScreen;
