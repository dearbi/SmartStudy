// API Client
import { User } from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = `${BASE_URL}${url}`;
  console.log('[API] Request:', options?.method || 'GET', fullUrl);
  console.log('[API] Headers:', headers);
  console.log('[API] Body:', options?.body);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log('[API] Error response:', errorData);
    throw new Error(errorData.error || `API Request failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[API] Success response:', result);
  return result;
}

// Auth APIs
export const login = (credentials: any) => fetchJson<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const register = (data: any) => fetchJson<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const updateProfile = (data: any) => fetchJson<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
export const fetchCurrentUser = () => fetchJson<User>('/auth/me');

// Dashboard APIs
export const fetchMasteryScore = () => fetchJson<any>('/dashboard/mastery');
export const fetchHeatmapData = () => fetchJson<any[]>(`/dashboard/activity?t=${Date.now()}`);

// Task APIs
export const fetchTasks = () => fetchJson<any[]>('/tasks');
export const createTask = (task: any) => fetchJson<any>('/tasks', { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (id: string, updates: any) => fetchJson<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
export const deleteTask = (id: string) => fetchJson<any>(`/tasks/${id}`, { method: 'DELETE' });
export const checkPlanConsistency = (taskId: string, videoTags: string[]) => fetchJson<any>(`/tasks/${taskId}/ai-plan-adjustment`, { method: 'POST', body: JSON.stringify({ videoTags }) });
export const fetchTaskRecommendations = () => fetchJson<any[]>('/tasks/recommendations');
export const fetchAiTaskRecommendation = async (tasks?: any[]) => {
    try {
        console.log("Calling fetchAiTaskRecommendation with tasks:", tasks?.length);
        const res = await fetchJson<any>('/tasks/ai-recommendation', {
            method: 'POST',
            body: JSON.stringify({ tasks })
        });
        console.log("fetchAiTaskRecommendation result:", res);
        return res;
    } catch (e) {
        console.error("fetchAiTaskRecommendation failed:", e);
        throw e;
    }
};

// Learning Cabin APIs
export const createSession = (videoSrc: string, videoTitle?: string) => 
    fetchJson<any>('/learning/sessions', { method: 'POST', body: JSON.stringify({ videoSrc, videoTitle }) });
export const updateSessionProgress = (id: string, focusDelta: number, pauseDelta: number) => 
    fetchJson<any>(`/learning/sessions/${id}/events`, { method: 'POST', body: JSON.stringify({ focusDelta, pauseDelta }) });
export const endSession = (id: string) => fetchJson<any>(`/learning/sessions/${id}/end`, { method: 'POST' });

// Enhanced Notes APIs
export interface SaveNoteParams {
    sessionId: string;
    content: string;
    title?: string;
    videoSrc?: string;
    videoTitle?: string;
    tags?: string[];
}

export const saveNote = (params: SaveNoteParams) => 
    fetchJson<any>('/learning/notes', { method: 'POST', body: JSON.stringify(params) });
export const getNote = (sessionId: string) => fetchJson<any>(`/learning/notes?sessionId=${sessionId}`);
export const getAllNotes = () => fetchJson<any[]>('/learning/notes/all');
export const getNoteById = (id: string) => fetchJson<any>(`/learning/notes/${id}`);
export const deleteNoteById = (id: string) => fetchJson<any>(`/learning/notes/${id}`, { method: 'DELETE' });
export const updateNoteById = (id: string, updates: any) => 
    fetchJson<any>(`/learning/notes/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
export const searchNotes = (keyword: string) => fetchJson<any[]>(`/learning/notes/search?keyword=${encodeURIComponent(keyword)}`);
export const getAllTags = () => fetchJson<string[]>('/learning/tags');

// AI APIs
export const getAISummary = (frames: string[]) => fetchJson<any>('/learning/ai/summary', { method: 'POST', body: JSON.stringify({ frames }) });
export const transformNote = (content: string) => fetchJson<any>('/learning/ai/markdown/transform', { method: 'POST', body: JSON.stringify({ content }) });
export const analyzeScreenshot = (imageData: string, context?: string) => 
    fetchJson<any>('/learning/ai/analyze-screenshot', { method: 'POST', body: JSON.stringify({ imageData, context }) });

// Feed APIs
export const fetchFeeds = (category: string) => fetchJson<any[]>(`/feeds?category=${encodeURIComponent(category)}`);
