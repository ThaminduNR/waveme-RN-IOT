import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MyCameraNativeComponent from '../../../specs/MyCameraNativeComponent';

const HTTP_RELAY_URL = 'http://192.168.100.254:3000';

function CameraComponent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>('');
  const [gestureConfidence, setGestureConfidence] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
  const isDarkMode = useColorScheme() === 'dark';

  const brightnessTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastGestureRef = useRef<string>('');

  const requestCameraPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Waveme needs access to your camera for gesture recognition',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCameraActive(true);
        } else {
          Alert.alert('Permission Denied', 'Camera access is required for gesture recognition');
        }
      } catch (err) {
        console.warn(err);
        Alert.alert('Error', 'Failed to request camera permission');
      }
    } else {
      setCameraActive(true);
    }
  }, []);

  const publishCommand = useCallback(async (action: string) => {
    try {
      const response = await fetch(`${HTTP_RELAY_URL}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (result.success) {
        console.log('Command sent:', action);
        setConnectionStatus('Connected');
      } else {
        console.warn('Command failed:', result.error);
        setConnectionStatus('Error');
      }
    } catch (err) {
      console.error('Failed to send command:', err);
      setConnectionStatus('Disconnected');
    }
  }, []);

  const startBrightnessTimer = useCallback((action: 'BRIGHTNESS_UP' | 'BRIGHTNESS_DOWN') => {
    if (brightnessTimerRef.current) return;

    publishCommand(action);

    brightnessTimerRef.current = setInterval(() => {
      publishCommand(action);
    }, 500);
  }, [publishCommand]);

  const stopBrightnessTimer = useCallback(() => {
    if (brightnessTimerRef.current) {
      clearInterval(brightnessTimerRef.current);
      brightnessTimerRef.current = null;
    }
  }, []);

  const handleGestureDetected = useCallback((event: any) => {
    const { gesture, confidence } = event.nativeEvent;

    if (confidence < 0.6) return;

    setDetectedGesture(gesture);
    setGestureConfidence(confidence);

    if (gesture === lastGestureRef.current) return;
    lastGestureRef.current = gesture;

    if (gesture !== 'Thumb_Up' && gesture !== 'Thumb_Down') {
      stopBrightnessTimer();
    }

    switch (gesture) {
      case 'Open_Palm':
        publishCommand('ON');
        break;
      case 'Closed_Fist':
        publishCommand('OFF');
        break;
      case 'Thumb_Up':
        startBrightnessTimer('BRIGHTNESS_UP');
        break;
      case 'Thumb_Down':
        startBrightnessTimer('BRIGHTNESS_DOWN');
        break;
      case 'None':
      default:
        stopBrightnessTimer();
        break;
    }
  }, [publishCommand, startBrightnessTimer, stopBrightnessTimer]);

  const handleError = useCallback((event: any) => {
    const { error } = event.nativeEvent;
    console.error('Camera error:', error);
    Alert.alert('Camera Error', error);
  }, []);

  const toggleCamera = useCallback(() => {
    if (!cameraActive) {
      requestCameraPermission();
    } else {
      setCameraActive(false);
      setDetectedGesture('');
      setGestureConfidence(0);
      stopBrightnessTimer();
    }
  }, [cameraActive, requestCameraPermission, stopBrightnessTimer]);

  const testConnection = useCallback(async () => {
    try {
      setConnectionStatus('Testing...');
      const response = await fetch(`${HTTP_RELAY_URL}/health`);
      const result = await response.json();
      if (result.server && result.mqtt) {
        setConnectionStatus('Connected (MQTT OK)');
        Alert.alert('Connection OK', 'Server and MQTT broker are both connected!');
      } else if (result.server) {
        setConnectionStatus('Server OK, MQTT Down');
        Alert.alert('Partial', 'HTTP server is running but MQTT broker is not connected.');
      }
    } catch (err) {
      setConnectionStatus('Disconnected');
      Alert.alert('Connection Failed', 'Cannot reach the relay server. Check WiFi and IP address.');
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: safeAreaInsets.top }]}>
        <Text style={styles.headerText}>Waveme - Gesture Recognition</Text>
      </View>

      {cameraActive ? (
        <View style={styles.cameraContainer}>
          <MyCameraNativeComponent
            style={styles.camera}
            onGestureDetected={handleGestureDetected}
            onError={handleError}
          />

          {detectedGesture && (
            <View style={styles.gestureOverlay}>
              <Text style={styles.gestureText}>
                Gesture: {detectedGesture}
              </Text>
              <Text style={styles.confidenceText}>
                Confidence: {(gestureConfidence * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, { color: isDarkMode ? '#fff' : '#000' }]}>
            Welcome to Waveme!
          </Text>
          <Text style={[styles.welcomeSubtext, { color: isDarkMode ? '#ccc' : '#666' }]}>
            Tap the button below to start gesture recognition
          </Text>
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>Test IoT Connection</Text>
          </TouchableOpacity>
          <Text style={[styles.statusInfo, { color: isDarkMode ? '#aaa' : '#555' }]}>
            Status: {connectionStatus}
          </Text>
        </View>
      )}

      <View style={[styles.buttonContainer, { paddingBottom: safeAreaInsets.bottom }]}>
        <TouchableOpacity
          style={[styles.button, cameraActive ? styles.buttonActive : styles.buttonInactive]}
          onPress={toggleCamera}
        >
          <Text style={styles.buttonText}>
            {cameraActive ? 'Stop Camera' : 'Start Camera'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          IoT: {connectionStatus} | MediaPipe: {cameraActive ? 'Running' : 'Stopped'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  gestureOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  gestureText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 18,
    color: '#FFFF00',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  testButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusInfo: {
    fontSize: 14,
    marginTop: 8,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonInactive: {
    backgroundColor: '#4CAF50',
  },
  buttonActive: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBar: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default CameraComponent;
