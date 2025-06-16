import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react-native';
import { CommentCard } from '@/components/CommentCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { warsApi, commentsApi, War, Comment } from '@/lib/supabase';

export default function WarRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [war, setWar] = useState<War | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const mounted = useRef(true);

  // Load war and comments
  const loadWarData = async () => {
    if (!id) return;

    try {
      const [warData, commentsData] = await Promise.all([
        warsApi.getWar(id),
        commentsApi.getComments(id),
      ]);

      if (mounted.current) {
        setWar(warData);
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error loading war data:', error);
      if (mounted.current) {
        Alert.alert('Error', 'Failed to load war data. Please try again.');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    mounted.current = true;
    loadWarData();

    return () => {
      mounted.current = false;
    };
  }, [id]);

  // Handle posting new comment
  const handlePostComment = async () => {
    if (!newComment.trim() || !id) return;

    if (mounted.current) {
      setPosting(true);
    }

    try {
      const comment = await commentsApi.createComment(id, newComment);
      if (mounted.current) {
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        
        // Update war comment count
        if (war) {
          setWar({ ...war, total_comments: war.total_comments + 1 });
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      if (mounted.current) {
        Alert.alert('Error', 'Failed to post comment. Please try again.');
      }
    } finally {
      if (mounted.current) {
        setPosting(false);
      }
    }
  };

  // Handle vote update
  const handleVoteUpdate = async (commentId: string, newVotes: number) => {
    try {
      await commentsApi.updateVotes(commentId, newVotes);
      if (mounted.current) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId ? { ...comment, votes: newVotes } : comment
          )
        );
      }
    } catch (error) {
      console.error('Error updating votes:', error);
      if (mounted.current) {
        Alert.alert('Error', 'Failed to update vote. Please try again.');
      }
    }
  };

  // Render comment item
  const renderComment = ({ item }: { item: Comment }) => (
    <CommentCard comment={item} onVoteUpdate={handleVoteUpdate} />
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!war) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>War not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {war.team1} vs {war.team2}
            </Text>
            <Text style={styles.headerSubtitle}>
              {war.total_comments} {war.total_comments === 1 ? 'comment' : 'comments'}
            </Text>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageCircle size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to share your thoughts!
              </Text>
            </View>
          }
        />

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Share your thoughts..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newComment.trim() || posting) && styles.sendButtonDisabled,
            ]}
            onPress={handlePostComment}
            disabled={!newComment.trim() || posting}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  listContainer: {
    padding: 16,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#1E293B',
  },
  sendButton: {
    backgroundColor: '#FF6B35',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
});