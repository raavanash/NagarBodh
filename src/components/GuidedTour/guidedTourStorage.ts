const TOUR_STORAGE_KEY = 'nagarbodh-guided-tour-v1';

export interface TourStorageData {
  version: string;
  isCompleted: boolean;
  isSkipped: boolean;
  dontShowAgain: boolean;
  lastStepIndex: number;
}

const defaultData: TourStorageData = {
  version: 'v1',
  isCompleted: false,
  isSkipped: false,
  dontShowAgain: false,
  lastStepIndex: 0
};

export const getTourState = (): TourStorageData => {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch {
    return defaultData;
  }
};

export const saveTourState = (data: Partial<TourStorageData>): TourStorageData => {
  if (typeof window === 'undefined') return defaultData;
  try {
    const current = getTourState();
    const updated = { ...current, ...data };
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return defaultData;
  }
};

export const markTourCompleted = () => saveTourState({ isCompleted: true, lastStepIndex: 7 });
export const markTourSkipped = () => saveTourState({ isSkipped: true });
export const setDontShowAgain = (value: boolean) => saveTourState({ dontShowAgain: value, isSkipped: value });
export const resetTourState = () => {
  if (typeof window === 'undefined') return defaultData;
  localStorage.removeItem(TOUR_STORAGE_KEY);
  return defaultData;
};
