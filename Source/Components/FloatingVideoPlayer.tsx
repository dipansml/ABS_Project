import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useVideoPlayer } from './VideoPlayerContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DIALOG_WIDTH = SCREEN_WIDTH * 0.9;
const DIALOG_HEIGHT = DIALOG_WIDTH * (9 / 16);

const MINI_WIDTH = 160;
const MINI_HEIGHT = MINI_WIDTH * (9 / 16);

const MINI_MARGIN = 12;

// Ye component App.tsx me NavigationContainer ke UPAR / SAATH render karo
// (screen ke andar nahi) - taaki ye har screen ke upar float kare
// aur background touches/scroll block na ho.
function FloatingVideoPlayer() {
  const { videoUri, title, playerState, closeVideo, setPlayerState } =
    useVideoPlayer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<any>(null);

  // Position (drag ke liye) - dialog aur minimized dono states me use hoti hai
  const pan = useRef(
    new Animated.ValueXY({
      x: (SCREEN_WIDTH - DIALOG_WIDTH) / 2,
      y: 100,
    }),
  ).current;

  const lastOffset = useRef({ x: (SCREEN_WIDTH - DIALOG_WIDTH) / 2, y: 100 });

  // Orientation / statusbar sirf fullscreen state ke hisaab se badlega
  useEffect(() => {
    if (playerState === 'fullscreen') {
      StatusBar.setHidden(true);
      Orientation.lockToLandscape();
    } else {
      StatusBar.setHidden(false);
      Orientation.lockToPortrait();
    }

    return () => {
      // safety cleanup agar component unmount ho jaye
      if (playerState === 'fullscreen') {
        Orientation.lockToPortrait();
        StatusBar.setHidden(false);
      }
    };
  }, [playerState]);

  // Jab dialog <-> minimized switch ho, box ko screen ke andar hi clamp karo
  useEffect(() => {
    if (playerState === 'dialog' || playerState === 'minimized') {
      const boxW = playerState === 'dialog' ? DIALOG_WIDTH : MINI_WIDTH;
      const boxH = playerState === 'dialog' ? DIALOG_HEIGHT : MINI_HEIGHT;
      const clampedX = clamp(lastOffset.current.x, 0, SCREEN_WIDTH - boxW);
      const clampedY = clamp(lastOffset.current.y, 0, SCREEN_HEIGHT - boxH);
      lastOffset.current = { x: clampedX, y: clampedY };
      Animated.spring(pan, {
        toValue: { x: clampedX, y: clampedY },
        useNativeDriver: false,
        friction: 8,
      }).start();
    }
  }, [playerState]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => playerState !== 'fullscreen',
        onMoveShouldSetPanResponder: (_, gesture) =>
          playerState !== 'fullscreen' &&
          (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
        onPanResponderGrant: () => {
          pan.setOffset(lastOffset.current);
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          pan.flattenOffset();
          const boxW = playerState === 'dialog' ? DIALOG_WIDTH : MINI_WIDTH;
          const boxH = playerState === 'dialog' ? DIALOG_HEIGHT : MINI_HEIGHT;

          const rawX = lastOffset.current.x + gesture.dx;
          const rawY = lastOffset.current.y + gesture.dy;

          const clampedX = clamp(rawX, 0, SCREEN_WIDTH - boxW);
          const clampedY = clamp(rawY, 0, SCREEN_HEIGHT - boxH);

          lastOffset.current = { x: clampedX, y: clampedY };

          Animated.spring(pan, {
            toValue: { x: clampedX, y: clampedY },
            useNativeDriver: false,
            friction: 8,
          }).start();
        },
      }),
    [playerState],
  );

  if (playerState === 'closed' || !videoUri) {
    return null;
  }

  const isFullscreen = playerState === 'fullscreen';
  const isMinimized = playerState === 'minimized';

  const boxStyle = isFullscreen
    ? styles.fullscreenBox
    : [
        styles.floatingBox,
        {
          width: isMinimized ? MINI_WIDTH : DIALOG_WIDTH,
          height: isMinimized ? MINI_HEIGHT : DIALOG_HEIGHT,
          transform: pan.getTranslateTransform(),
        },
      ];

  return (
    // pointerEvents="box-none" -> is wrapper ke khaali hisso se touches
    // neeche wali screen tak pahunch jayenge, sirf player box touch capture karega
    <View style={styles.rootOverlay} pointerEvents="box-none">
      <Animated.View
        style={boxStyle}
        {...(!isFullscreen ? panResponder.panHandlers : {})}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="contain"
          controls={!isMinimized} // minimized me controls hata do, tap se restore hoga
          paused={false}
          muted={muted}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onError={e => {
            console.warn('Video error', e);
            setLoading(false);
            setError('Video load nahi ho payi.');
          }}
        />

        {loading && !error && !isMinimized && (
          <View style={styles.centerOverlay}>
            <Text style={styles.overlayText}>Loading...</Text>
          </View>
        )}

        {error && !isMinimized && (
          <View style={styles.centerOverlay}>
            <Text style={styles.overlayText}>{error}</Text>
          </View>
        )}

        {/* Minimized state: pura box tap karne se dialog me restore ho */}
        {isMinimized && (
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={0.8}
            onPress={() => setPlayerState('dialog')}
          />
        )}

        {/* Top-right control buttons - minimized me hide kar diye (jagah kam hai) */}
        {!isMinimized && (
          <>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeVideo}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.btnText}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.minimizeBtn}
              onPress={() => setPlayerState('minimized')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.btnText}>─</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.muteBtn}
              onPress={() => setMuted(prev => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name={muted ? 'volume-mute' : 'volume-high'}
                size={16}
                color={muted ? '#ec0e0e' : '#fff'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fullscreenBtn}
              onPress={() =>
                setPlayerState(isFullscreen ? 'dialog' : 'fullscreen')
              }
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.btnText}>{isFullscreen ? '⤡' : '⤢'}</Text>
            </TouchableOpacity>

            {title ? (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
          </>
        )}

        {/* Minimized state: chhota close button top-right corner par */}
        {isMinimized && (
          <TouchableOpacity
            style={styles.miniCloseBtn}
            onPress={closeVideo}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.btnText}>✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, value));
}

const styles = StyleSheet.create({
  rootOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999, // Android ke liye
  },
  floatingBox: {
    position: 'absolute',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  fullscreenBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
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
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  minimizeBtn: {
    position: 'absolute',
    top: 8,
    right: 80,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  muteBtn: {
    position: 'absolute',
    top: 8,
    right: 44,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullscreenBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  miniCloseBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
  },
  title: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '55%',
  },
});

export default FloatingVideoPlayer;