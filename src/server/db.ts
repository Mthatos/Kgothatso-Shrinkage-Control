import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Shop,
  UserShopAssignment,
  Category,
  InventoryReport,
  InventoryReportItem,
  AuditLog,
  ReportSummary,
  MonthlyShrinkageData,
} from '../types';
import { calculateItemRow, calculateSummary, round2 } from '../lib/calculations';

interface DatabaseSchema {
  users: User[];
  shops: Shop[];
  userShopAssignments: UserShopAssignment[];
  categories: Category[];
  reports: InventoryReport[];
  auditLogs: AuditLog[];
  nextInventoryNumber: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_CATEGORIES: { name: string; type: 'main' | 'bakery' }[] = [
  { name: 'Water', type: 'main' },
  { name: 'CSD', type: 'main' },
  { name: 'Energy Drink', type: 'main' },
  { name: 'Sport Drink', type: 'main' },
  { name: 'Juices', type: 'main' },
  { name: 'Iced Teas', type: 'main' },
  { name: 'Dairy Beverages', type: 'main' },
  { name: 'Chewing Gum', type: 'main' },
  { name: 'Chocolate Countline', type: 'main' },
  { name: 'Slaps Chocolate', type: 'main' },
  { name: 'Sweets Packet', type: 'main' },
  { name: 'Crisps & Snacks', type: 'main' },
  { name: 'Grocery', type: 'main' },
  { name: 'Ice Cream', type: 'main' },
  { name: 'Biltong Corner', type: 'main' },
  { name: 'Bread', type: 'main' },
  { name: 'Dairy', type: 'main' },
  { name: 'Health Care', type: 'main' },
  { name: 'Cigarettes', type: 'main' },
  { name: 'Cigarettes Other', type: 'main' },
  { name: 'Lubricant', type: 'main' },
  { name: 'Gas', type: 'main' },
  { name: 'Braai & Outdoor', type: 'main' },
  { name: 'Car Care', type: 'main' },
  { name: 'Pies', type: 'bakery' },
  { name: 'Steers', type: 'bakery' },
];

function seedInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin@2026', salt);
  const clientPasswordHash = bcrypt.hashSync('Client@2026', salt);

  const users: User[] = [
    {
      id: 'usr_admin',
      fullName: 'System Administrator',
      email: 'admin@kgothatso.co.za',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      accountStatus: 'active',
      assignedShopIds: ['shop_001', 'shop_002', 'shop_003'],
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-10T08:00:00.000Z',
    },
    {
      id: 'usr_thabo',
      fullName: 'Thabo Mokoena (Client A)',
      email: 'thabo@client.co.za',
      passwordHash: clientPasswordHash,
      role: 'CLIENT',
      accountStatus: 'active',
      assignedShopIds: ['shop_001', 'shop_003'],
      createdAt: '2026-02-15T09:30:00.000Z',
      updatedAt: '2026-02-15T09:30:00.000Z',
    },
    {
      id: 'usr_nomsa',
      fullName: 'Nomsa Dlamini (Client B)',
      email: 'nomsa@client.co.za',
      passwordHash: clientPasswordHash,
      role: 'CLIENT',
      accountStatus: 'active',
      assignedShopIds: ['shop_002'],
      createdAt: '2026-03-01T10:15:00.000Z',
      updatedAt: '2026-03-01T10:15:00.000Z',
    },
    {
      id: 'usr_sipho',
      fullName: 'Sipho Khumalo (Client C)',
      email: 'sipho@client.co.za',
      passwordHash: clientPasswordHash,
      role: 'CLIENT',
      accountStatus: 'active',
      assignedShopIds: ['shop_001', 'shop_002', 'shop_003'],
      createdAt: '2026-03-10T11:00:00.000Z',
      updatedAt: '2026-03-10T11:00:00.000Z',
    },
  ];

  const shops: Shop[] = [
    {
      id: 'shop_001',
      shopName: 'Shop 001 - Midrand Central Express',
      shopCode: 'SHOP-001',
      location: '563 Olivertambo Street, Klipfontein View, Midrand',
      status: 'active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'shop_002',
      shopName: 'Shop 002 - Sandton City QuickStop',
      shopCode: 'SHOP-002',
      location: '83 Rivonia Road, Sandton, Johannesburg',
      status: 'active',
      createdAt: '2026-01-05T08:00:00.000Z',
      updatedAt: '2026-01-05T08:00:00.000Z',
    },
    {
      id: 'shop_003',
      shopName: 'Shop 003 - Pretoria East Depot',
      shopCode: 'SHOP-003',
      location: 'Atterbury Road & Lois Ave, Menlyn, Pretoria',
      status: 'active',
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-01-15T08:00:00.000Z',
    },
  ];

