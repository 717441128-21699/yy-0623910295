import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Rectification, RectificationStatus } from '@/types';
import { getCategoryLabel } from '@/data/mock';

interface RectificationCardProps {
  rectification: Rectification;
  onConfirm?: (id: string) => void;
}

const statusMap: Record<RectificationStatus, { label: string; className: string }> = {
  pending: { label: '待确认', className: styles.statusPending },
  confirmed: { label: '已确认', className: styles.statusConfirmed },
  completed: { label: '已完成', className: styles.statusCompleted },
};

const RectificationCard: React.FC<RectificationCardProps> = ({ rectification, onConfirm }) => {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = statusMap[rectification.status];

  const isUrgent = rectification.status === 'pending';

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleConfirm = (e) => {
    e.stopPropagation();
    Taro.showModal({
      title: '确认整改',
      content: `您确认已知晓"${rectification.title}"的整改要求吗？`,
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          console.log('[RectificationCard] 确认整改:', rectification.id);
          onConfirm?.(rectification.id);
        }
      },
    });
  };

  return (
    <View className={classnames(styles.card, isUrgent && styles.cardUrgent)}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <View className={classnames(styles.statusTag, statusInfo.className)}>
            {statusInfo.label}
          </View>
          {isUrgent && (
            <View className={styles.urgentTag}>紧急</View>
          )}
          <View className={styles.categoryTag}>
            {getCategoryLabel(rectification.category)}
          </View>
        </View>
        <View className={styles.expandBtn} onClick={toggleExpand}>
          <Text className={styles.expandText}>{expanded ? '收起' : '展开'}</Text>
          <Text className={classnames(styles.expandIcon, expanded && styles.expandIconRotated)}>
            ▼
          </Text>
        </View>
      </View>

      <Text className={styles.title}>{rectification.title}</Text>
      <Text className={styles.description}>{rectification.description}</Text>

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>涉及评价</Text>
          <Text className={styles.metaValue}>{rectification.issueCount} 条</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>发布时间</Text>
          <Text className={styles.metaValue}>{rectification.createdAt}</Text>
        </View>
      </View>

      <View className={styles.deadlineRow}>
        <Text className={styles.deadlineLabel}>截止时间</Text>
        <Text className={classnames(styles.deadlineValue, isUrgent && styles.deadlineUrgent)}>
          {rectification.deadline}
        </Text>
      </View>

      {expanded && (
        <View className={styles.detailSection}>
          <View className={styles.divider} />
          <Text className={styles.detailTitle}>整改说明</Text>
          <Text className={styles.detailText}>
            请您在截止时间前完成相关整改工作。运营方会在整改期限后进行复查，如未完成整改，将按照景区管理规定进行处理。如有疑问，请联系运营管理方。
          </Text>
          {rectification.confirmedAt && (
            <View className={styles.confirmInfo}>
              <Text className={styles.confirmLabel}>确认时间：{rectification.confirmedAt}</Text>
            </View>
          )}
        </View>
      )}

      {rectification.status === 'pending' && (
        <View className={styles.actionRow}>
          <View className={styles.confirmBtn} onClick={handleConfirm}>
            <Text className={styles.confirmBtnText}>确认整改</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default RectificationCard;
