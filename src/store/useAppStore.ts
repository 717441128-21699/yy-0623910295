import { create } from 'zustand';
import type { Appeal, Rectification, Review } from '@/types';
import { mockAppeals, mockRectifications, mockReviews } from '@/data/mock';

interface AppState {
  appeals: Appeal[];
  rectifications: Rectification[];
  reviews: Review[];
  addAppeal: (appeal: Appeal) => void;
  updateRectificationStatus: (id: string, status: Rectification['status']) => void;
  updateAppealStatus: (id: string, status: Appeal['status']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  appeals: mockAppeals,
  rectifications: mockRectifications,
  reviews: mockReviews,

  addAppeal: (appeal) =>
    set((state) => ({
      appeals: [appeal, ...state.appeals],
    })),

  updateRectificationStatus: (id, status) =>
    set((state) => ({
      rectifications: state.rectifications.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              statusText: status === 'pending' ? '待确认' : status === 'confirmed' ? '已确认' : '已完成',
              confirmedAt: status !== 'pending' ? new Date().toLocaleString() : undefined,
            }
          : r
      ),
    })),

  updateAppealStatus: (id, status) =>
    set((state) => ({
      appeals: state.appeals.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              statusText: getAppealStatusText(status),
              processedAt: status !== 'pending' ? new Date().toLocaleString() : undefined,
            }
          : a
      ),
    })),
}));

function getAppealStatusText(status: Appeal['status']): string {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    processing: '待沟通',
    resolved: '已解决',
    rejected: '无需处理',
  };
  return statusMap[status] || status;
}

export { getAppealStatusText };