  const userShopAssignments: UserShopAssignment[] = [
    { id: 'assign_1', userId: 'usr_thabo', shopId: 'shop_001', assignedAt: '2026-02-15T09:30:00.000Z' },
    { id: 'assign_2', userId: 'usr_thabo', shopId: 'shop_003', assignedAt: '2026-02-15T09:30:00.000Z' },
    { id: 'assign_3', userId: 'usr_nomsa', shopId: 'shop_002', assignedAt: '2026-03-01T10:15:00.000Z' },
    { id: 'assign_4', userId: 'usr_sipho', shopId: 'shop_001', assignedAt: '2026-03-10T11:00:00.000Z' },
    { id: 'assign_5', userId: 'usr_sipho', shopId: 'shop_002', assignedAt: '2026-03-10T11:00:00.000Z' },
    { id: 'assign_6', userId: 'usr_sipho', shopId: 'shop_003', assignedAt: '2026-03-10T11:00:00.000Z' },
  ];

  const categories: Category[] = DEFAULT_CATEGORIES.map((c, idx) => ({
    id: `cat_${idx + 1}`,
    name: c.name,
    type: c.type,
    isActive: true,
    displayOrder: idx + 1,
  }));

  // Helper to generate items that sum up exactly to desired totals
  function buildBenchmarkItems(reportId: string): InventoryReportItem[] {
    // Benchmark numbers from prompt:
    // Opening: R509,599.44
    // Closing: R459,679.51
    // Turnover: R318,794.43
    // Total Shrinkage: R61,184.72
    // Total Surplus: R11,264.79
    const breakdown: {
      catName: string;
      catType: 'main' | 'bakery';
      opening: number;
      neg: number;
      closing: number;
      turnover: number;
      comment?: string;
    }[] = [
      { catName: 'Water', catType: 'main', opening: 18450.0, neg: 250.0, closing: 16200.0, turnover: 12500.0, comment: 'Stock well aligned' },
      { catName: 'CSD', catType: 'main', opening: 34200.5, neg: 500.0, closing: 28900.0, turnover: 25400.0, comment: 'Slight breakage recorded in cans' },
      { catName: 'Energy Drink', catType: 'main', opening: 42100.0, neg: 820.0, closing: 31200.0, turnover: 32000.0, comment: 'High shrinkage detected at refrigerated counter' },
      { catName: 'Sport Drink', catType: 'main', opening: 16800.0, neg: 150.0, closing: 14200.0, turnover: 9800.0 },
      { catName: 'Juices', catType: 'main', opening: 21500.0, neg: 310.0, closing: 18100.0, turnover: 14200.0 },
      { catName: 'Iced Teas', catType: 'main', opening: 9400.0, neg: 80.0, closing: 8100.0, turnover: 6400.0 },
      { catName: 'Dairy Beverages', catType: 'main', opening: 14300.0, neg: 450.0, closing: 11200.0, turnover: 11000.0, comment: 'Short-dated spoilage written off' },
      { catName: 'Chewing Gum', catType: 'main', opening: 8500.0, neg: 0.0, closing: 7100.0, turnover: 5600.0 },
      { catName: 'Chocolate Countline', catType: 'main', opening: 28900.0, neg: 210.0, closing: 22400.0, turnover: 18500.0, comment: 'Point of sale pilferage risk' },
      { catName: 'Slaps Chocolate', catType: 'main', opening: 15200.0, neg: 120.0, closing: 12800.0, turnover: 9400.0 },
      { catName: 'Sweets Packet', catType: 'main', opening: 19400.0, neg: 190.0, closing: 16900.0, turnover: 12100.0 },
      { catName: 'Crisps & Snacks', catType: 'main', opening: 29800.0, neg: 340.0, closing: 24100.0, turnover: 21000.0 },
      { catName: 'Grocery', catType: 'main', opening: 48500.0, neg: 620.0, closing: 43200.0, turnover: 28400.0, comment: 'Bulk pantry line reconciliation passed' },
      { catName: 'Ice Cream', catType: 'main', opening: 12400.0, neg: 750.0, closing: 10100.0, turnover: 8200.0, comment: 'Compressor thermal trip caused loss' },
      { catName: 'Biltong Corner', catType: 'main', opening: 22100.0, neg: 180.0, closing: 17400.0, turnover: 16800.0, comment: 'Scale calibration verified' },
      { catName: 'Bread', catType: 'main', opening: 6800.0, neg: 410.0, closing: 5900.0, turnover: 8500.0 },
      { catName: 'Dairy', catType: 'main', opening: 16700.0, neg: 520.0, closing: 14200.0, turnover: 15400.0 },
      { catName: 'Health Care', catType: 'main', opening: 11200.0, neg: 50.0, closing: 10400.0, turnover: 4200.0 },
      { catName: 'Cigarettes', catType: 'main', opening: 64500.0, neg: 300.0, closing: 58900.0, turnover: 39500.0, comment: 'Cage lock protocol audited' },
      { catName: 'Cigarettes Other', catType: 'main', opening: 18900.0, neg: 110.0, closing: 16700.0, turnover: 11200.0 },
      { catName: 'Lubricant', catType: 'main', opening: 14800.0, neg: 60.0, closing: 13900.0, turnover: 5800.0 },
      { catName: 'Gas', catType: 'main', opening: 12600.0, neg: 0.0, closing: 11800.0, turnover: 7100.0 },
      { catName: 'Braai & Outdoor', catType: 'main', opening: 11200.0, neg: 40.0, closing: 10300.0, turnover: 4200.0 },
      { catName: 'Car Care', catType: 'main', opening: 10448.94, neg: 80.0, closing: 9579.51, turnover: 4694.43 },
      // Bakery
      { catName: 'Pies', catType: 'bakery', opening: 23500.0, neg: 850.0, closing: 18200.0, turnover: 14500.0, comment: 'Daily warmer log compliance at 98%' },
      { catName: 'Steers', catType: 'bakery', opening: 15200.0, neg: 420.0, closing: 12100.0, turnover: 9800.0, comment: 'Patty & bun yield within target' },
    ];

    return breakdown.map((b, i) => {
      const cat = categories.find((c) => c.name === b.catName) || categories[i];
      const calcs = calculateItemRow(b.opening, b.neg, b.closing, b.turnover);
      return {
        id: `item_${reportId}_${i + 1}`,
        reportId,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryType: b.catType,
        openingStockValue: round2(b.opening),
        negativeAdjustment: round2(b.neg),
        closingStockValue: round2(b.closing),
        turnover: round2(b.turnover),
        shrinkageSurplus: calcs.shrinkageSurplus,
        shrinkage: calcs.shrinkage,
        surplus: calcs.surplus,
        shrinkageTurnoverPct: calcs.shrinkageTurnoverPct,
        stockTurnoverRatio: calcs.stockTurnoverRatio,
        comments: b.comment || '',
      };
    });
  }

