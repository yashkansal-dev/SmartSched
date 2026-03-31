import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class APIClient {
  private client: AxiosInstance;

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
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async googleAuth(token: string) {
    return this.client.post('/auth/google/', { token });
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
