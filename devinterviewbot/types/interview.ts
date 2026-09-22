export enum InterviewMode {
  LIVE = 'LIVE',
  CHAT = 'CHAT'
}

export type InterviewLanguage = 
  | 'python' 
  | 'javascript' 
  | 'typescript' 
  | 'cpp' 
  | 'java' 
  | 'csharp' 
  | 'go' 
  | 'rust' 
  | 'sql' 
  | 'c';


export interface InterviewProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starters: Record<InterviewLanguage, string>;
}
