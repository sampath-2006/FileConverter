import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, Alert, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState, useEffect } from 'react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const WEB_URL = 'https://file-converter-eight-dusky.vercel.app';
  
  // Create a custom User Agent so the Next.js app knows it's being accessed via our mobile app
  const customUserAgent = 'FileForgeMobileApp/1.0';

  useEffect(() => {
    // Hide the splash screen after exactly 4 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleMessage = async (event) => {
    try {
      const parsedData = JSON.parse(event.nativeEvent.data);
      if (parsedData.type === 'DOWNLOAD') {
        const { filename, url } = parsedData;
        
        // Clean filename to remove any invalid characters that might break Android filesystem
        const safeFilename = (filename || "converted_file").replace(/[^a-zA-Z0-9.-]/g, '_');

        // Define temporary file path
        const fileUri = FileSystem.documentDirectory + safeFilename;
        
        // Download the file natively instead of receiving base64
        const downloadResult = await FileSystem.downloadAsync(url, fileUri);
        
        // Ensure successful download
        if (downloadResult.status !== 200) {
          throw new Error("Server returned status " + downloadResult.status + " for URL: " + url);
        }

        // Trigger native share menu so user can save or share it
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert("Success", "File downloaded, but sharing is not available on this device.");
        }
      }
    } catch (e) {
      console.error("Error processing download:", e);
      Alert.alert("Download Error", String(e.message || "Unknown error occurred"));
    }
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashText}>File Forge</Text>
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: WEB_URL }} 
        style={styles.webview}
        userAgent={customUserAgent}
        allowsBackForwardNavigationGestures={true}
        bounces={false}
        onMessage={handleMessage}
      />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000080', // Navy Blue Background
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a', // Match Next.js background color
    // Add extra padding at top for Android to avoid overlapping the status bar
    paddingTop: Platform.OS === 'android' ? 25 : 0, 
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
});
