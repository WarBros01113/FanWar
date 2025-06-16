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
import { TrendingUp, Siren as Fire } from 'lucide-react-native';
import { WarCard } from '@/components/WarCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { warsApi, War } from '@/lib/supabase';

export default function TrendingScreen() {
  const [wars, setWars] = useState<War[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  // Load trending wars (sorted by comment count)
  const loadTrendingWars = async () => {
    try {
      const data = await warsApi.getWars();
      // Filter wars with comments and sort by activity
      const trendingWars = data.filter(war => war.total_comments > 0);
      if (mounted.current) {
        setWars(trendingWars);
      }
    } catch (error) {
      console.error('Error loading trending wars:', error);
      if (mounted.current) {
        Alert.alert('Error', 'Failed to load trending wars. Please try again.');
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
    loadTrendingWars();

    return () => {
      mounted.current = false;
    };
  }, []);

  // Handle refresh
  const onRefresh = () => {
    if (mounted.current) {
      setRefreshing(true);
      loadTrendingWars();
    }
  };

  // Handle war card press
  const handleWarPress = (war: War) => {
    router.push(`/war/${war.id}`);
  };

  // Render individual war card with trending indicator
  const renderWar = ({ item, index }: { item: War; index: number }) => (
    <View style={styles.warWrapper}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{index + 1}</Text>
        {index < 3 && <Fire size={16} color="#FF6B35" />}
      </View>
      <View style={styles.warCardContainer}>
        <WarCard war={item} onPress={() => handleWarPress(item)} />
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TrendingUp size={32} color="#FF6B35" />
          <Text style={styles.title}>Trending Wars</Text>
        </View>
        <Text style={styles.subtitle}>
          Hottest battles with the most fan engagement
        </Text>
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
            <Fire size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No trending wars yet</Text>
            <Text style={styles.emptySubtext}>
              Wars will appear here once fans start commenting!
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  warWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  warCardContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});