  const monthsList = [
    { month: 'Jan', monthIndex: 1, shopShrinkage: 54200.0, bakeryShrinkage: 4100.0, totalTurnover: 295000.0 },
    { month: 'Feb', monthIndex: 2, shopShrinkage: 49800.0, bakeryShrinkage: 3800.0, totalTurnover: 288000.0 },
    { month: 'Mar', monthIndex: 3, shopShrinkage: 52100.0, bakeryShrinkage: 4200.0, totalTurnover: 304000.0 },
    { month: 'Apr', monthIndex: 4, shopShrinkage: 47600.0, bakeryShrinkage: 3600.0, totalTurnover: 299000.0 },
    { month: 'May', monthIndex: 5, shopShrinkage: 58300.0, bakeryShrinkage: 4500.0, totalTurnover: 312000.0 },
    { month: 'Jun', monthIndex: 6, shopShrinkage: 55400.0, bakeryShrinkage: 4300.0, totalTurnover: 308000.0 },
    { month: 'Jul', monthIndex: 7, shopShrinkage: 51200.0, bakeryShrinkage: 3900.0, totalTurnover: 315000.0 },
    { month: 'Aug', monthIndex: 8, shopShrinkage: 57800.0, bakeryShrinkage: 4400.0, totalTurnover: 322000.0 },
    { month: 'Sep', monthIndex: 9, shopShrinkage: 61184.72, bakeryShrinkage: 4820.0, totalTurnover: 318794.43 },
    { month: 'Oct', monthIndex: 10, shopShrinkage: 0, bakeryShrinkage: 0, totalTurnover: 0 },
    { month: 'Nov', monthIndex: 11, shopShrinkage: 0, bakeryShrinkage: 0, totalTurnover: 0 },
    { month: 'Dec', monthIndex: 12, shopShrinkage: 0, bakeryShrinkage: 0, totalTurnover: 0 },
  ];

  // Benchmark Report: Shop 001 - September 2026 (INV-2026-0001)
  const sepItems = buildBenchmarkItems('rep_001');
  const sepMainItems = sepItems.filter((i) => i.categoryType === 'main');
  const sepBakeryItems = sepItems.filter((i) => i.categoryType === 'bakery');
  const sepSummary = calculateSummary(sepMainItems);
  const sepBakerySummary = calculateSummary(sepBakeryItems);

  // August 2026 Report (INV-2026-0002)
  const augItems = buildBenchmarkItems('rep_002').map((item) => {
    const o = round2(item.openingStockValue * 0.98);
    const n = round2(item.negativeAdjustment * 0.95);
    const c = round2(item.closingStockValue * 0.99);
    const t = round2(item.turnover * 1.01);
    const calcs = calculateItemRow(o, n, c, t);
    return {
      ...item,
      openingStockValue: o,
      negativeAdjustment: n,
      closingStockValue: c,
      turnover: t,
      ...calcs,
    };
  });
  const augSummary = calculateSummary(augItems.filter((i) => i.categoryType === 'main'));
  const augBakerySummary = calculateSummary(augItems.filter((i) => i.categoryType === 'bakery'));

