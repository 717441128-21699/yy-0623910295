import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Appeal, AppealStatus } from '@/types';

interface AppealCardProps {
  appeal: Appeal;
  onClick?: () => void;
}

const statusMap: Record<AppealStatus, { label: string; className: string }> = {
  pending: { label: '待审核', className: styles.statusPending },
  processing: { label: '待沟通', className: styles.statusProcessing },
  rejected: { label: '无需处理', className: styles.statusRejected },
};

const AppealCard: React.FC<AppealCardProps> = ({ appeal, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = statusMap[appeal.status];

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const hasImages = appeal.evidenceImages.length > 0 || appeal.receiptImage;

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <View className={classnames(styles.statusTag, statusInfo.className)}>
            {statusInfo.label}
          </View>
          <Text className={styles.time}>{appeal.createdAt}</Text>
        </View>
        <View className={styles.expandBtn} onClick={toggleExpand}>
          <Text className={styles.expandText}>{expanded ? '收起' : '展开'}</Text>
          <Text className={classnames(styles.expandIcon, expanded && styles.expandIconRotated)}>
            ▼
          </Text>
        </View>
      </View>

      <View className={styles.reviewContent}>
        <Text className={styles.reviewLabel}>原评价内容：</Text>
        <Text className={styles.reviewText}>{appeal.reviewContent}</Text>
      </View>

      <View className={styles.appealContent}>
        <Text className={styles.appealLabel}>申诉说明：</Text>
        <Text className={styles.appealText}>{appeal.description}</Text>
      </View>

      {expanded && hasImages && (
        <View className={styles.evidenceSection}>
          {appeal.evidenceImages.length > 0 && (
            <View className={styles.evidenceGroup}>
              <Text className={styles.evidenceLabel}>现场照片：</Text>
              <View className={styles.evidenceImages}>
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
            <View className={styles.evidenceGroup}>
              <Text className={styles.evidenceLabel}>消费小票：</Text>
              <View className={styles.evidenceImages}>
                <Image
                  src={appeal.receiptImage}
                  className={styles.evidenceImage}
                  mode="aspectFill"
                />
              </View>
            </View>
          )}
        </View>
      )}

      {expanded && appeal.processor && (
        <View className={styles.processSection}>
          <View className={styles.processDivider} />
          <View className={styles.processInfo}>
            <Text className={styles.processLabel}>处理人：{appeal.processor}</Text>
            {appeal.processedAt && (
              <Text className={styles.processTime}>处理时间：{appeal.processedAt}</Text>
            )}
          </View>
          {appeal.processorComment && (
            <View className={styles.processComment}>
              <Text className={styles.commentLabel}>处理意见：</Text>
              <Text className={styles.commentText}>{appeal.processorComment}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default AppealCard;
