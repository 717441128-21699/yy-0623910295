import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import AppealCard from '@/components/AppealCard';
import FilterTabs from '@/components/FilterTabs';
import { mockAppeals } from '@/data/mock';

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已解决', value: 'resolved' },
  { label: '已驳回', value: 'rejected' },
];

const AppealsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useDidShow(() => {
    console.log('[AppealsPage] 页面显示');
  });

  const filteredAppeals = useMemo(() => {
    if (statusFilter === 'all') {
      return mockAppeals;
    }
    return mockAppeals.filter((appeal) => appeal.status === statusFilter);
  }, [statusFilter]);

  const stats = useMemo(() => {
    const total = mockAppeals.length;
    const pending = mockAppeals.filter((a) => a.status === 'pending').length;
    const processing = mockAppeals.filter((a) => a.status === 'processing').length;
    const resolved = mockAppeals.filter((a) => a.status === 'resolved').length;
    return { total, pending, processing, resolved };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('[AppealsPage] 下拉刷新');
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
            <Text className={styles.statsLabel}>处理中</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue} style={{ color: '#00b42a' }}>{stats.resolved}</Text>
            <Text className={styles.statsLabel}>已解决</Text>
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
