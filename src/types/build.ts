export interface BuildStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  step?: string;
  error?: string | null;
  platform: 'android' | 'pc';
}

export interface Build {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  fileSize: number | null;
  downloadUrl?: string;
  error: string | null;
  platform: 'android' | 'pc';
}