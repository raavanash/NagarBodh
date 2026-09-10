import { DevelopmentContext } from '../../../types/development';

export interface DevelopmentContextProvider {
  /**
   * Fetch development context by administrative hierarchy (state, district, subDistrict)
   */
  getContextByLocation(state: string, district: string, subDistrict?: string): Promise<DevelopmentContext>;

  /**
   * Fetch development context by geographic coordinates (latitude, longitude)
   */
  getContextByCoordinates(lat: number, lng: number): Promise<DevelopmentContext>;

  /**
   * Retrieve all supported geographic context records
   */
  getAllContexts(): Promise<DevelopmentContext[]>;
}
