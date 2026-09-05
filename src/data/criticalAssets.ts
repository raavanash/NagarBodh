import { CriticalAsset } from '../types/civic';

export const CRITICAL_ASSETS: CriticalAsset[] = [
  {
    id: 'asset-school-1',
    name: 'St. Jude Primary School & Nursery',
    type: 'school',
    coordinates: { lat: 28.5832, lng: 77.3188 },
    ward: 'Ward 15 - Central Sub-city',
    vulnerabilityBufferMeters: 250,
    contactPerson: 'Principal Dr. Shalini Verma (+91-98110-XXXXX)',
    capacity: '1,200 Students (Active morning dispersal)'
  },
  {
    id: 'asset-hosp-1',
    name: 'Sanjivani Community Hospital & Trauma Unit',
    type: 'hospital',
    coordinates: { lat: 28.5855, lng: 77.3210 },
    ward: 'Ward 15 - Central Sub-city',
    vulnerabilityBufferMeters: 400,
    contactPerson: 'ER Chief Dr. K. Raman (+91-98711-XXXXX)',
    capacity: '180 Beds + Ambulance Bay'
  },
  {
    id: 'asset-metro-1',
    name: 'Sector 15 Interchange Metro Station',
    type: 'metro',
    coordinates: { lat: 28.5818, lng: 77.3165 },
    ward: 'Ward 15 - Central Sub-city',
    vulnerabilityBufferMeters: 300,
    contactPerson: 'Station Controller Station 42 (+91-99580-XXXXX)',
    capacity: '24,000 Daily Footfall'
  },
  {
    id: 'asset-pump-1',
    name: 'Sub-Divisional Stormwater Pumping Station #4',
    type: 'pumping_station',
    coordinates: { lat: 28.5862, lng: 77.3142 },
    ward: 'Ward 15 - Central Sub-city',
    vulnerabilityBufferMeters: 200,
    contactPerson: 'Junior Engineer PWD R. S. Negi (+91-97170-XXXXX)',
    capacity: '3x 120 HP Submersible Capacity'
  },
  {
    id: 'asset-fire-1',
    name: 'East District Quick Response Fire Station',
    type: 'fire_station',
    coordinates: { lat: 28.5775, lng: 77.3245 },
    ward: 'Ward 15 - Central Sub-city',
    vulnerabilityBufferMeters: 500,
    contactPerson: 'Duty Officer S. Yadav (+91-98100-XXXXX)',
    capacity: '4 Rescue Tenders & High-Clearance Rescue'
  },
  // Other city critical assets for spatial context
  {
    id: 'asset-hosp-2',
    name: 'Karol Bagh Apex Civil Hospital',
    type: 'hospital',
    coordinates: { lat: 28.6515, lng: 77.1906 },
    ward: 'Ward 14 - Karol Bagh',
    vulnerabilityBufferMeters: 400,
    contactPerson: 'Dr. Neha Kapoor',
    capacity: '350 Beds'
  },
  {
    id: 'asset-school-2',
    name: 'Bal Bharati Public Senior Secondary',
    type: 'school',
    coordinates: { lat: 28.6480, lng: 77.1865 },
    ward: 'Ward 14 - Karol Bagh',
    vulnerabilityBufferMeters: 300,
    contactPerson: 'Admin Office',
    capacity: '2,400 Students'
  },
  {
    id: 'asset-metro-2',
    name: 'Rajiv Chowk Metro Transit Hub',
    type: 'metro',
    coordinates: { lat: 28.6328, lng: 77.2195 },
    ward: 'Ward 22 - Connaught Place',
    vulnerabilityBufferMeters: 350,
    contactPerson: 'DMRC Central Operations',
    capacity: '80,000 Daily Footfall'
  }
];
