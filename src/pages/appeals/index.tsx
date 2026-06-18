import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import AppealCard from '@/components/AppealCard';
import FilterTabs from '@/components/FilterTabs';
import { useAppStore } from '@/store/useAppStore';

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '待沟通', value: 'processing' },
  { label: '无需处理', value: 'rejected' },
];

const AppealsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { appeals } = useAppStore();

  useDidShow(() => {
    console.log('[AppealsPage] 页面显示，申诉数量:', appeals.length);
  });

  const filteredAppeals = useMemo(() => {
    if (statusFilter === 'all') {
      return appeals;
    }
    return appeals.filter((appeal) => appeal.status === statusFilter);
  }, [statusFilter, appeals]);

  const stats = useMemo(() => {
    const total = appeals.length;
    const pending = appeals.filter((a) => a.status === 'pending').length;
    const processing = appeals.filter((a) => a.status === 'processing').length;
    const rejected = appeals.filter((a) => a.status === 'rejected').length;
    return { total, pending, processing, rejected };
  }, [appeals]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('[AppealsPage] 下拉刷新');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleCreateAppeal = () => {
    console.log('[AppealsPage] 新建申诉');
    Taro.navigateTo({
      url: '/pages/appeal-form/index',
    });
  };

  const handleAppealClick = (appealId: string) => {
    console.log('[AppealsPage] 点击申诉:', appealId);
  };

  return (
    <ScrollView
      className={styles.pageContainer}
      scrollY
      refresherEnabled
      refresherTriggered={isRefreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.statsHeader}>
        <Text className={styles.statsTitle}>申诉统计</Text>
        <View className={styles.statsRow}>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{stats.total}</Text>
            <Text className={styles.statsLabel}>全部申诉</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue} style={{ color: '#ff7d00' }}>{stats.pending}</Text>
            <Text className={styles.statsLabel}>待审核</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue} style={{ color: '#165dff' }}>{stats.processing}</Text>
            <Text className={styles.statsLabel}>待沟通</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue} style={{ color: '#86909c' }}>{stats.rejected}</Text>
            <Text className={styles.statsLabel}>无需处理</Text>
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
        <Text>申诉列表</Text>
        <Text className={styles.sectionSubtitle}>共 {filteredAppeals.length} 条</Text>
      </View>

      <View className={styles.appealsList}>
        {filteredAppeals.length > 0 ? (
          filteredAppeals.map((appeal) => (
            <AppealCard
              key={appeal.id}
              appeal={appeal}
              onClick={() => handleAppealClick(appeal.id)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>暂无申诉记录</View>
        )}
      </View>

      <View className={styles.fabButton} onClick={handleCreateAppeal}>
        <Text className={styles.fabIcon}>+</Text>
        <Text className={styles.fabLabel}>新建申诉</Text>
      </View>
    </ScrollView>
  );
};

export default AppealsPage;
