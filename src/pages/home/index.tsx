import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import ReviewCard from '@/components/ReviewCard';
import FilterTabs from '@/components/FilterTabs';
import type { IssueKeyword } from '@/types';
import {
  mockStoreOverview,
  mockReviews,
  sourceOptions,
  emotionOptions,
  keywordOptions,
  getKeywordLabel,
  getCategoryLabel,
} from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';

type FilterType = 'source' | 'emotion' | 'keyword';

const HomePage: React.FC = () => {
  const [sourceFilter, setSourceFilter] = useState('all');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [keywordFilter, setKeywordFilter] = useState('all');
  const [activeFilterType, setActiveFilterType] = useState<FilterType>('source');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { appeals, rectifications, appealedReviewIds } = useAppStore();

  const pendingAppealsCount = useMemo(() => {
    return appeals.filter((a) => a.status === 'pending').length;
  }, [appeals]);

  const pendingRectificationsCount = useMemo(() => {
    return rectifications.filter((r) => r.status === 'pending').length;
  }, [rectifications]);

  useDidShow(() => {
    console.log('[HomePage] 页面显示');
  });

  const filteredReviews = useMemo(() => {
    return mockReviews.filter((review) => {
      if (sourceFilter !== 'all' && review.source !== sourceFilter) {
        return false;
      }
      if (emotionFilter !== 'all' && review.emotion !== emotionFilter) {
        return false;
      }
      if (keywordFilter !== 'all' && !review.keywords.includes(keywordFilter as IssueKeyword)) {
        return false;
      }
      return true;
    });
  }, [sourceFilter, emotionFilter, keywordFilter]);

  const handleReviewClick = (reviewId: string) => {
    console.log('[HomePage] 点击评价:', reviewId);
    Taro.navigateTo({
      url: `/pages/detail/index?id=${reviewId}`,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('[HomePage] 下拉刷新');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const { totalReviews, positiveCount, neutralCount, negativeCount } = mockStoreOverview;
  const positivePercent = Math.round((positiveCount / totalReviews) * 100);
  const neutralPercent = Math.round((neutralCount / totalReviews) * 100);
  const negativePercent = 100 - positivePercent - neutralPercent;

  const currentOptions =
    activeFilterType === 'source'
      ? sourceOptions
      : activeFilterType === 'emotion'
      ? emotionOptions
      : keywordOptions;

  const currentValue =
    activeFilterType === 'source'
      ? sourceFilter
      : activeFilterType === 'emotion'
      ? emotionFilter
      : keywordFilter;

  const handleFilterChange = (value: string) => {
    if (activeFilterType === 'source') {
      setSourceFilter(value);
    } else if (activeFilterType === 'emotion') {
      setEmotionFilter(value);
    } else {
      setKeywordFilter(value);
    }
  };

  const handleKeywordClick = (keyword: IssueKeyword) => {
    setKeywordFilter(keyword);
    setActiveFilterType('keyword');
  };

  return (
    <ScrollView
      className={styles.pageContainer}
      scrollY
      refresherEnabled
      refresherTriggered={isRefreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.overviewCard}>
        <View className={styles.storeHeader}>
          <View className={styles.storeInfo}>
            <Text className={styles.storeName}>{mockStoreOverview.storeName}</Text>
            <Text className={styles.storeCategory}>
              {getCategoryLabel(mockStoreOverview.storeCategory)}
            </Text>
          </View>
          <View className={styles.ratingSection}>
            <Text className={styles.ratingValue}>{mockStoreOverview.averageRating.toFixed(1)}</Text>
            <Text className={styles.ratingLabel}>综合评分</Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalReviews}</Text>
            <Text className={styles.statLabel}>总评价</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#00b42a' }}>{positiveCount}</Text>
            <Text className={styles.statLabel}>正面</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#ff7d00' }}>{neutralCount}</Text>
            <Text className={styles.statLabel}>中性</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#f53f3f' }}>{negativeCount}</Text>
            <Text className={styles.statLabel}>负面</Text>
          </View>
        </View>

        <View className={styles.emotionBar}>
          <View
            className={styles.emotionSegment}
            style={{ width: `${positivePercent}%`, background: '#00b42a' }}
          />
          <View
            className={styles.emotionSegment}
            style={{ width: `${neutralPercent}%`, background: '#ff7d00' }}
          />
          <View
            className={styles.emotionSegment}
            style={{ width: `${negativePercent}%`, background: '#f53f3f' }}
          />
        </View>

        <View className={styles.emotionLegend}>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendPositive}`} />
            <Text>正面 {positivePercent}%</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendNeutral}`} />
            <Text>中性 {neutralPercent}%</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendNegative}`} />
            <Text>负面 {negativePercent}%</Text>
          </View>
        </View>

        <View className={styles.alertsSection}>
          <View className={styles.alertItem}>
            <View className={styles.alertIcon}>!</View>
            <View className={styles.alertContent}>
              <Text className={styles.alertCount}>{pendingAppealsCount}</Text>
              <Text className={styles.alertLabel}>待处理申诉</Text>
            </View>
          </View>
          <View className={styles.alertItem}>
            <View className={styles.alertIcon} style={{ background: '#f53f3f' }}>!</View>
            <View className={styles.alertContent}>
              <Text className={styles.alertCount}>{pendingRectificationsCount}</Text>
              <Text className={styles.alertLabel}>待整改提醒</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterTitle}>筛选维度</View>
        <FilterTabs
          options={[
            { label: '差评来源', value: 'source' },
            { label: '情绪类型', value: 'emotion' },
            { label: '问题关键词', value: 'keyword' },
          ]}
          activeValue={activeFilterType}
          onChange={(value) => setActiveFilterType(value as FilterType)}
        />
        <FilterTabs
          options={currentOptions}
          activeValue={currentValue}
          onChange={handleFilterChange}
        />
      </View>

      <View className={styles.sectionTitle}>
        <Text>高频问题关键词</Text>
        <Text className={styles.sectionSubtitle}>点击可快速筛选</Text>
      </View>

      <View className={styles.keywordsSection}>
        <View className={styles.keywordList}>
          {mockStoreOverview.topKeywords.map((item) => (
            <View
              key={item.keyword}
              className={styles.keywordItem}
              onClick={() => handleKeywordClick(item.keyword)}
            >
              <Text className={styles.keywordLabel}>{getKeywordLabel(item.keyword)}</Text>
              <Text className={styles.keywordCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>评价列表</Text>
        <Text className={styles.sectionSubtitle}>共 {filteredReviews.length} 条</Text>
      </View>

      <View className={styles.reviewsList}>
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => {
            const hasAppealed = review.hasAppealed || appealedReviewIds.includes(review.id);
            return (
              <ReviewCard
                key={review.id}
                review={{ ...review, hasAppealed }}
                onClick={() => handleReviewClick(review.id)}
              />
            );
          })
        ) : (
          <View className={styles.emptyState}>暂无符合条件的评价</View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomePage;
