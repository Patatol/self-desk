export type MessageType = "text" | "file";

export type Message = {
  id: string;
  content: string;
  type: MessageType;
  file_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type StoredFile = {
  id: string;
  path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  file_url?: string | null;
};
