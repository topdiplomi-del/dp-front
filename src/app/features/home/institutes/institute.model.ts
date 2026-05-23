export interface Institute {
  id: string;
  name: string;
  short_name: string | null;
  description: string | null;
  video_url: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
