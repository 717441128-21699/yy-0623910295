export type EmotionType = 'positive' | 'neutral' | 'negative';

export type AppealStatus = 'pending' | 'processing' | 'resolved' | 'rejected';

export type RectificationStatus = 'pending' | 'confirmed' | 'completed';

export type ConsumptionCategory = 'food' | 'souvenir' | 'photography' | 'parking' | 'other';

export type IssueKeyword = 'price_high' | 'queue_long' | 'attitude_bad' | 'forced_consumption' | 'hygiene' | 'quality' | 'other';

export interface Review {
  id: string;
  storeName: string;
  storeCategory: ConsumptionCategory;
  content: string;
  emotion: EmotionType;
  emotionTags: string[];
  keywords: IssueKeyword[];
  source: string;
  sourceUrl?: string;
  rating: number;
  createdAt: string;
  consumerInfo: string;
  hasAppealed: boolean;
  appealId?: string;
}

export interface Appeal {
  id: string;
  reviewId: string;
  reviewContent: string;
  storeName: string;
  status: AppealStatus;
  statusText: string;
  description: string;
  evidenceImages: string[];
  receiptImage?: string;
  createdAt: string;
  processedAt?: string;
  processor?: string;
  processorComment?: string;
}

export interface Rectification {
  id: string;
  title: string;
  description: string;
  issueCount: number;
  relatedReviews: string[];
  deadline: string;
  status: RectificationStatus;
  statusText: string;
  createdAt: string;
  confirmedAt?: string;
  category: ConsumptionCategory;
}

export interface StoreOverview {
  storeName: string;
  storeCategory: ConsumptionCategory;
  totalReviews: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageRating: number;
  pendingAppeals: number;
  pendingRectifications: number;
  topKeywords: { keyword: IssueKeyword; count: number }[];
}

export interface FilterOption {
  label: string;
  value: string;
}
