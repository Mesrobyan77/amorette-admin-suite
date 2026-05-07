import api from "./axios";

export interface TemplateFeature {
  name: string;
  included: boolean;
}

export interface Template {
  id: string;
  _id?: string;
  name: string;
  key?: string;
  slug?: string;
  category?: string;
  description?: string;
  basePrice: number;
  currency?: string;
  mainImage?: string;
  gallery?: string[];
  music?: string;
  musicUrl?: string;
  musicTitle?: string;
  features?: TemplateFeature[];
  demoLink?: string;
  views?: number;
  rating?: number;
  isActive?: boolean;
  defaultData?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateListResponse {
  items?: Template[];
  data?: Template[];
  total?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const templatesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<TemplateListResponse | Template[]>("/api/templates/", { params }),
  get: (id: string) => api.get<Template>(`/api/templates/${id}`),
  create: (formData: FormData) =>
    api.post<Template>("/api/templates/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, formData: FormData) =>
    api.put<Template>(`/api/templates/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id: string) => api.delete(`/api/templates/${id}`),
  byIds: (ids: string[]) => api.post<Template[]>("/api/templates/by-ids", { ids }),
};