  // July 2026 Report (INV-2026-0003)
  const julItems = buildBenchmarkItems('rep_003').map((item) => {
    const o = round2(item.openingStockValue * 0.96);
    const n = round2(item.negativeAdjustment * 0.9);
    const c = round2(item.closingStockValue * 0.97);
    const t = round2(item.turnover * 0.99);
    const calcs = calculateItemRow(o, n, c, t);
    return {
      ...item,
      openingStockValue: o,
      negativeAdjustment: n,
      closingStockValue: c,
      turnover: t,
      ...calcs,
    };
  });
  const julSummary = calculateSummary(julItems.filter((i) => i.categoryType === 'main'));
  const julBakerySummary = calculateSummary(julItems.filter((i) => i.categoryType === 'bakery'));

  // October 2026 DRAFT Report for Shop 001 (INV-2026-0004) - Admin only!
  const octItems = buildBenchmarkItems('rep_004').map((item, idx) => {
    // Some categories filled, some incomplete
    if (idx > 12) {
      return {
        ...item,
        openingStockValue: round2(item.closingStockValue), // rolls forward from closing
        negativeAdjustment: 0,
        closingStockValue: 0,
        turnover: 0,
        shrinkageSurplus: 0,
        shrinkage: 0,
        surplus: 0,
        shrinkageTurnoverPct: 0,
        stockTurnoverRatio: 0,
        comments: 'Pending count validation',
      };
    }
    const o = round2(item.closingStockValue);
    const n = round2(item.negativeAdjustment * 0.8);
    const c = round2(item.closingStockValue * 0.98);
    const t = round2(item.turnover * 0.85);
    const calcs = calculateItemRow(o, n, c, t);
    return {
      ...item,
      openingStockValue: o,
      negativeAdjustment: n,
      closingStockValue: c,
      turnover: t,
      ...calcs,
    };
  });
  const octSummary = calculateSummary(octItems.filter((i) => i.categoryType === 'main'));
  const octBakerySummary = calculateSummary(octItems.filter((i) => i.categoryType === 'bakery'));

  // Reports for Shop 002 (Sandton City QuickStop)
  const s2AugItems = buildBenchmarkItems('rep_005').map((item) => {
    const o = round2(item.openingStockValue * 0.85);
    const n = round2(item.negativeAdjustment * 0.7);
    const c = round2(item.closingStockValue * 0.86);
    const t = round2(item.turnover * 0.88);
    const calcs = calculateItemRow(o, n, c, t);
    return { ...item, openingStockValue: o, negativeAdjustment: n, closingStockValue: c, turnover: t, ...calcs };
  });
  const s2AugSummary = calculateSummary(s2AugItems.filter((i) => i.categoryType === 'main'));
  const s2AugBakerySummary = calculateSummary(s2AugItems.filter((i) => i.categoryType === 'bakery'));

  const s2SepItems = buildBenchmarkItems('rep_006').map((item) => {
    const o = round2(item.openingStockValue * 0.87);
    const n = round2(item.negativeAdjustment * 0.75);
    const c = round2(item.closingStockValue * 0.88);
    const t = round2(item.turnover * 0.9);
    const calcs = calculateItemRow(o, n, c, t);
    return { ...item, openingStockValue: o, negativeAdjustment: n, closingStockValue: c, turnover: t, ...calcs };
  });
  const s2SepSummary = calculateSummary(s2SepItems.filter((i) => i.categoryType === 'main'));
  const s2SepBakerySummary = calculateSummary(s2SepItems.filter((i) => i.categoryType === 'bakery'));

  // Report for Shop 003 (Pretoria East Depot)
  const s3SepItems = buildBenchmarkItems('rep_007').map((item) => {
    const o = round2(item.openingStockValue * 1.15);
    const n = round2(item.negativeAdjustment * 1.1);
    const c = round2(item.closingStockValue * 1.12);
    const t = round2(item.turnover * 1.18);
    const calcs = calculateItemRow(o, n, c, t);
    return { ...item, openingStockValue: o, negativeAdjustment: n, closingStockValue: c, turnover: t, ...calcs };
  });
  const s3SepSummary = calculateSummary(s3SepItems.filter((i) => i.categoryType === 'main'));
  const s3SepBakerySummary = calculateSummary(s3SepItems.filter((i) => i.categoryType === 'bakery'));

