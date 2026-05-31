import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';

export default function HomeScreen() {
  const [reading, setReading] = useState('');

  const [readings, setReadings] = useState<
    { id: string; value: number }[]
  >([]);

  const handleSubmit = () => {
    const value = Number(reading);

    if (isNaN(value) || value < 70 || value > 600) {
      Alert.alert(
        'Invalid Reading',
        'Glucose reading must be between 70 and 600 mg/dL'
      );
      return;
    }

    const newReading = {
      id: Date.now().toString(),
      value,
    };

    setReadings((prev) => [newReading, ...prev]);

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

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>
          Add Reading
        </Text>
      </TouchableOpacity>

      <FlatList
        data={readings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {item.value} mg/dL
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
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
    borderColor: '#cccccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  card: {
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },

  cardText: {
    fontSize: 16,
    fontWeight: '600',
  },
});