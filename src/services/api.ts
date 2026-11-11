import {
  AuthUser,
  Shop,
  User,
  Category,
  InventoryReport,
  AuditLog,
  MonthlyShrinkageData,
} from '../types';

const TOKEN_KEY = 'kgothatso_auth_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || `HTTP error ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  getToken,
  setToken,
  clearToken,
  request,

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const res = await request<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    return res;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await request<{ user: AuthUser }>('/api/auth/me');
      return res.user;
    } catch {
      clearToken();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearToken();
    }
  },

  // Shops
  async getShops(): Promise<Shop[]> {
    return request<Shop[]>('/api/shops');
  },

  async getShopById(id: string): Promise<Shop> {
    return request<Shop>(`/api/shops/${id}`);
  },

  async createShop(shopData: { shopName: string; shopCode: string; location: string }): Promise<Shop> {
    return request<Shop>('/api/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
    });
  },

  async updateShop(id: string, updates: Partial<Shop>): Promise<Shop> {
    return request<Shop>(`/api/shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Users (Admin only)
  async getUsers(): Promise<User[]> {
    return request<User[]>('/api/users');
  },

  async createUser(userData: {
    fullName: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'CLIENT';
    assignedShopIds?: string[];
  }): Promise<User> {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(
    id: string,
    updates: {
      fullName?: string;
      email?: string;
      password?: string;
      role?: 'ADMIN' | 'CLIENT';
      accountStatus?: 'active' | 'inactive';
      assignedShopIds?: string[];
    }
  ): Promise<User> {
    return request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/api/categories');
  },

  async createCategory(data: { name: string; type: 'main' | 'bakery' }): Promise<Category> {
    return request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reports
  async getReports(params?: { shopId?: string; status?: string }): Promise<InventoryReport[]> {
    const query = new URLSearchParams();
    if (params?.shopId) query.set('shopId', params.shopId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<InventoryReport[]>(`/api/reports${qs ? `?${qs}` : ''}`);
  },

  async getReportById(id: string): Promise<{ report: InventoryReport; priorReport?: InventoryReport | null }> {
    return request<{ report: InventoryReport; priorReport?: InventoryReport | null }>(
      `/api/reports/${id}`
    );
  },

  async saveReport(data: {
    id?: string;
    shopId: string;
    reportingMonth: string;
    reportingYear: number;
    stocktakingDate: string;
    status: 'draft' | 'published';
    revisionNote?: string;
    items: any[];
    monthlyShrinkage?: MonthlyShrinkageData[];
  }): Promise<InventoryReport> {
    if (data.id) {
      return request<InventoryReport>(`/api/reports/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    return request<InventoryReport>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async publishReport(id: string): Promise<InventoryReport> {
    return request<InventoryReport>(`/api/reports/${id}/publish`, {
      method: 'POST',
    });
  },

  async deleteReport(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin Stats & Audit
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalActiveShops: number;
    totalPublishedReports: number;
    totalDraftReports: number;
    recentReports: InventoryReport[];
    recentDrafts: InventoryReport[];
  }> {
    return request('/api/admin/stats');
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/api/audit-logs');
  },
};