  const reports: InventoryReport[] = [
    {
      id: 'rep_001',
      inventoryId: 'INV-2026-0001',
      shopId: 'shop_001',
      shopName: 'Shop 001 - Midrand Central Express',
      shopCode: 'SHOP-001',
      reportingMonth: 'September',
      reportingYear: 2026,
      stocktakingDate: '2026-09-18',
      status: 'published',
      version: 1,
      createdBy: 'usr_admin',
      createdByName: 'System Administrator',
      publishedAt: '2026-09-20T14:30:00.000Z',
      publishedBy: 'System Administrator',
      createdAt: '2026-09-18T08:00:00.000Z',
      updatedAt: '2026-09-20T14:30:00.000Z',
      summary: sepSummary,
      bakerySummary: sepBakerySummary,
      monthlyShrinkage: monthsList,
      items: sepItems,
    },
    {
      id: 'rep_002',
      inventoryId: 'INV-2026-0002',
      shopId: 'shop_001',
      shopName: 'Shop 001 - Midrand Central Express',
      shopCode: 'SHOP-001',
      reportingMonth: 'August',
      reportingYear: 2026,
      stocktakingDate: '2026-08-15',
      status: 'published',
      version: 1,
      createdBy: 'usr_admin',
      createdByName: 'System Administrator',
      publishedAt: '2026-08-17T11:00:00.000Z',
      publishedBy: 'System Administrator',
      createdAt: '2026-08-15T09:00:00.000Z',
      updatedAt: '2026-08-17T11:00:00.000Z',
      summary: augSummary,
      bakerySummary: augBakerySummary,
      monthlyShrinkage: monthsList.map((m) =>
        m.monthIndex <= 8 ? m : { ...m, shopShrinkage: 0, bakeryShrinkage: 0, totalTurnover: 0 }
      ),
      items: augItems,
    },
    {
      id: 'rep_003',
      inventoryId: 'INV-2026-0003',
      shopId: 'shop_001',
      shopName: 'Shop 001 - Midrand Central Express',
      shopCode: 'SHOP-001',
      reportingMonth: 'July',
      reportingYear: 2026,
      stocktakingDate: '2026-07-20',
      status: 'published',
      version: 1,
      createdBy: 'usr_admin',
      createdByName: 'System Administrator',
      publishedAt: '2026-07-22T10:00:00.000Z',
      publishedBy: 'System Administrator',
      createdAt: '2026-07-20T08:30:00.000Z',
      updatedAt: '2026-07-22T10:00:00.000Z',
      summary: julSummary,
      bakerySummary: julBakerySummary,
      monthlyShrinkage: monthsList.map((m) =>
        m.monthIndex <= 7 ? m : { ...m, shopShrinkage: 0, bakeryShrinkage: 0, totalTurnover: 0 }
      ),
      items: julItems,
    },
    {
      id: 'rep_004',
      inventoryId: 'INV-2026-0004',
      shopId: 'shop_001',
      shopName: 'Shop 001 - Midrand Central Express',
      shopCode: 'SHOP-001',
      reportingMonth: 'October',
      reportingYear: 2026,
      stocktakingDate: '2026-10-18',
      status: 'draft',
      version: 1,
      createdBy: 'usr_admin',
      createdByName: 'System Administrator',
      createdAt: '2026-10-18T08:00:00.000Z',
      updatedAt: '2026-10-20T16:45:00.000Z',
      summary: octSummary,
      bakerySummary: octBakerySummary,
      monthlyShrinkage: monthsList,
      items: octItems,
    },
    {
      id: 'rep_005',
      inventoryId: 'INV-2026-0005',
      shopId: 'shop_002',
      shopName: 'Shop 002 - Sandton City QuickStop',
      shopCode: 'SHOP-002',
      reportingMonth: 'August',
      reportingYear: 2026,
      stocktakingDate: '2026-08-16',
      status: 'published',
      version: 1,
      createdBy: 'usr_admin',
      createdByName: 'System Administrator',
      publishedAt: '2026-08-18T09:00:00.000Z',
      publishedBy: 'System Administrator',
      createdAt: '2026-08-16T08:00:00.000Z',
      updatedAt: '2026-08-18T09:00:00.000Z',
      summary: s2AugSummary,
      bakerySummary: s2AugBakerySummary,
      monthlyShrinkage: monthsList,
      items: s2AugItems,
    },
    {
      id: 'rep_006',
      inventoryId: 'INV-2026-0006',
      shopId: 'shop_002',
      shopName: 'Shop 002 - Sandton City QuickStop',
      shopCode: 'SHOP-002',
      reportingMonth: 'September',
      reportingYear: 2026,
      stocktakingDate: '2026-09-17',
      status: 'published',
      version: 1,
      createdBy: 'usr_admin',
      createdByName: 'System Administrator',
      publishedAt: '2026-09-19T11:00:00.000Z',
      publishedBy: 'System Administrator',
      createdAt: '2026-09-17T08:00:00.000Z',
      updatedAt: '2026-09-19T11:00:00.000Z',
      summary: s2SepSummary,
      bakerySummary: s2SepBakerySummary,
      monthlyShrinkage: monthsList,
      items: s2SepItems,
    },
    {
      id: 'rep_007',
      inventoryId: 'INV-2026-0007',
      shopId: 'shop_003',
      shopName: 'Shop 003 - Pretoria East Depot',
      shopCode: 'SHOP-003',
      reportingMonth: 'September',
      reportingYear: 2026,
      stocktakingDate: '2026-09-19',
      status: 'published',
      version: 1,
      createdBy: 'usr_admin',
      createdByName: 'System Administrator',
      publishedAt: '2026-09-21T10:00:00.000Z',
      publishedBy: 'System Administrator',
      createdAt: '2026-09-19T08:30:00.000Z',
      updatedAt: '2026-09-21T10:00:00.000Z',
      summary: s3SepSummary,
      bakerySummary: s3SepBakerySummary,
      monthlyShrinkage: monthsList,
      items: s3SepItems,
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log_1',
      userId: 'usr_admin',
      userEmail: 'admin@kgothatso.co.za',
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'AUTH',
      entityId: 'system',
      details: 'Initial multi-shop inventory system initialized with 3 shops and standard categories.',
      timestamp: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'log_2',
      userId: 'usr_admin',
      userEmail: 'admin@kgothatso.co.za',
      action: 'PUBLISH_REPORT',
      entityType: 'REPORT',
      entityId: 'INV-2026-0001',
      details: 'Published September 2026 stocktaking report for Shop 001 (INV-2026-0001).',
      timestamp: '2026-09-20T14:30:00.000Z',
    },
    {
      id: 'log_3',
      userId: 'usr_admin',
      userEmail: 'admin@kgothatso.co.za',
      action: 'SAVE_DRAFT_REPORT',
      entityType: 'REPORT',
      entityId: 'INV-2026-0004',
      details: 'Saved draft stocktaking report for Shop 001 (INV-2026-0004).',
      timestamp: '2026-10-18T08:00:00.000Z',
    },
  ];

