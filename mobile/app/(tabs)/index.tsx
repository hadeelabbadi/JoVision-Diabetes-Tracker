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

type Reading = {
  id: string;
  value: number;
  timestamp: string;
};

export default function HomeScreen() {
  const [reading, setReading] = useState('');
  const [readings, setReadings] = useState<Reading[]>([]);

  const handleSubmit = () => {
    const value = Number(reading);

    if (isNaN(value) || value < 70 || value > 600) {
      Alert.alert(
        'Invalid Reading',
        'Glucose reading must be between 70 and 600 mg/dL'
      );
      return;
    }

    const newReading: Reading = {
      id: Date.now().toString(),
      value,
      timestamp: new Date().toLocaleString(),
    };

    setReadings((prev) => [newReading, ...prev]);

    Alert.alert('Success', `Reading saved: ${value}`);

    setReading('');
  };

  const totalReadings = readings.length;

  const averageReading =
    readings.length > 0
      ? (
          readings.reduce((sum, item) => sum + item.value, 0) /
          readings.length
        ).toFixed(1)
      : '0';

  const latestReading =
    readings.length > 0
      ? readings[0].value
      : 'N/A';

  const getBadgeColor = (value: number) => {
    if (value > 180) return '#ef4444';
    if (value < 70) return '#facc15';
    return '#22c55e';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diabetes Tracker</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Total Readings: {totalReadings}
        </Text>

        <Text style={styles.summaryText}>
          Average Reading: {averageReading}
        </Text>

        <Text style={styles.summaryText}>
          Latest Reading: {latestReading}
        </Text>
      </View>

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
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: getBadgeColor(
                    item.value
                  ),
                },
              ]}
            />

            <Text style={styles.cardText}>
              {item.value} mg/dL
            </Text>

            <Text style={styles.timestamp}>
              {item.timestamp}
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
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
  },

  summary: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginBottom: 20,
  },

  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
    fontSize: 16,
  },

  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    marginBottom: 10,
  },

  badge: {
    width: 15,
    height: 15,
    borderRadius: 20,
    marginBottom: 10,
  },

  cardText: {
    fontSize: 16,
    fontWeight: '600',
  },

  timestamp: {
    marginTop: 5,
    fontSize: 12,
    color: '#6b7280',
  },
});