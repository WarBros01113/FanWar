import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MessageCircle, Clock, Swords } from 'lucide-react-native';
import { War } from '@/lib/supabase';

interface WarCardProps {
  war: War;
  onPress: () => void;
}

export function WarCard({ war, onPress }: WarCardProps) {
  // Format the creation date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Swords size={20} color="#FF6B35" />
          <Text style={styles.title} numberOfLines={1}>
            {war.team1} vs {war.team2}
          </Text>
        </View>
        <View style={styles.commentBadge}>
          <MessageCircle size={14} color="#1E3A8A" />
          <Text style={styles.commentCount}>{war.total_comments}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Clock size={12} color="#94A3B8" />
          <Text style={styles.timeText}>
            Created {formatDate(war.created_at)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            war.total_comments > 0 ? styles.activeDot : styles.inactiveDot
          ]} />
          <Text style={styles.statusText}>
            {war.total_comments > 0 ? 'Active' : 'New'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
    flex: 1,
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  commentCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: '#10B981',
  },
  inactiveDot: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});