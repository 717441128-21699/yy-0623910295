import Taro from '@tarojs/taro';
import { create } from 'zustand';
import type { Appeal, Rectification, Review } from '@/types';
import { mockAppeals, mockRectifications, mockReviews } from '@/data/mock';

const STORAGE_KEY = 'scenic_spot_app_storage';

function getAppealStatusText(status: Appeal['status']): string {
  const map: Record<string, string> = {
    pending: '待审核',
    processing: '待沟通',
    rejected: '无需处理',
  };
  return map[status] || status;
}

function getRectificationStatusText(status: Rectification['status']): string {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
  };
  return map[status] || status;
}

interface PersistedData {
  appeals?: Appeal[];
  rectifications?: Rectification[];
  appealedReviewIds?: string[];
}

function loadPersistedData(): PersistedData {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw as string);
    }
  } catch (e) {
    console.error('[Store] 读取持久化数据失败:', e);
  }
  return {};
}

function savePersistedData(data: PersistedData): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[Store] 保存持久化数据失败:', e);
  }
}

const persisted = loadPersistedData();

interface AppState {
  appeals: Appeal[];
  rectifications: Rectification[];
  reviews: Review[];
  appealedReviewIds: string[];
  addAppeal: (appeal: Appeal, reviewId?: string) => void;
  updateRectificationStatus: (id: string, status: Rectification['status']) => void;
  updateAppealStatus: (id: string, status: Appeal['status']) => void;
}

function persistState(state: Pick<AppState, 'appeals' | 'rectifications' | 'appealedReviewIds'>) {
  savePersistedData({
    appeals: state.appeals,
    rectifications: state.rectifications,
    appealedReviewIds: state.appealedReviewIds,
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  appeals: persisted.appeals || mockAppeals,
  rectifications: persisted.rectifications || mockRectifications,
  reviews: mockReviews,
  appealedReviewIds: persisted.appealedReviewIds || [],

  addAppeal: (appeal, reviewId) => {
    set((state) => {
      const newState = {
        appeals: [appeal, ...state.appeals],
        appealedReviewIds: reviewId
          ? [...state.appealedReviewIds, reviewId]
          : state.appealedReviewIds,
      };
      persistState({ ...state, ...newState } as Pick<AppState, 'appeals' | 'rectifications' | 'appealedReviewIds'>);
      return newState;
    });
  },

  updateRectificationStatus: (id, status) => {
    set((state) => {
      const newRectifications = state.rectifications.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              statusText: getRectificationStatusText(status),
              confirmedAt: status !== 'pending' ? new Date().toLocaleString() : undefined,
            }
          : r
      );
      const newState = { rectifications: newRectifications };
      persistState({ ...state, ...newState } as Pick<AppState, 'appeals' | 'rectifications' | 'appealedReviewIds'>);
      return newState;
    });
  },

  updateAppealStatus: (id, status) => {
    set((state) => {
      const newAppeals = state.appeals.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              statusText: getAppealStatusText(status),
              processedAt: status !== 'pending' ? new Date().toLocaleString() : undefined,
            }
          : a
      );
      const newState = { appeals: newAppeals };
      persistState({ ...state, ...newState } as Pick<AppState, 'appeals' | 'rectifications' | 'appealedReviewIds'>);
      return newState;
    });
  },
}));

export { getAppealStatusText, getRectificationStatusText };
