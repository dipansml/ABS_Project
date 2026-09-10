export type MachineStatus = 'running' | 'standby' | 'stop';
export type SignalStatus = 'green' | 'yellow' | 'red';

export const STATUS_TO_SIGNAL: Record<MachineStatus, SignalStatus> = {
  running: 'green',
  standby: 'yellow',
  stop: 'red',
};

export type Machine = {
  id: number;
  name: string;
  mc_id?: string;
  detected_at?: string;
  undetected_time?: number;
  camera_status?: string;
  image_url?: string;
  video_url?: string;
  status: MachineStatus;
};