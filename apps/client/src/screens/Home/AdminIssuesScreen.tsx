import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { memo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Screen from '@/components/Screen';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import {
  getGetIssuesQueryKey,
  type Issue,
  useDeleteIssue,
  useGetIssues,
  useResolveIssue,
} from '@/services';

type FilterMode = 'open' | 'resolved' | 'all';

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature Request',
  other: 'Other',
};

const IssueItem = memo(({ item }: { item: Issue }) => {
  const queryClient = useQueryClient();
  const resolveMutation = useResolveIssue();
  const deleteMutation = useDeleteIssue();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetIssuesQueryKey() });

  const handleResolve = () => {
    resolveMutation.mutate({ id: item._id }, { onSuccess: invalidate });
  };

  const handleDelete = () => {
    Alert.alert('Delete Issue', 'Permanently delete this issue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate({ id: item._id }, { onSuccess: invalidate }),
      },
    ]);
  };

  const formattedDate = new Date(item.createdOn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.issueItem}>
      <View style={styles.issueHeader}>
        <View style={styles.issueMeta}>
          <Text style={styles.issueTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.userInfo}>{item.userName || 'Unknown'} · {item.userEmail}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.typeBadge]}>
            <Text style={styles.typeBadgeText}>{TYPE_LABELS[item.type] ?? item.type}</Text>
          </View>
          {item.status === 'resolved' && (
            <View style={styles.resolvedBadge}>
              <MaterialCommunityIcons name="check-circle" size={12} color={colors.green} />
              <Text style={styles.resolvedBadgeText}>Resolved</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.issueDescription}>{item.description}</Text>

      <View style={styles.actions}>
        {item.status === 'open' && (
          <TouchableOpacity
            style={styles.resolveBtn}
            onPress={handleResolve}
            disabled={resolveMutation.isPending}
          >
            <MaterialCommunityIcons name="check" size={14} color={colors.green} />
            <Text style={styles.resolveText}>Resolve</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={14} color={colors.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function AdminIssuesScreen() {
  const [filterMode, setFilterMode] = useState<FilterMode>('open');
  const [page, setPage] = useState(1);

  const filters = {
    ...(filterMode !== 'all' && { status: filterMode }),
    page,
  };

  const { data, isLoading, isFetching } = useGetIssues(filters);

  const issues = data?.issues ?? [];
  const hasMore = data?.hasMore ?? false;
  const total = data?.total ?? 0;

  const handleFilterChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setPage(1);
  };

  return (
    <Screen isLoading={isLoading && page === 1} style={styles.screen}>
      <View style={styles.filterRow}>
        {(['open', 'resolved', 'all'] as Array<FilterMode>).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.chip, filterMode === mode && styles.chipActive]}
            onPress={() => handleFilterChange(mode)}
          >
            <Text style={[styles.chipText, filterMode === mode && styles.chipTextActive]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.totalText}>
        {isFetching && page === 1 ? 'Loading...' : `${total} issue${total !== 1 ? 's' : ''}`}
      </Text>

      <FlatList
        data={issues}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <IssueItem item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No issues found.</Text> : null
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => setPage((p) => p + 1)}
              disabled={isFetching}
            >
              <Text style={styles.loadMoreText}>{isFetching ? 'Loading...' : 'Load more'}</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  chipActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeBg,
  },
  chipText: {
    color: colors.medium,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  chipTextActive: {
    color: colors.orange,
  },
  totalText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xxl * 2,
  },
  issueItem: {
    backgroundColor: colors.black,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  issueMeta: {
    flex: 1,
    marginRight: spacing.sm,
  },
  issueTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  userInfo: {
    color: colors.lightBlue,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  dateText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  typeBadge: {
    backgroundColor: colors.surfaceFaint,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: colors.light,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#1a3a1a',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resolvedBadgeText: {
    color: colors.green,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
  },
  issueDescription: {
    color: colors.light,
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.green,
  },
  resolveText: {
    color: colors.green,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteText: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.medium,
    marginTop: spacing.sm,
  },
  loadMoreText: {
    color: colors.light,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  emptyText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.base,
    textAlign: 'center',
    paddingTop: 40,
  },
});
