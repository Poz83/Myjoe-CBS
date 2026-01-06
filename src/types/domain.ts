// Core domain types for Myjoe

export type Audience = 'toddler' | 'children' | 'tween' | 'teen' | 'adult';

export type StylePreset = 
  | 'bold-simple' 
  | 'kawaii' 
  | 'whimsical' 
  | 'cartoon' 
  | 'botanical';

export type LineWeight = 'thick' | 'medium' | 'fine';

export type Complexity = 'minimal' | 'moderate' | 'detailed' | 'intricate';

export type TrimSize = '8.5x11' | '8.5x8.5' | '6x9';

export interface ProjectDNA {
  pageCount: number;
  trimSize: TrimSize;
  audience: Audience;
  stylePreset: StylePreset;
  lineWeight: LineWeight;
  complexity: Complexity;
  styleAnchorKey?: string;        // R2 key for style anchor image
  styleAnchorDescription?: string; // Text description of style
}

export interface HeroDNA {
  name: string;
  description: string;
  audience: Audience;
  referenceKey: string;            // R2 key for hero reference sheet
  compiledPrompt: string;          // GPT-compiled hero description
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  trimSize: TrimSize;
  audience: Audience;
  stylePreset: StylePreset;
  styleAnchorKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hero {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  audience: Audience;
  referenceKey: string;
  compiledPrompt: string;
  createdAt: Date;
}

export interface JobItem {
  id: string;
  pageId: string;
  version: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
