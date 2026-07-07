import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, Alert, View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useState, useEffect } from 'react';
import { uploadFile, pollStatus, getDownloadUrl } from './api';

const tools = [
  { id: 'image', title: 'Image Converter', desc: 'Convert JPG, PNG, WEBP', target: 'png', colors: ['#8b5cf6', '#06b6d4'] },
  { id: 'pdf2jpg', title: 'PDF to Image', desc: 'Extract pages as images', target: 'jpg', colors: ['#ec4899', '#f59e0b'] },
  { id: 'video', title: 'Video Converter', desc: 'Convert MP4, MOV, AVI', target: 'mp4', colors: ['#06b6d4', '#10b981'] },
  { id: 'audio', title: 'Audio Converter', desc: 'Convert MP3, WAV', target: 'mp3', colors: ['#f43f5e', '#8b5cf6'] },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, converting, downloading
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    // Hide the splash screen after exactly 4 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleToolSelect = async (tool) => {
    try {
      // 1. Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      setSelectedTool(tool);
      setStatus('uploading');
      setProgressText('Uploading file...');

      // 2. Upload
      const uploadRes = await uploadFile(file.uri, file.name, file.mimeType, tool.target);
      const jobId = uploadRes.job_id;

      // 3. Poll Status
      setStatus('converting');
      setProgressText('Converting...');
      let isCompleted = false;
      
      while (!isCompleted) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await pollStatus(jobId);
        
        if (statusRes.status === 'completed') {
          isCompleted = true;
        } else if (statusRes.status === 'failed') {
          throw new Error(statusRes.error_message || 'Conversion failed on server');
        }
      }

      // 4. Download natively
      setStatus('downloading');
      setProgressText('Downloading result...');
      
      const downloadUrl = getDownloadUrl(jobId);
      const safeFilename = `converted_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Request permission to save file using SAF (Storage Access Framework)
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (permissions.granted) {
        // Create the file in the user's selected directory
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri, 
          safeFilename, 
          'application/octet-stream'
        );
        
        // Download directly to that new SAF file uri
        const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);
        
        if (downloadResult.status !== 200) {
          throw new Error(`Server returned status ${downloadResult.status}`);
        }
        
        setStatus('idle');
        Alert.alert("Success", "File saved successfully!");
      } else {
        // Fallback to internal cache and Share sheet if they cancel the save prompt
        const cacheUri = FileSystem.documentDirectory + safeFilename;
        const downloadResult = await FileSystem.downloadAsync(downloadUrl, cacheUri);
        if (downloadResult.status === 200 && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(cacheUri, { dialogTitle: 'Save your converted file' });
        }
        setStatus('idle');
      }

    } catch (e) {
      console.error(e);
      setStatus('idle');
      Alert.alert("Error", String(e.message || "An unknown error occurred"));
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
      <View style={styles.header}>
        <Text style={styles.title}>File Forge</Text>
        <Text style={styles.subtitle}>Select a tool to start converting natively.</Text>
      </View>

      {status !== 'idle' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>{progressText}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {tools.map((tool) => (
            <TouchableOpacity key={tool.id} activeOpacity={0.8} onPress={() => handleToolSelect(tool)}>
              <LinearGradient
                colors={tool.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{tool.title}</Text>
                <Text style={styles.cardDesc}>{tool.desc}</Text>
                <View style={styles.cardArrow}><Text style={styles.cardArrowText}>→</Text></View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000080',
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
    paddingTop: Platform.OS === 'android' ? 40 : 0, 
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
  },
  grid: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArrowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  }
});
