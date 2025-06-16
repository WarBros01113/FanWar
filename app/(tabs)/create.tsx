import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Swords, Users } from 'lucide-react-native';
import { warsApi } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CreateWarScreen() {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [loading, setLoading] = useState(false);

  // Predefined popular rivalries for quick selection
  const popularRivalries = [
    { team1: 'CSK', team2: 'RCB' },
    { team1: 'MI', team2: 'CSK' },
    { team1: 'Virat', team2: 'Rohit' },
    { team1: 'RCB', team2: 'KKR' },
    { team1: 'Dhoni', team2: 'Kohli' },
    { team1: 'Punjab', team2: 'Rajasthan' },
  ];

  // Handle war creation
  const handleCreateWar = async () => {
    if (!team1.trim() || !team2.trim()) {
      Alert.alert('Error', 'Please enter both team/player names');
      return;
    }

    if (team1.trim().toLowerCase() === team2.trim().toLowerCase()) {
      Alert.alert('Error', 'Teams/players must be different');
      return;
    }

    setLoading(true);

    try {
      const newWar = await warsApi.createWar(team1, team2);
      Alert.alert(
        'Success!',
        `War created: ${newWar.team1} vs ${newWar.team2}`,
        [
          {
            text: 'View War',
            onPress: () => router.push(`/war/${newWar.id}`),
          },
          {
            text: 'Create Another',
            onPress: () => {
              setTeam1('');
              setTeam2('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating war:', error);
      Alert.alert('Error', 'Failed to create war. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick rivalry selection
  const handleQuickSelect = (rivalry: { team1: string; team2: string }) => {
    setTeam1(rivalry.team1);
    setTeam2(rivalry.team2);
  };

  // Swap team positions
  const swapTeams = () => {
    const temp = team1;
    setTeam1(team2);
    setTeam2(temp);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Swords size={40} color="#FF6B35" />
            <Text style={styles.title}>Create New War</Text>
            <Text style={styles.subtitle}>
              Start a rivalry between teams or players
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Team/Player</Text>
              <TextInput
                style={styles.input}
                value={team1}
                onChangeText={setTeam1}
                placeholder="e.g., CSK, Virat Kohli"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.vsContainer}>
              <TouchableOpacity style={styles.swapButton} onPress={swapTeams}>
                <Text style={styles.vsText}>VS</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Second Team/Player</Text>
              <TextInput
                style={styles.input}
                value={team2}
                onChangeText={setTeam2}
                placeholder="e.g., RCB, Rohit Sharma"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleCreateWar}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                (!team1.trim() || !team2.trim()) && styles.createButtonDisabled,
              ]}
              onPress={handleCreateWar}
              disabled={!team1.trim() || !team2.trim()}
            >
              <Text style={styles.createButtonText}>Create War</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickSelectContainer}>
            <Text style={styles.quickSelectTitle}>Popular Rivalries</Text>
            <View style={styles.rivalryGrid}>
              {popularRivalries.map((rivalry, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.rivalryButton}
                  onPress={() => handleQuickSelect(rivalry)}
                >
                  <Users size={16} color="#1E3A8A" />
                  <Text style={styles.rivalryText}>
                    {rivalry.team1} vs {rivalry.team2}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  swapButton: {
    backgroundColor: '#FF6B35',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickSelectContainer: {
    marginTop: 20,
  },
  quickSelectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  rivalryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rivalryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '45%',
  },
  rivalryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginLeft: 8,
  },
});