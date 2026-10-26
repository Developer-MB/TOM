export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface YouTubeVideosResponse {
  channelTitle: string;
  items: YouTubeVideo[];
  nextPageToken?: string;
}
