import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {
  const WEB_URL = 'https://file-converter-eight-dusky.vercel.app';
  
  // Create a custom User Agent so the Next.js app knows it's being accessed via our mobile app
  const customUserAgent = 'FileForgeMobileApp/1.0';

  const handleMessage = async (event) => {
    try {
      const parsedData = JSON.parse(event.nativeEvent.data);
      if (parsedData.type === 'DOWNLOAD') {
        const { filename, data } = parsedData;
        
        // Strip the Base64 metadata prefix (e.g. "data:image/jpeg;base64,")
        const base64Code = data.split(',')[1];
        
        // Define temporary file path
        const fileUri = FileSystem.documentDirectory + filename;
        
        // Save the file to phone storage
        await FileSystem.writeAsStringAsync(fileUri, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Trigger native share menu so user can save or share it
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert("Success", "File downloaded, but sharing is not available on this device.");
        }
      }
    } catch (e) {
      console.error("Error processing download:", e);
      Alert.alert("Download Error", "There was an error saving the file.");
    }
  };

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
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
