export interface SnBEvent {
    id: number;
    title: string;
    description: string;
    creator_id: number;
    host_id: number;
    location: string;
    is_online: boolean;
    start_time: string;
    end_time?: string;
    max_participants?: number;
  }