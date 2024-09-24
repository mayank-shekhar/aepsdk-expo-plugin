import { StyleSheet, Text, View } from 'react-native';
import { MobileCore, Lifecycle } from '@adobe/react-native-aepcore';
import { useEffect, useState } from 'react';

export default function App() {
  const [version, setVersion] = useState('');
  useEffect(() => {
    MobileCore.li

    MobileCore.extensionVersion().then((version) => {
      console.log('Extension version: ', version);
      setVersion(version);
    });
  }, []);
  return (
    <View style={styles.container}>
      <Text>{version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
