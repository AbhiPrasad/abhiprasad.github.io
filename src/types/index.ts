export interface Presentation {
  title: string;
  event: string;
  date: string; // YYYY-MM-DD format
  description?: string;
  slides?: string | null;
  video?: string | null;
  slidePdf?: string | null;
}

export interface PresentationWithThumbnail extends Presentation {
  thumbnail: string | null;
}

export interface BlogPost {
  title: string;
  description: string;
  date: string; // YYYY-MM format
  url: string;
}

export interface BlogPostWithImage extends BlogPost {
  image: string | null;
}

export interface WorkExperience {
  company: string;
  role: string;
  startDate: string; // YYYY-MM format
  endDate: string | null; // null for current position
  description?: string;
  highlights?: string[];
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  letterboxd?: string;
  sessionize?: string;
  email?: string;
}
