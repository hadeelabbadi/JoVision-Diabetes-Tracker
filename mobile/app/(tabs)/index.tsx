import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  ActivityIndicator,
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
  const [riskResult, setRiskResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
          onPress: () => {
            setReadings([]);
            setRiskResult(null);
          },
        },
      ]
    );
  };

  const assessRisk = async () => {
    try {
      if (readings.length === 0) {
        Alert.alert(
          'No Data',
          'Add some glucose readings first.'
        );
        return;
      }

      setLoading(true);

      const response = await fetch(
        'https://literate-disco-v6qwr949j99vfwj9v-5000.app.github.dev/assess',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            readings: readings.map((r) => r.value),
          }),
        }
      );

      const result = await response.json();

      setRiskResult(result);
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Could not connect to AI assessment server.'
      );
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.summaryText}>
          Total Readings: {totalReadings}
        </Text>

        <Text style={styles.summaryText}>
          Average Reading: {averageReading}
        </Text>

        <Text style={styles.summaryText}>
          Highest Reading: {highestReading}
        </Text>

        <Text style={styles.summaryText}>
          Lowest Reading: {lowestReading}
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

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearAllReadings}
      >
        <Text style={styles.buttonText}>
          Clear All
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.assessButton}
        onPress={assessRisk}
      >
        <Text style={styles.buttonText}>
          Assess Risk
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#7c3aed"
          style={{ marginBottom: 20 }}
        />
      )}

      {riskResult && (
        <View style={styles.riskPanel}>
          <Text style={styles.riskTitle}>
            Risk Level: {riskResult.risk}
          </Text>

          <Text>
            Average Reading: {riskResult.average}
          </Text>

          <Text style={{ marginTop: 8 }}>
            {riskResult.message}
          </Text>
        </View>
      )}

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
                    width: Math.min(item.value, 250),
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
    backgroundColor: '#eef2ff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
  },

  summaryText: {
    fontSize: 15,
    marginBottom: 4,
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
    marginBottom: 10,
  },

  assessButton: {
    backgroundColor: '#7c3aed',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  riskPanel: {
    backgroundColor: '#ede9fe',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  riskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
    borderRadius: 15,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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