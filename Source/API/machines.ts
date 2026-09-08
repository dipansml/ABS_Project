import { Machine } from '../Types/machine';
import {
  formatToMMDDYYYY,
  formatToYYYYMMDD,
} from '../Utils/CommonUtils';

// Local host
// export const API_BASE_URL = 'http://192.168.1.163:8000';
export const API_BASE_URL = 'http://192.168.1.140:8000';

// Live server
//export const API_BASE_URL = 'http://182.73.216.91:8000';

// Shape of the raw object the server sends (includes fields we don't use).
type RawMachine = {
  id: number;
  name: string;
  image_url?: string;
  video_url?: string;
  detected_at?: string;
  status: Machine['status'];
  mc_id?: string;
  created_at?: string;
  updated_at?: string;
  camera_status?: string;
};

export async function fetchMachines(): Promise<Machine[]> {
  const url = `${API_BASE_URL}/api/machines`;

  console.log('fetchMachines: requesting', url);

  try {
    const response = await fetch(url);

    console.log(
      'fetchMachines: response status',
      response.status,
    );

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`,
      );
    }

    const raw = (await response.json()) as RawMachine[];

    // Only keep the fields the card actually needs.
    return raw.map(m => ({
      id: m.id,
      name: m.name,
      image_url: m.image_url,
      video_url: m.video_url,
      mc_id: m.mc_id,
      status: m.status,
      detected_at: m.detected_at,
      camera_status: m.camera_status,
    }));
  } catch (err) {
    console.warn('fetchMachines failed:', err);
    throw err;
  }
}

/**
 * Turns a relative path returned by the API
 * (e.g. "/static/images/video-01.mp4")
 * into an absolute URL the app can load.
 *
 * Works for both image and video paths.
 */
export function resolveMediaUrl(
  url?: string,
): string | undefined {
  if (!url) {
    return undefined;
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Back-compat alias — prefer resolveMediaUrl in new code.
export const resolveImageUrl = resolveMediaUrl;

// ---------------------------------------------
// Machine utilization state
// ---------------------------------------------

export interface MachineUtilization {
  mc_id: string;
  date: string;
  runtime: number;
  downtime: number;
  idle: number;
  total_available_time: number;
  total_available_time_formatted: string;
  utilization_percent: number;
  image_url?: string;
}

export async function fetchUtilizationState(
  from: Date,
  to: Date,
): Promise<MachineUtilization[]> {
  console.log(
    'Date',
    formatToYYYYMMDD(from),
    formatToYYYYMMDD(to),
  );

  const url =
    `${API_BASE_URL}/api/machines/utilization/state` +
    `?from=${formatToYYYYMMDD(from)}` +
    `&to=${formatToYYYYMMDD(to)}`;

  console.log(
    'fetchUtilizationState: requesting',
    url,
  );

  try {
    const response = await fetch(url);

    console.log(
      'fetchUtilizationState: response status',
      response.status,
    );

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`,
      );
    }

    const data =
      (await response.json()) as MachineUtilization[];

    console.log(
      'fetchUtilizationState: response data',
      data,
    );

    return data;
  } catch (err) {
    console.warn(
      'fetchUtilizationState failed:',
      err,
    );

    throw err;
  }
}