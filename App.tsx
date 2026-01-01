/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useCallback } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import MyCameraNativeComponent from './specs/MyCameraNativeComponent';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>('');
  const [gestureConfidence, setGestureConfidence] = useState<number>(0);
  const isDarkMode = useColorScheme() === 'dark';

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
          console.log('Camera permission granted');
          setCameraActive(true);
        } else {
          console.log('Camera permission denied');
          Alert.alert('Permission Denied', 'Camera access is required for gesture recognition');
        }
      } catch (err) {
        console.warn(err);
        Alert.alert('Error', 'Failed to request camera permission');
      }
    } else {
      // iOS permissions are handled via Info.plist
      setCameraActive(true);
    }
  }, []);

  const handleGestureDetected = useCallback((event: any) => {
    const { gesture, confidence } = event.nativeEvent;
    console.log('Gesture detected:', gesture, 'Confidence:', confidence);
    setDetectedGesture(gesture);
    setGestureConfidence(confidence);
  }, []);

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
    }
  }, [cameraActive, requestCameraPermission]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: safeAreaInsets.top }]}>
        <Text style={styles.headerText}>Waveme - Gesture Recognition</Text>
      </View>

      {/* Camera View or Welcome Screen */}
      {cameraActive ? (
        <View style={styles.cameraContainer}>
          <MyCameraNativeComponent
            style={styles.camera}
            onGestureDetected={handleGestureDetected}
            onError={handleError}
          />
          
          {/* Gesture Info Overlay */}
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
        </View>
      )}

      {/* Control Button */}
      <View style={[styles.buttonContainer, { paddingBottom: safeAreaInsets.bottom }]}>
        <TouchableOpacity
          style={[styles.button, cameraActive ? styles.buttonActive : styles.buttonInactive]}
          onPress={toggleCamera}
        >
          <Text style={styles.buttonText}>
            {cameraActive ? '📹 Stop Camera' : '📸 Start Camera'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Info */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          MediaPipe Status: {cameraActive ? '✅ Running' : '⏸️ Stopped'}
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

export default App;
