import React, { useState, useMemo } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockReviews } from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';
import type { Appeal } from '@/types';

const AppealFormPage: React.FC = () => {
  const router = useRouter();
  const reviewId = router.params.reviewId || 'r002';
  const { addAppeal } = useAppStore();

  const review = useMemo(() => {
    return mockReviews.find((r) => r.id === reviewId);
  }, [reviewId]);

  const [description, setDescription] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useDidShow(() => {
    console.log('[AppealFormPage] 页面显示，评价ID:', reviewId);
  });

  const handleChooseImage = (type: 'evidence' | 'receipt') => {
    console.log('[AppealFormPage] 选择图片，类型:', type);
    Taro.chooseImage({
      count: type === 'evidence' ? 9 - evidenceImages.length : 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        if (type === 'evidence') {
          setEvidenceImages([...evidenceImages, ...tempFilePaths]);
        } else {
          setReceiptImage(tempFilePaths[0]);
        }
      },
      fail: (err) => {
        console.error('[AppealFormPage] 选择图片失败:', err);
      },
    });
  };

  const handleRemoveEvidence = (index: number) => {
    const newImages = [...evidenceImages];
    newImages.splice(index, 1);
    setEvidenceImages(newImages);
  };

  const handleRemoveReceipt = () => {
    setReceiptImage('');
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Taro.showToast({
        title: '请填写申诉说明',
        icon: 'none',
      });
      return;
    }

    if (evidenceImages.length === 0) {
      Taro.showToast({
        title: '请至少上传一张现场照片',
        icon: 'none',
      });
      return;
    }

    setSubmitting(true);
    console.log('[AppealFormPage] 提交申诉:', {
      reviewId,
      description,
      evidenceImages,
      receiptImage,
    });

    const newAppeal: Appeal = {
      id: `appeal_${Date.now()}`,
      reviewId: reviewId,
      reviewContent: review?.content || '',
      storeName: review?.storeName || '古镇风味餐厅',
      status: 'pending',
      statusText: '待审核',
      description: description,
      evidenceImages: evidenceImages,
      receiptImage: receiptImage || undefined,
      createdAt: new Date().toLocaleString(),
    };

    setTimeout(() => {
      setSubmitting(false);
      addAppeal(newAppeal, reviewId);
      console.log('[AppealFormPage] 申诉已添加到全局状态:', newAppeal.id);
      Taro.showToast({
        title: '申诉提交成功',
        icon: 'success',
        duration: 1500,
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }, 1500);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.reviewSection}>
        <Text className={styles.sectionTitle}>原评价内容</Text>
        <Text className={styles.reviewContent}>
          {review?.content || '评价内容加载中...'}
        </Text>
      </View>

      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            申诉说明
          </Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述您认为评价内容不准确的原因，包括事实情况、时间、地点等信息..."
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
            autoHeight
          />
        </View>

        <View className={styles.uploadSection}>
          <Text className={styles.uploadLabel}>
            <Text className={styles.required}>*</Text>
            现场照片凭证
          </Text>
          <Text className={styles.uploadHint}>最多可上传9张照片，用于证明现场情况</Text>
          <View className={styles.imageList}>
            {evidenceImages.map((img, index) => (
              <View key={index} className={styles.imageItem}>
                <Image src={img} className={styles.uploadedImage} mode="aspectFill" />
                <View className={styles.removeBtn} onClick={() => handleRemoveEvidence(index)}>
                  ×
                </View>
              </View>
            ))}
            {evidenceImages.length < 9 && (
              <View className={styles.addBtn} onClick={() => handleChooseImage('evidence')}>
                <Text className={styles.addIcon}>+</Text>
                <Text className={styles.addText}>添加照片</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.uploadSection}>
          <Text className={styles.uploadLabel}>消费小票/订单截图</Text>
          <Text className={styles.uploadHint}>如涉及消费金额争议，请上传小票或订单截图</Text>
          <View className={styles.imageList}>
            {receiptImage ? (
              <View className={styles.imageItem}>
                <Image src={receiptImage} className={styles.uploadedImage} mode="aspectFill" />
                <View className={styles.removeBtn} onClick={handleRemoveReceipt}>
                  ×
                </View>
              </View>
            ) : (
              <View className={styles.addBtn} onClick={() => handleChooseImage('receipt')}>
                <Text className={styles.addIcon}>+</Text>
                <Text className={styles.addText}>上传小票</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.tipsSection}>
        <Text className={styles.tipsTitle}>温馨提示</Text>
        <Text className={styles.tipsContent}>
          1. 申诉内容需真实客观，请勿提供虚假信息{'\n'}
          2. 运营方会在3个工作日内完成审核{'\n'}
          3. 审核结果将通过站内消息通知您{'\n'}
          4. 如需紧急处理，请联系运营管理方：400-xxx-xxxx
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnCancel} onClick={handleCancel}>
          <Text className={styles.btnCancelText}>取消</Text>
        </View>
        <View className={styles.btnSubmit} onClick={handleSubmit}>
          <Text className={styles.btnSubmitText}>
            {submitting ? '提交中...' : '提交申诉'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AppealFormPage;
