export type UserRole = 'ADMIN' | 'CLIENT';
export type AccountStatus = 'active' | 'inactive';
export type ReportStatus = 'draft' | 'published' | 'revised';
export type CategoryType = 'main' | 'bakery';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  assignedShopIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  shopName: string;
  shopCode: string;
  location: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  assignedUserCount?: number;
  reportCount?: number;
  latestReportDate?: string;
}

export interface UserShopAssignment {
  id: string;
  userId: string;
  shopId: string;
  assignedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isActive: boolean;
  displayOrder: number;
}

export interface InventoryReportItem {
  id: string;
  reportId: string;
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  openingStockValue: number;
  negativeAdjustment: number;
  closingStockValue: number;
  turnover: number;
  // Computed values
  shrinkageSurplus: number; // Difference between opening adjusted and closing (or net variance)
  shrinkage: number; // Negative variance amount
  surplus: number; // Positive variance amount
  shrinkageTurnoverPct: number; // (shrinkage / turnover) * 100
  stockTurnoverRatio: number; // closingStockValue / turnover
  comments?: string;
}

export interface MonthlyShrinkageData {
  month: string; // "Jan", "Feb", ... "Dec"
  monthIndex: number; // 1-12
  shopShrinkage: number;
  bakeryShrinkage: number;
  totalTurnover?: number;
}

export interface ReportSummary {
  openingStockValue: number;
  negativeAdjustment: number;
  closingStockValue: number;
  totalTurnover: number;
  totalShrinkage: number;
  totalSurplus: number;
  netVariance: number;
  shrinkagePercentage: number;
}

export interface InventoryReport {
  id: string;
  inventoryId: string; // e.g. INV-2026-0001
  shopId: string;
  shopName: string;
  shopCode: string;
  reportingMonth: string; // e.g. "September"
  reportingYear: number; // e.g. 2026
  stocktakingDate: string; // e.g. "2026-09-18"
  status: ReportStatus;
  version: number;
  revisionNote?: string;
  createdBy: string;
  createdByName: string;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
  summary: ReportSummary;
  bakerySummary: ReportSummary;
  monthlyShrinkage: MonthlyShrinkageData[];
  items: InventoryReportItem[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: 'REPORT' | 'USER' | 'SHOP' | 'CATEGORY' | 'AUTH';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  assignedShopIds: string[];
}

export interface StockPerformanceInsights {
  highestShrinkageCategories: { categoryName: string; shrinkage: number; percentage: number }[];
  highestSurplusCategories: { categoryName: string; surplus: number }[];
  unusualRatios: { categoryName: string; ratio: number; observation: string }[];
  historicalComparison?: {
    priorPeriodName: string;
    shrinkageChange: number; // change in Rand
    percentageChange: number; // change in %
    direction: 'improved' | 'worsened' | 'stable';
  };
  monthlyTrendSummary: string;
  bakeryPerformanceSummary: string;
}
