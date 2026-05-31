import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';

export default function HomeScreen() {
  const [reading, setReading] = useState('');

  const handleSubmit = () => {
    const value = Number(reading);

    if (isNaN(value) || value < 70 || value > 600) {
      Alert.alert(
        'Invalid Reading',
        'Glucose reading must be between 70 and 600 mg/dL'
      );
      return;
    }

    Alert.alert('Success', `Reading saved: ${value}`);
    setReading('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diabetes Tracker</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter glucose reading"
        keyboardType="numeric"
        value={reading}
        onChangeText={setReading}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Reading</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});