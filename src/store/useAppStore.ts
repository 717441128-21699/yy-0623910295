import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Appeal, Rectification, Review } from '@/types';
import { mockAppeals, mockRectifications, mockReviews } from '@/data/mock';

interface AppState {
  appeals: Appeal[];
  rectifications: Rectification[];
  reviews: Review[];
  appealedReviewIds: string[];
  addAppeal: (appeal: Appeal, reviewId?: string) => void;
  updateRectificationStatus: (id: string, status: Rectification['status']) => void;
  updateAppealStatus: (id: string, status: Appeal['status']) => void;
  resetAll: () => void;
}

function getAppealStatusText(status: Appeal['status']): string {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    processing: '待沟通',
    resolved: '已解决',
    rejected: '无需处理',
  };
  return statusMap[status] || status;
}

function getRectificationStatusText(status: Rectification['status']): string {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
  };
  return statusMap[status] || status;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      appeals: mockAppeals,
      rectifications: mockRectifications,
      reviews: mockReviews,
      appealedReviewIds: [],

      addAppeal: (appeal, reviewId) =>
        set((state) => ({
          appeals: [appeal, ...state.appeals],
          appealedReviewIds: reviewId
            ? [...state.appealedReviewIds, reviewId]
            : state.appealedReviewIds,
        })),

      updateRectificationStatus: (id, status) =>
        set((state) => ({
          rectifications: state.rectifications.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  statusText: getRectificationStatusText(status),
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

      resetAll: () =>
        set({
          appeals: mockAppeals,
          rectifications: mockRectifications,
          reviews: mockReviews,
          appealedReviewIds: [],
        }),
    }),
    {
      name: 'scenic-spot-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        appeals: state.appeals,
        rectifications: state.rectifications,
        appealedReviewIds: state.appealedReviewIds,
      }),
    }
  )
);

export { getAppealStatusText, getRectificationStatusText };
