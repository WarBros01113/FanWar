import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react-native';
import { Comment } from '@/lib/supabase';

interface CommentCardProps {
  comment: Comment;
  onVoteUpdate: (commentId: string, newVotes: number) => void;
}

export function CommentCard({ comment, onVoteUpdate }: CommentCardProps) {
  // Format the creation date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleUpvote = () => {
    onVoteUpdate(comment.id, comment.votes + 1);
  };

  const handleDownvote = () => {
    onVoteUpdate(comment.id, comment.votes - 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.votingContainer}>
        <TouchableOpacity style={styles.voteButton} onPress={handleUpvote}>
          <ChevronUp size={20} color="#10B981" />
        </TouchableOpacity>
        
        <Text style={[
          styles.voteCount,
          comment.votes > 0 && styles.positiveVotes,
          comment.votes < 0 && styles.negativeVotes,
        ]}>
          {comment.votes}
        </Text>
        
        <TouchableOpacity style={styles.voteButton} onPress={handleDownvote}>
          <ChevronDown size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.content}>{comment.content}</Text>
        
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#94A3B8" />
            <Text style={styles.timeText}>
              {formatDate(comment.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  votingContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  voteButton: {
    padding: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginVertical: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  positiveVotes: {
    color: '#10B981',
  },
  negativeVotes: {
    color: '#EF4444',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 12,
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
});