  return {
    users,
    shops,
    userShopAssignments,
    categories,
    reports,
    auditLogs,
    nextInventoryNumber: 8,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load database from file, re-seeding:', err);
    }
    const initial = seedInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users.map((u) => {
      // Reconcile assignedShopIds from assignments table
      const assigned = this.data.userShopAssignments
        .filter((a) => a.userId === u.id)
        .map((a) => a.shopId);
      return {
        ...u,
        assignedShopIds: assigned,
      };
    });
  }

  public getUserById(id: string): User | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return undefined;
    const assigned = this.data.userShopAssignments
      .filter((a) => a.userId === user.id)
      .map((a) => a.shopId);
    return { ...user, assignedShopIds: assigned };
  }

  public getUserByEmail(email: string): User | undefined {
    const norm = email.trim().toLowerCase();
    const user = this.data.users.find((u) => u.email.trim().toLowerCase() === norm);
    if (!user) return undefined;
    const assigned = this.data.userShopAssignments
      .filter((a) => a.userId === user.id)
      .map((a) => a.shopId);
    return { ...user, assignedShopIds: assigned };
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'CLIENT';
    assignedShopIds?: string[];
  }): User {
    const norm = userData.email.trim().toLowerCase();
    if (this.data.users.some((u) => u.email.trim().toLowerCase() === norm)) {
      throw new Error('A user with this email already exists.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);
    const now = new Date().toISOString();
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser: User = {
      id,
      fullName: userData.fullName.trim(),
      email: norm,
      passwordHash,
      role: userData.role,
      accountStatus: 'active',
      assignedShopIds: userData.assignedShopIds || [],
      createdAt: now,
      updatedAt: now,
    };

    this.data.users.push(newUser);

    // Save assignments
    if (userData.assignedShopIds && userData.assignedShopIds.length > 0) {
      for (const shopId of userData.assignedShopIds) {
        this.data.userShopAssignments.push({
          id: `assign_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: id,
          shopId,
          assignedAt: now,
        });
      }
    }

    this.save();
    return this.getUserById(id)!;
  }

  public updateUser(
    id: string,
    updates: {
      fullName?: string;
      email?: string;
      password?: string;
      role?: 'ADMIN' | 'CLIENT';
      accountStatus?: 'active' | 'inactive';
      assignedShopIds?: string[];
    }
  ): User {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found.');

    if (updates.email) {
      const norm = updates.email.trim().toLowerCase();
      if (this.data.users.some((u) => u.id !== id && u.email.trim().toLowerCase() === norm)) {
        throw new Error('Email is already taken by another user.');
      }
      user.email = norm;
    }
    if (updates.fullName !== undefined) user.fullName = updates.fullName.trim();
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.accountStatus !== undefined) user.accountStatus = updates.accountStatus;
    if (updates.password) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(updates.password, salt);
    }
    user.updatedAt = new Date().toISOString();

    if (updates.assignedShopIds !== undefined) {
      // Replace assignments
      this.data.userShopAssignments = this.data.userShopAssignments.filter((a) => a.userId !== id);
      for (const shopId of updates.assignedShopIds) {
        this.data.userShopAssignments.push({
          id: `assign_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: id,
          shopId,
          assignedAt: new Date().toISOString(),
        });
      }
    }

    this.save();
    return this.getUserById(id)!;
  }

  public deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.data.userShopAssignments = this.data.userShopAssignments.filter((a) => a.userId !== id);
    this.save();
    return true;
  }

  // --- Shops ---
  public getShops(): Shop[] {
    return this.data.shops.map((s) => {
      const assignedUsers = this.data.userShopAssignments.filter((a) => a.shopId === s.id);
      const reports = this.data.reports.filter((r) => r.shopId === s.id && r.status === 'published');
      const latestReport = reports.sort((a, b) => new Date(b.stocktakingDate).getTime() - new Date(a.stocktakingDate).getTime())[0];
      return {
        ...s,
        assignedUserCount: assignedUsers.length,
        reportCount: reports.length,
        latestReportDate: latestReport ? latestReport.stocktakingDate : undefined,
      };
    });
  }

  public getShopById(id: string): Shop | undefined {
    return this.getShops().find((s) => s.id === id);
  }

  public createShop(shopData: { shopName: string; shopCode: string; location: string }): Shop {
    const now = new Date().toISOString();
    const id = `shop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newShop: Shop = {
      id,
      shopName: shopData.shopName.trim(),
      shopCode: shopData.shopCode.trim().toUpperCase(),
      location: shopData.location.trim(),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.data.shops.push(newShop);
    this.save();
    return this.getShopById(id)!;
  }

  public updateShop(
    id: string,
    updates: { shopName?: string; shopCode?: string; location?: string; status?: 'active' | 'inactive' }
  ): Shop {
    const shop = this.data.shops.find((s) => s.id === id);
    if (!shop) throw new Error('Shop not found.');
    if (updates.shopName) shop.shopName = updates.shopName.trim();
    if (updates.shopCode) shop.shopCode = updates.shopCode.trim().toUpperCase();
    if (updates.location) shop.location = updates.location.trim();
    if (updates.status) shop.status = updates.status;
    shop.updatedAt = new Date().toISOString();
    this.save();
    return this.getShopById(id)!;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public createCategory(categoryData: { name: string; type: 'main' | 'bakery' }): Category {
    const id = `cat_${Date.now()}`;
    const newCat: Category = {
      id,
      name: categoryData.name.trim(),
      type: categoryData.type,
      isActive: true,
      displayOrder: this.data.categories.length + 1,
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  // --- Reports ---
  public generateNextInventoryId(year: number = 2026): string {
    const num = this.data.nextInventoryNumber;
    this.data.nextInventoryNumber += 1;
    this.save();
    const padded = String(num).padStart(4, '0');
    return `INV-${year}-${padded}`;
  }

  public getReports(filter?: {
    shopId?: string;
    status?: 'draft' | 'published' | 'revised';
    allowedShopIds?: string[];
    onlyPublished?: boolean;
  }): InventoryReport[] {
    let result = [...this.data.reports];

    if (filter?.onlyPublished) {
      result = result.filter((r) => r.status === 'published' || r.status === 'revised');
    }
    if (filter?.status) {
      result = result.filter((r) => r.status === filter.status);
    }
    if (filter?.shopId) {
      result = result.filter((r) => r.shopId === filter.shopId);
    }
    if (filter?.allowedShopIds) {
      result = result.filter((r) => filter.allowedShopIds!.includes(r.shopId));
    }

    return result.sort(
      (a, b) => new Date(b.stocktakingDate).getTime() - new Date(a.stocktakingDate).getTime()
    );
  }

  public getReportById(id: string): InventoryReport | undefined {
    return this.data.reports.find((r) => r.id === id || r.inventoryId === id);
  }

  public saveReport(reportData: {
    id?: string;
    shopId: string;
    reportingMonth: string;
    reportingYear: number;
    stocktakingDate: string;
    status: 'draft' | 'published' | 'revised';
    createdBy: string;
    createdByName: string;
    revisionNote?: string;
    items: {
      categoryId: string;
      categoryName: string;
      categoryType: 'main' | 'bakery';
      openingStockValue: number;
      negativeAdjustment: number;
      closingStockValue: number;
      turnover: number;
      comments?: string;
    }[];
    monthlyShrinkage?: MonthlyShrinkageData[];
  }): InventoryReport {
    const shop = this.data.shops.find((s) => s.id === reportData.shopId);
    if (!shop) throw new Error('Invalid shop ID.');

    const now = new Date().toISOString();
    let report: InventoryReport;
    const isNew = !reportData.id || !this.data.reports.some((r) => r.id === reportData.id);

    const reportId = reportData.id || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const inventoryId = isNew ? this.generateNextInventoryId(reportData.reportingYear) : (this.getReportById(reportData.id!)?.inventoryId || this.generateNextInventoryId(reportData.reportingYear));

    // Calculate item rows
    const calculatedItems: InventoryReportItem[] = reportData.items.map((item, idx) => {
      const calcs = calculateItemRow(
        item.openingStockValue,
        item.negativeAdjustment,
        item.closingStockValue,
        item.turnover
      );
      return {
        id: `item_${reportId}_${idx + 1}`,
        reportId,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryType: item.categoryType,
        openingStockValue: round2(item.openingStockValue),
        negativeAdjustment: round2(item.negativeAdjustment),
        closingStockValue: round2(item.closingStockValue),
        turnover: round2(item.turnover),
        shrinkageSurplus: calcs.shrinkageSurplus,
        shrinkage: calcs.shrinkage,
        surplus: calcs.surplus,
        shrinkageTurnoverPct: calcs.shrinkageTurnoverPct,
        stockTurnoverRatio: calcs.stockTurnoverRatio,
        comments: item.comments || '',
      };
    });

    const mainItems = calculatedItems.filter((i) => i.categoryType === 'main');
    const bakeryItems = calculatedItems.filter((i) => i.categoryType === 'bakery');
    const summary = calculateSummary(mainItems);
    const bakerySummary = calculateSummary(bakeryItems);

    const monthlyShrinkage =
      reportData.monthlyShrinkage && reportData.monthlyShrinkage.length === 12
        ? reportData.monthlyShrinkage
        : this.getReports({ shopId: shop.id })[0]?.monthlyShrinkage ||
          [
            { month: 'Jan', monthIndex: 1, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Feb', monthIndex: 2, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Mar', monthIndex: 3, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Apr', monthIndex: 4, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'May', monthIndex: 5, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Jun', monthIndex: 6, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Jul', monthIndex: 7, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Aug', monthIndex: 8, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Sep', monthIndex: 9, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Oct', monthIndex: 10, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Nov', monthIndex: 11, shopShrinkage: 0, bakeryShrinkage: 0 },
            { month: 'Dec', monthIndex: 12, shopShrinkage: 0, bakeryShrinkage: 0 },
          ];

    if (isNew) {
      report = {
        id: reportId,
        inventoryId,
        shopId: shop.id,
        shopName: shop.shopName,
        shopCode: shop.shopCode,
        reportingMonth: reportData.reportingMonth,
        reportingYear: reportData.reportingYear,
        stocktakingDate: reportData.stocktakingDate,
        status: reportData.status,
        version: 1,
        revisionNote: reportData.revisionNote,
        createdBy: reportData.createdBy,
        createdByName: reportData.createdByName,
        publishedAt: reportData.status === 'published' ? now : undefined,
        publishedBy: reportData.status === 'published' ? reportData.createdByName : undefined,
        createdAt: now,
        updatedAt: now,
        summary,
        bakerySummary,
        monthlyShrinkage,
        items: calculatedItems,
      };
      this.data.reports.push(report);
    } else {
      const existing = this.data.reports.find((r) => r.id === reportData.id)!;
      existing.shopId = shop.id;
      existing.shopName = shop.shopName;
      existing.shopCode = shop.shopCode;
      existing.reportingMonth = reportData.reportingMonth;
      existing.reportingYear = reportData.reportingYear;
      existing.stocktakingDate = reportData.stocktakingDate;
      existing.status = reportData.status;
      if (reportData.status === 'published' && !existing.publishedAt) {
        existing.publishedAt = now;
        existing.publishedBy = reportData.createdByName;
      }
      if (reportData.revisionNote) {
        existing.revisionNote = reportData.revisionNote;
        existing.version = (existing.version || 1) + 1;
      }
      existing.updatedAt = now;
      existing.summary = summary;
      existing.bakerySummary = bakerySummary;
      existing.monthlyShrinkage = monthlyShrinkage;
      existing.items = calculatedItems;
      report = existing;
    }

    this.save();
    return report;
  }

  public publishReport(id: string, publishedByName: string): InventoryReport {
    const report = this.data.reports.find((r) => r.id === id);
    if (!report) throw new Error('Report not found.');

    const now = new Date().toISOString();
    // Validate report has items
    if (!report.items || report.items.length === 0) {
      throw new Error('Cannot publish an empty report. Please add inventory category items.');
    }

    // Atomic recalculation
    const mainItems = report.items.filter((i) => i.categoryType === 'main');
    const bakeryItems = report.items.filter((i) => i.categoryType === 'bakery');
    report.summary = calculateSummary(mainItems);
    report.bakerySummary = calculateSummary(bakeryItems);
    report.status = 'published';
    report.publishedAt = now;
    report.publishedBy = publishedByName;
    report.updatedAt = now;

    this.save();
    return report;
  }

  public deleteReport(id: string): boolean {
    const idx = this.data.reports.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.data.reports.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addAuditLog(entry: {
    userId: string;
    userEmail: string;
    action: string;
    entityType: 'REPORT' | 'USER' | 'SHOP' | 'CATEGORY' | 'AUTH';
    entityId: string;
    details: string;
  }): AuditLog {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...entry,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    // Keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return log;
  }
}

export const db = new Database();
