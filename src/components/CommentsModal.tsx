import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Send } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { SocialPost, SocialComment } from '../store/useSocialStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  post: SocialPost;
  onComment: (text: string) => void;
}

const timeAgo = (isoString: string) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export default function CommentsModal({ visible, onClose, post, onComment }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onComment(text);
      setText('');
    }
  };

  const renderComment = ({ item }: { item: SocialComment }) => (
    <View style={styles.commentRow}>
      <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
      <View style={[styles.commentBubble, { backgroundColor: theme.colors.surfaceHighlight }]}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentName, { color: theme.colors.textPrimary }]}>{item.userName}</Text>
          <Text style={[styles.commentTime, { color: theme.colors.textMuted }]}>{timeAgo(item.timestamp)}</Text>
        </View>
        <Text style={[styles.commentText, { color: theme.colors.textPrimary }]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.colors.background, paddingBottom: insets.bottom || 20 }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Comentários</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={post.comments}
            keyExtractor={c => c.id}
            renderItem={renderComment}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                Ainda não há comentários. Seja o primeiro!
              </Text>
            }
          />

          <View style={[styles.inputRow, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary, backgroundColor: theme.colors.surfaceHighlight }]}
              placeholder="Adicionar comentário..."
              placeholderTextColor={theme.colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendBtn, 
                { backgroundColor: text.trim() ? theme.colors.primary : theme.colors.surfaceHighlight }
              ]} 
              onPress={handleSend}
              disabled={!text.trim()}
            >
              <Send size={20} color={text.trim() ? '#000' : theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  commentBubble: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  commentText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Inter-Medium',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
