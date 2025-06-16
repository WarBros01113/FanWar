import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { WarCard } from '@/components/WarCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { warsApi, War } from '@/lib/supabase';

export default function HomeScreen() {
  const [wars, setWars] = useState<War[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  // Load wars from Supabase
  const loadWars = async () => {
    try {
      const data = await warsApi.getWars();
      if (mounted.current) {
        setWars(data);
      }
    } catch (error) {
      console.error('Error loading wars:', error);
      if (mounted.current) {
        Alert.alert('Error', 'Failed to load wars. Please try again.');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    mounted.current = true;
    loadWars();

    return () => {
      mounted.current = false;
    };
  }, []);

  // Handle refresh
  const onRefresh = () => {
    if (mounted.current) {
      setRefreshing(true);
      loadWars();
    }
  };

  // Handle war card press
  const handleWarPress = (war: War) => {
    router.push(`/war/${war.id}`);
  };

  // Render individual war card
  const renderWar = ({ item }: { item: War }) => (
    <WarCard war={item} onPress={() => handleWarPress(item)} />
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fan Wars</Text>
        <Text style={styles.subtitle}>Choose your battle!</Text>
      </View>

      <FlatList
        data={wars}
        renderItem={renderWar}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No wars found</Text>
            <Text style={styles.emptySubtext}>
              Pull to refresh or create a new war!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1E3A8A',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});