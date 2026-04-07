import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class APIClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

        if (status === 401 && originalRequest && !originalRequest._retry) {
          const requestUrl = originalRequest.url || '';
          const isAuthEndpoint =
            requestUrl.includes('/auth/login/') ||
            requestUrl.includes('/auth/refresh/') ||
            requestUrl.includes('/auth/google/');

          if (!isAuthEndpoint) {
            originalRequest._retry = true;

            try {
              const newAccessToken = await this.refreshAccessToken();
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.client(originalRequest);
            } catch (refreshError) {
              this.handleAuthFailure();
              return Promise.reject(refreshError);
            }
          }
        }

        if (status === 401) {
          this.handleAuthFailure();
        }

        return Promise.reject(error);
      }
    );
  }

  private handleAuthFailure() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('smartsched_user');
    window.location.href = '/';
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('Refresh token missing');
    }

    this.refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken })
      .then((response) => {
        const { access, refresh } = response.data as { access: string; refresh?: string };
        localStorage.setItem('access_token', access);
        if (refresh) {
          localStorage.setItem('refresh_token', refresh);
        }
        return access;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  // Auth endpoints
  async credentialLogin(email: string, password: string) {
    return this.client.post('/auth/login/', { email, password });
  }

  async googleAuth(token: string) {
    return this.client.post('/auth/google/', { token });
  }

  async getConnectionStatus() {
    return this.client.get('/auth/connection-status/');
  }

  async refreshToken(refreshToken: string) {
    return this.client.post('/auth/refresh/', { refresh: refreshToken });
  }

  async getUserProfile() {
    return this.client.get('/auth/users/me/');
  }

  async updateUserProfile(data: any) {
    return this.client.put('/auth/users/update_profile/', data);
  }

  // Faculty endpoints
  async getFaculties(params?: any) {
    return this.client.get('/timetable/faculties/', { params });
  }

  async getFaculty(id: number) {
    return this.client.get(`/timetable/faculties/${id}/`);
  }

  async createFaculty(data: any) {
    return this.client.post('/timetable/faculties/', data);
  }

  async updateFaculty(id: number, data: any) {
    return this.client.put(`/timetable/faculties/${id}/`, data);
  }

  async deleteFaculty(id: number) {
    return this.client.delete(`/timetable/faculties/${id}/`);
  }

  // Subject endpoints
  async getSubjects(params?: any) {
    return this.client.get('/timetable/subjects/', { params });
  }

  async getSubject(id: number) {
    return this.client.get(`/timetable/subjects/${id}/`);
  }

  async createSubject(data: any) {
    return this.client.post('/timetable/subjects/', data);
  }

  async updateSubject(id: number, data: any) {
    return this.client.put(`/timetable/subjects/${id}/`, data);
  }

  async deleteSubject(id: number) {
    return this.client.delete(`/timetable/subjects/${id}/`);
  }

  // Section endpoints
  async getSections(params?: any) {
    return this.client.get('/timetable/sections/', { params });
  }

  async getSection(id: number) {
    return this.client.get(`/timetable/sections/${id}/`);
  }

  async createSection(data: any) {
    return this.client.post('/timetable/sections/', data);
  }

  async updateSection(id: number, data: any) {
    return this.client.put(`/timetable/sections/${id}/`, data);
  }

  async deleteSection(id: number) {
    return this.client.delete(`/timetable/sections/${id}/`);
  }

  // Timetable endpoints
  async getTimetable(params?: any) {
    return this.client.get('/timetable/timetable/', { params });
  }

  async getTimetableSlot(id: number) {
    return this.client.get(`/timetable/timetable/${id}/`);
  }

  async generateTimetable(sectionId: number) {
    return this.client.post('/timetable/timetable/generate/', {
      section_id: sectionId,
    });
  }

  async exportTimetable(sectionId: number) {
    return this.client.get('/timetable/timetable/export/', {
      params: { section_id: sectionId },
      responseType: 'blob',
    });
  }

  // CSV upload endpoints
  async uploadCSV(file: File, uploadType: 'faculty' | 'subject' | 'section') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', uploadType);

    return this.client.post('/csv/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default new APIClient();
