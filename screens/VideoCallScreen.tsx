import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function VideoCallScreen() {
  const room = 'kamala-support-room'; 

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: `https://meet.jit.si/${room}` }}
        style={styles.webview}
        allowsFullscreenVideo
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
