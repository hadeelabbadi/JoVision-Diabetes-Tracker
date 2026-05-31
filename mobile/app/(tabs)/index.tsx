import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Reading = {
  id: string;
  value: number;
  timestamp: string;
};

const STORAGE_KEY = 'diabetes_readings';

export default function HomeScreen() {
  const [reading, setReading] = useState('');
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
    saveReadings();
  }, [readings]);

  const loadReadings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        setReadings(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Load error', error);
    }
  };

  const saveReadings = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(readings)
      );
    } catch (error) {
      console.log('Save error', error);
    }
  };

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

  const clearAllReadings = () => {
    Alert.alert(
      'Delete All Readings',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setReadings([]),
        },
      ]
    );
  };

  const getBadgeColor = (value: number) => {
    if (value > 180) return '#ef4444';
    if (value < 70) return '#facc15';
    return '#22c55e';
  };

  const totalReadings = readings.length;

  const averageReading =
    readings.length > 0
      ? (
          readings.reduce(
            (sum, item) => sum + item.value,
            0
          ) / readings.length
        ).toFixed(1)
      : '0';

  const highestReading =
    readings.length > 0
      ? Math.max(...readings.map((r) => r.value))
      : 'N/A';

  const lowestReading =
    readings.length > 0
      ? Math.min(...readings.map((r) => r.value))
      : 'N/A';

  const latestReading =
    readings.length > 0
      ? readings[0].value
      : 'N/A';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Diabetes Tracker
      </Text>

      <View style={styles.summary}>
        <Text>
          Total Readings: {totalReadings}
        </Text>

        <Text>
          Average Reading: {averageReading}
        </Text>

        <Text>
          Highest Reading: {highestReading}
        </Text>

        <Text>
          Lowest Reading: {lowestReading}
        </Text>

        <Text>
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

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearAllReadings}
      >
        <Text style={styles.buttonText}>
          Clear All
        </Text>
      </TouchableOpacity>

      <Text style={styles.chartTitle}>
        Reading Chart
      </Text>

      <FlatList
        data={readings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <View style={styles.chartRow}>
              <Text style={styles.chartLabel}>
                {item.value}
              </Text>

              <View
                style={[
                  styles.chartBar,
                  {
                    width: item.value,
                    backgroundColor:
                      getBadgeColor(item.value),
                  },
                ]}
              />
            </View>

            <View style={styles.card}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      getBadgeColor(item.value),
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
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
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
    marginBottom: 10,
  },

  clearButton: {
    backgroundColor: '#dc2626',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  chartLabel: {
    width: 50,
  },

  chartBar: {
    height: 12,
    borderRadius: 5,
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