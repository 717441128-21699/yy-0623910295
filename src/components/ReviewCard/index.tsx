import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Review, EmotionType } from '@/types';
import { getKeywordLabel } from '@/data/mock';

interface ReviewCardProps {
  review: Review;
  onClick?: () => void;
}

const emotionMap: Record<EmotionType, { label: string; className: string }> = {
  positive: { label: '正面', className: styles.emotionPositive },
  neutral: { label: '中性', className: styles.emotionNeutral },
  negative: { label: '负面', className: styles.emotionNegative },
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onClick }) => {
  const emotionInfo = emotionMap[review.emotion];

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

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Text className={styles.userName}>{review.consumerInfo}</Text>
          <View className={styles.rating}>
            {renderStars(review.rating)}
          </View>
        </View>
        <View className={classnames(styles.emotionTag, emotionInfo.className)}>
          {emotionInfo.label}
        </View>
      </View>

      <Text className={styles.content}>{review.content}</Text>

      <View className={styles.tags}>
        {review.emotionTags.map((tag, index) => (
          <View key={index} className={styles.emotionLabel}>
            {tag}
          </View>
        ))}
        {review.keywords.map((keyword, index) => (
          <View key={index} className={styles.keywordTag}>
            {getKeywordLabel(keyword)}
          </View>
        ))}
      </View>

      <View className={styles.footer}>
        <Text className={styles.source}>来源：{review.source}</Text>
        <Text className={styles.time}>{review.createdAt}</Text>
      </View>

      {review.hasAppealed && (
        <View className={styles.appealedBadge}>已申诉</View>
      )}
    </View>
  );
};

export default ReviewCard;
