import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import RectificationCard from '@/components/RectificationCard';
import FilterTabs from '@/components/FilterTabs';
import { useAppStore } from '@/store/useAppStore';

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
];

const RectificationsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { rectifications, updateRectificationStatus } = useAppStore();

  useDidShow(() => {
    console.log('[RectificationsPage] 页面显示，整改数量:', rectifications.length);
  });

  const filteredRectifications = useMemo(() => {
    let result = rectifications;
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result.sort((a, b) => {
      const priority = { pending: 0, confirmed: 1, completed: 2 };
      return priority[a.status] - priority[b.status];
    });
  }, [statusFilter, rectifications]);

  const stats = useMemo(() => {
    const total = rectifications.length;
    const pending = rectifications.filter((r) => r.status === 'pending').length;
    const confirmed = rectifications.filter((r) => r.status === 'confirmed').length;
    const completed = rectifications.filter((r) => r.status === 'completed').length;
    return { total, pending, confirmed, completed };
  }, [rectifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('[RectificationsPage] 下拉刷新');
    setTimeout(() => {
      setIsRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  const handlePullDownRefresh = () => {
    handleRefresh();
  };

  React.useEffect(() => {
    Taro.onPullDownRefresh(handlePullDownRefresh);
    return () => {
      Taro.offPullDownRefresh(handlePullDownRefresh);
    };
  }, []);

  const handleConfirm = (id: string) => {
    console.log('[RectificationsPage] 确认整改:', id);
    updateRectificationStatus(id, 'confirmed');
    Taro.showToast({
      title: '已确认整改',
      icon: 'success',
      duration: 2000,
    });
  };

  return (
    <ScrollView
      className={styles.pageContainer}
      scrollY
      refresherEnabled
      refresherTriggered={isRefreshing}
      onRefresherRefresh={handleRefresh}
    >
      {stats.pending > 0 && (
        <View className={styles.alertBanner}>
          <View className={styles.alertIcon}>!</View>
          <View className={styles.alertContent}>
            <Text className={styles.alertTitle}>您有 {stats.pending} 项整改待确认</Text>
            <Text className={styles.alertDesc}>请及时处理，避免影响正常经营</Text>
          </View>
        </View>
      )}

      <View className={styles.statsHeader}>
        <Text className={styles.statsTitle}>整改统计</Text>
        <View className={styles.statsRow}>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{stats.total}</Text>
            <Text className={styles.statsLabel}>全部整改</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue} style={{ color: '#ff7d00' }}>{stats.pending}</Text>
            <Text className={styles.statsLabel}>待确认</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue} style={{ color: '#165dff' }}>{stats.confirmed}</Text>
            <Text className={styles.statsLabel}>已确认</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue} style={{ color: '#00b42a' }}>{stats.completed}</Text>
            <Text className={styles.statsLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <FilterTabs
          options={statusOptions}
          activeValue={statusFilter}
          onChange={setStatusFilter}
        />
      </View>

      <View className={styles.sectionTitle}>
        <Text>整改清单</Text>
        <Text className={styles.sectionSubtitle}>共 {filteredRectifications.length} 条</Text>
      </View>

      <View className={styles.rectificationsList}>
        {filteredRectifications.length > 0 ? (
          filteredRectifications.map((rectification) => (
            <RectificationCard
              key={rectification.id}
              rectification={rectification}
              onConfirm={handleConfirm}
            />
          ))
        ) : (
          <View className={styles.emptyState}>暂无整改提醒</View>
        )}
      </View>
    </ScrollView>
  );
};

export default RectificationsPage;
