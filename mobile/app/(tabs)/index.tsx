import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{ color: 'white', fontSize: 40 }}>
        HELLO
      </Text>
    </View>
  );
}