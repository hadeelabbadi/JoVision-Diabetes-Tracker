import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
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
  if (value > 250) return '#dc2626';
  if (value > 180) return '#f97316';
  if (value < 70) return '#facc15';
  return '#22c55e';
};

const getStatusLabel = (value: number) => {
  if (value > 250)
    return 'Severe Hyperglycemia';

  if (value > 180)
    return 'Elevated Glucose';

  if (value < 70)
    return 'Hypoglycemia';

  return 'Target Range';
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
      const timeInRange =
  readings.length > 0
    ? (
        (readings.filter(
          (r) => r.value >= 70 && r.value <= 180
        ).length /
          readings.length) *
        100
      ).toFixed(0)
    : '0';

  return (
  <ScrollView
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 40 }}
>
  <Text style={styles.title}>
    Diabetes Tracker
  </Text>

  {/* DASHBOARD */}

  <View style={styles.dashboardGrid}>
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>Average</Text>
      <Text style={styles.statValue}>
        {averageReading}
      </Text>
    </View>

    <View style={styles.statCard}>
      <Text style={styles.statLabel}>Latest</Text>
      <Text style={styles.statValue}>
        {latestReading}
      </Text>
    </View>

    <View style={styles.statCard}>
      <Text style={styles.statLabel}>Highest</Text>
      <Text style={styles.statValue}>
        {highestReading}
      </Text>
    </View>

    <View style={styles.statCard}>
      <Text style={styles.statLabel}>TIR</Text>
      <Text style={styles.statValue}>
        {timeInRange}%
      </Text>
    </View>
  </View>

  <Text style={styles.tirStatus}>
    {Number(timeInRange) >= 70
      ? 'Excellent Control'
      : Number(timeInRange) >= 50
      ? 'Moderate Control'
      : 'Needs Improvement'}
  </Text>

  {/* INPUT */}

  <TextInput
    style={styles.input}
    placeholder="Enter glucose reading"
    keyboardType="numeric"
    value={reading}
    onChangeText={setReading}
  />

  {/* BUTTON ROW */}

  <View style={styles.buttonRow}>
    <TouchableOpacity
      style={styles.smallButton}
      onPress={handleSubmit}
    >
      <Text style={styles.buttonText}>
        Add
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.smallAssessButton}
      onPress={assessRisk}
    >
      <Text style={styles.buttonText}>
        Assess
      </Text>
    </TouchableOpacity>
  </View>

  <TouchableOpacity
    style={styles.clearButton}
    onPress={clearAllReadings}
  >
    <Text style={styles.buttonText}>
      Clear All
    </Text>
  </TouchableOpacity>

  {loading && (
    <ActivityIndicator
      size="large"
      color="#7c3aed"
      style={{ marginBottom: 20 }}
    />
  )}

  {/* CHART */}

  <Text style={styles.chartTitle}>
    Reading Chart
  </Text>

  {readings.map((item) => (
    <View key={item.id}>
      <View style={styles.chartRow}>
        <Text style={styles.chartLabel}>
          {item.value}
        </Text>

        <View
          style={[
            styles.chartBar,
            {
              width: Math.min(item.value, 250),
              backgroundColor: getBadgeColor(
                item.value
              ),
            },
          ]}
        />
      </View>
    </View>
  ))}

  {/* RISK PANEL */}

  {riskResult && (
    <View style={styles.riskPanel}>
      <Text style={styles.riskTitle}>
        Risk Assessment
      </Text>

      <Text>
        Risk Level: {riskResult.risk}
      </Text>

      <Text>
        Average: {riskResult.average}
      </Text>

      <Text>
        Time In Range: {timeInRange}%
      </Text>

      <Text style={{ marginTop: 8 }}>
        {riskResult.message}
      </Text>
      <Text
        style={{
          marginTop: 10,
          fontWeight: '600',
          color: '#2563eb',
        }}
      >
        Recommendation:
      </Text>

      <Text style={{ marginTop: 4 }}>
        {riskResult.recommendation}
      </Text>

    </View>
  )}

  {/* READINGS */}

  <Text style={styles.chartTitle}>
    Recent Readings
  </Text>

  {readings.map((item) => (
    <View key={`card-${item.id}`}>
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

        <Text style={styles.statusText}>
          {getStatusLabel(item.value)}
        </Text>

        <Text style={styles.timestamp}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  ))}

  <Text style={styles.disclaimer}>
    This app does not provide medical advice.
    Consult a healthcare provider before making
    treatment decisions.
  </Text>
</ScrollView>
);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },

  tirStatus: {
    marginTop: 6,
    fontWeight: 'bold',
    color: '#2563eb',
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

  dashboardGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: 10,
},

statCard: {
  width: '48%',
  backgroundColor: '#eef2ff',
  borderRadius: 15,
  padding: 16,
  marginBottom: 10,
},

statLabel: {
  fontSize: 13,
  color: '#6b7280',
},

statValue: {
  fontSize: 22,
  fontWeight: 'bold',
  marginTop: 5,
},

buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 10,
},

smallButton: {
  flex: 1,
  backgroundColor: '#2563eb',
  padding: 15,
  borderRadius: 10,
  marginRight: 5,
},

smallAssessButton: {
  flex: 1,
  backgroundColor: '#7c3aed',
  padding: 15,
  borderRadius: 10,
  marginLeft: 5,
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
  statusText: {
  marginTop: 4,
  fontSize: 13,
  color: '#6b7280',
},

disclaimer: {
  textAlign: 'center',
  fontSize: 11,
  color: '#6b7280',
  marginTop: 10,
  marginBottom: 10,
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