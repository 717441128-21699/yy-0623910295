import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Review, EmotionType, AppealStatus } from '@/types';
import { mockReviews, getKeywordLabel } from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';

const emotionMap: Record<EmotionType, { label: string; className: string }> = {
  positive: { label: '正面', className: styles.emotionPositive },
  neutral: { label: '中性', className: styles.emotionNeutral },
  negative: { label: '负面', className: styles.emotionNegative },
};

const statusMap: Record<AppealStatus, { label: string; className: string }> = {
  pending: { label: '待审核', className: styles.statusPending },
  processing: { label: '待沟通', className: styles.statusProcessing },
  rejected: { label: '无需处理', className: styles.statusRejected },
};

const DetailPage: React.FC = () => {
  const router = useRouter();
  const reviewId = router.params.id || 'r001';
  const { appeals, appealedReviewIds } = useAppStore();

  const review = useMemo<Review | undefined>(() => {
    const found = mockReviews.find((r) => r.id === reviewId);
    if (found) {
      return { ...found, hasAppealed: found.hasAppealed || appealedReviewIds.includes(found.id) };
    }
    return undefined;
  }, [reviewId, appealedReviewIds]);

  const appeal = useMemo(() => {
    if (!review?.hasAppealed) return null;
    return appeals.find((a) => a.reviewId === reviewId) || appeals.find((a) => a.id === review?.appealId);
  }, [review, appeals, reviewId]);

  useDidShow(() => {
    console.log('[DetailPage] 页面显示，评价ID:', reviewId, '已申诉:', review?.hasAppealed);
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          className={classnames(styles.star, i <= rating && styles.starActive)}
        >
          ★
        </Text>
      );
    }
    return stars;
  };

  const handleAppeal = () => {
    if (!review) return;
    if (review.hasAppealed) {
      Taro.showToast({
        title: '已提交申诉，请等待审核',
        icon: 'none',
      });
      return;
    }
    console.log('[DetailPage] 发起申诉:', reviewId);
    Taro.navigateTo({
      url: `/pages/appeal-form/index?reviewId=${reviewId}`,
    });
  };

  const handleContact = () => {
    console.log('[DetailPage] 联系运营');
    Taro.showModal({
      title: '联系运营',
      content: '运营管理方联系电话：400-xxx-xxxx\n工作时间：9:00-18:00',
      showCancel: false,
      confirmText: '知道了',
    });
  };

  if (!review) {
    return (
      <View className={styles.pageContainer}>
        <View style={{ padding: '100rpx', textAlign: 'center', color: '#86909C' }}>
          评价不存在
        </View>
      </View>
    );
  }

  const emotionInfo = emotionMap[review.emotion];

  return (
    <View className={styles.pageContainer}>
      <View className={styles.reviewSection}>
        <View className={styles.reviewHeader}>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{review.consumerInfo}</Text>
            <Text className={styles.userMeta}>
              {review.source} · {review.createdAt}
            </Text>
            <View className={styles.rating}>
              {renderStars(review.rating)}
            </View>
          </View>
          <View className={classnames(styles.emotionTag, emotionInfo.className)}>
            {emotionInfo.label}
          </View>
        </View>

        <Text className={styles.reviewContent}>{review.content}</Text>

        <View className={styles.tagsSection}>
          <Text className={styles.sectionLabel}>情绪标签</Text>
          <View className={styles.tags}>
            {review.emotionTags.map((tag, index) => (
              <View key={index} className={styles.emotionLabel}>
                {tag}
              </View>
            ))}
          </View>
        </View>

        {review.keywords.length > 0 && (
          <View className={styles.tagsSection}>
            <Text className={styles.sectionLabel}>问题关键词</Text>
            <View className={styles.tags}>
              {review.keywords.map((keyword, index) => (
                <View key={index} className={styles.keywordTag}>
                  {getKeywordLabel(keyword)}
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.reviewFooter}>
          <Text className={styles.source}>来源：{review.source}</Text>
          <Text className={styles.time}>{review.createdAt}</Text>
        </View>
      </View>

      {appeal && (
        <View className={styles.appealSection}>
          <Text className={styles.sectionTitle}>申诉记录</Text>
          <View className={styles.appealCard}>
            <View className={styles.appealStatus}>
              <View className={classnames(styles.statusTag, statusMap[appeal.status].className)}>
                {statusMap[appeal.status].label}
              </View>
              <Text className={styles.appealTime}>提交时间：{appeal.createdAt}</Text>
            </View>
            <Text className={styles.appealContent}>{appeal.description}</Text>
            {appeal.evidenceImages.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text className={styles.sectionLabel}>现场照片：</Text>
                <View className={styles.appealEvidence}>
                  {appeal.evidenceImages.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      className={styles.evidenceImage}
                      mode="aspectFill"
                    />
                  ))}
                </View>
              </View>
            )}
            {appeal.receiptImage && (
              <View style={{ marginTop: 16 }}>
                <Text className={styles.sectionLabel}>消费小票：</Text>
                <View className={styles.appealEvidence}>
                  <Image
                    src={appeal.receiptImage}
                    className={styles.evidenceImage}
                    mode="aspectFill"
                  />
                </View>
              </View>
            )}
            {appeal.processor && (
              <View className={styles.processInfo}>
                <View className={styles.processMeta}>
                  <Text className={styles.processLabel}>处理人：{appeal.processor}</Text>
                  {appeal.processedAt && (
                    <Text className={styles.processLabel}>处理时间：{appeal.processedAt}</Text>
                  )}
                </View>
                {appeal.processorComment && (
                  <Text className={styles.processComment}>{appeal.processorComment}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={styles.btnSecondary} onClick={handleContact}>
          <Text className={styles.btnSecondaryText}>联系运营</Text>
        </View>
        <View
          className={classnames(styles.btnPrimary, review.hasAppealed && styles.btnPrimaryDisabled)}
          onClick={handleAppeal}
        >
          <Text className={styles.btnPrimaryText}>
            {review.hasAppealed ? '已申诉' : '发起申诉'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
