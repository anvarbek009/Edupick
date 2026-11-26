import { useAppStore } from '../store/useAppStore';
import type { Center, Course, ResultEntry, Review, SearchFilters, Tutor } from '../types/domain';
import { filterAndSortCenters, filterAndSortTutors, filterCourses } from '../utils/format';

/**
 * Clean directory repository facade.
 * SWAP POINT: Convert these methods to async Firestore / Supabase / REST queries
 * without changing calling components.
 */
export const directoryService = {
  searchCenters(filters: SearchFilters, userCoords?: { lat: number; lng: number } | null) {
    return filterAndSortCenters(useAppStore.getState().centers, filters, userCoords);
  },

  searchTutors(filters: SearchFilters, userCoords?: { lat: number; lng: number } | null) {
    return filterAndSortTutors(useAppStore.getState().tutors, filters, userCoords);
  },

  searchCourses(filters: SearchFilters): Course[] {
    return filterCourses(useAppStore.getState().courses, filters);
  },

  getCenterBySlug(slug: string): Center | undefined {
    return useAppStore.getState().centers.find((c) => c.slug === slug);
  },

  getTutorBySlug(slug: string): Tutor | undefined {
    return useAppStore.getState().tutors.find((t) => t.slug === slug);
  },

  getResultsForEntity(entityId: string): ResultEntry[] {
    return useAppStore
      .getState()
      .results.filter((r) => r.entityId === entityId && r.moderationStatus === 'approved');
  },

  getReviewsForEntity(entityId: string): Review[] {
    return useAppStore
      .getState()
      .reviews.filter((r) => r.entityId === entityId && r.moderationStatus === 'approved');
  },
};
