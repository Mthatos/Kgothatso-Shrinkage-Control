import { InventoryReportItem, ReportSummary, StockPerformanceInsights, InventoryReport } from '../types';

/**
 * Rounds a number to exactly two decimal places safely.
 */
export function round2(val: number): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Format a number as South African Rand (ZAR)
 * Example: 509599.44 => "R 509,599.44"
 * Negative example: -61184.72 => "-R 61,184.72"
 */
export function formatZAR(val: number, includeSign: boolean = false): string {
  if (isNaN(val) || !isFinite(val)) return 'R 0.00';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const formatted = absVal.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (isNegative) {
    return `-R ${formatted}`;
  }
  if (includeSign && val > 0) {
    return `+R ${formatted}`;
  }
  return `R ${formatted}`;
}

/**
 * Format percentage
 * Example: 19.19 => "19.19%"
 */
export function formatPercent(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0.00%';
  return `${val.toFixed(2)}%`;
}

/**
 * Format ratio
 * Example: 1.44 => "1.44"
 */
export function formatRatio(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0.00';
  return val.toFixed(2);
}

/**
 * Computes calculations for a single inventory category row.
 * Formula:
 * Expected Ending Stock = Opening Stock Value - Negative Adjustment
 * Variance = Closing Stock Value - Expected Ending Stock
 * If Variance < 0 => Shrinkage = |Variance|, Surplus = 0
 * If Variance > 0 => Surplus = Variance, Shrinkage = 0
 * Shrinkage/Turnover % = Turnover > 0 ? (Shrinkage / Turnover) * 100 : 0
 * Stock/Turnover ratio = Turnover > 0 ? (Closing Stock Value / Turnover) : 0
 */
export function calculateItemRow(
  opening: number,
  negative: number,
  closing: number,
  turnover: number
): {
  shrinkageSurplus: number;
  shrinkage: number;
  surplus: number;
  shrinkageTurnoverPct: number;
  stockTurnoverRatio: number;
} {
  const o = round2(Number(opening) || 0);
  const n = round2(Number(negative) || 0);
  const c = round2(Number(closing) || 0);
  const t = round2(Number(turnover) || 0);

  // Expected stock after adjustments
  const expectedStock = round2(o - n);
  // Net variance: actual closing minus expected
  const variance = round2(c - expectedStock);

  let shrinkage = 0;
  let surplus = 0;

  if (variance < 0) {
    shrinkage = round2(Math.abs(variance));
    surplus = 0;
  } else if (variance > 0) {
    surplus = round2(variance);
    shrinkage = 0;
  }

  const shrinkageTurnoverPct = t > 0 ? round2((shrinkage / t) * 100) : 0;
  const stockTurnoverRatio = t > 0 ? round2(c / t) : 0;

  return {
    shrinkageSurplus: variance,
    shrinkage,
    surplus,
    shrinkageTurnoverPct,
    stockTurnoverRatio,
  };
}

/**
 * Calculates totals and summary across a list of inventory report items.
 */
export function calculateSummary(items: InventoryReportItem[]): ReportSummary {
  let openingStockValue = 0;
  let negativeAdjustment = 0;
  let closingStockValue = 0;
  let totalTurnover = 0;
  let totalShrinkage = 0;
  let totalSurplus = 0;

  for (const item of items) {
    openingStockValue += Number(item.openingStockValue) || 0;
    negativeAdjustment += Number(item.negativeAdjustment) || 0;
    closingStockValue += Number(item.closingStockValue) || 0;
    totalTurnover += Number(item.turnover) || 0;
    totalShrinkage += Number(item.shrinkage) || 0;
    totalSurplus += Number(item.surplus) || 0;
  }

  openingStockValue = round2(openingStockValue);
  negativeAdjustment = round2(negativeAdjustment);
  closingStockValue = round2(closingStockValue);
  totalTurnover = round2(totalTurnover);
  totalShrinkage = round2(totalShrinkage);
  totalSurplus = round2(totalSurplus);

  const netVariance = round2(totalSurplus - totalShrinkage);
  const shrinkagePercentage = totalTurnover > 0 ? round2((totalShrinkage / totalTurnover) * 100) : 0;

  return {
    openingStockValue,
    negativeAdjustment,
    closingStockValue,
    totalTurnover,
    totalShrinkage,
    totalSurplus,
    netVariance,
    shrinkagePercentage,
  };
}

/**
 * Generates data-driven stock performance insights from actual report numbers and prior report.
 */
export function generateStockInsights(
  report: InventoryReport,
  priorReport?: InventoryReport | null
): StockPerformanceInsights {
  const mainItems = report.items.filter((i) => i.categoryType === 'main');
  const bakeryItems = report.items.filter((i) => i.categoryType === 'bakery');

  // Highest shrinkage
  const highestShrinkage = [...mainItems]
    .filter((i) => i.shrinkage > 0)
    .sort((a, b) => b.shrinkage - a.shrinkage)
    .slice(0, 5)
    .map((i) => ({
      categoryName: i.categoryName,
      shrinkage: i.shrinkage,
      percentage: i.shrinkageTurnoverPct,
    }));

  // Highest surplus
  const highestSurplus = [...mainItems]
    .filter((i) => i.surplus > 0)
    .sort((a, b) => b.surplus - a.surplus)
    .slice(0, 5)
    .map((i) => ({
      categoryName: i.categoryName,
      surplus: i.surplus,
    }));

  // Unusual stock/turnover ratios (> 2.5 or < 0.2 when turnover is high)
  const unusualRatios: { categoryName: string; ratio: number; observation: string }[] = [];
  for (const item of mainItems) {
    if (item.turnover > 1000) {
      if (item.stockTurnoverRatio > 2.5) {
        unusualRatios.push({
          categoryName: item.categoryName,
          ratio: item.stockTurnoverRatio,
          observation: `High stock holding relative to monthly turnover (${formatRatio(item.stockTurnoverRatio)}x), suggesting overstocking risk.`,
        });
      } else if (item.stockTurnoverRatio < 0.3 && item.stockTurnoverRatio > 0) {
        unusualRatios.push({
          categoryName: item.categoryName,
          ratio: item.stockTurnoverRatio,
          observation: `Low buffer holding (${formatRatio(item.stockTurnoverRatio)}x turnover), vulnerable to stockouts during peak trading.`,
        });
      }
    }
  }

  // Historical comparison if prior report exists
  let historicalComparison: StockPerformanceInsights['historicalComparison'] = undefined;
  if (priorReport) {
    const shrinkageChange = round2(report.summary.totalShrinkage - priorReport.summary.totalShrinkage);
    const percentageChange = round2(report.summary.shrinkagePercentage - priorReport.summary.shrinkagePercentage);
    const direction =
      shrinkageChange < -500 ? 'improved' : shrinkageChange > 500 ? 'worsened' : 'stable';

    historicalComparison = {
      priorPeriodName: `${priorReport.reportingMonth} ${priorReport.reportingYear}`,
      shrinkageChange,
      percentageChange,
      direction,
    };
  }

  // Monthly trend summary
  const monthsWithData = report.monthlyShrinkage.filter((m) => m.shopShrinkage > 0);
  let monthlyTrendSummary = 'Comprehensive 12-month shrinkage tracking active.';
  if (monthsWithData.length >= 2) {
    const recent = monthsWithData[monthsWithData.length - 1];
    const previous = monthsWithData[monthsWithData.length - 2];
    const diff = recent.shopShrinkage - previous.shopShrinkage;
    if (diff > 1000) {
      monthlyTrendSummary = `Shrinkage rose by ${formatZAR(diff)} from ${previous.month} to ${recent.month}. Immediate category audit recommended.`;
    } else if (diff < -1000) {
      monthlyTrendSummary = `Shrinkage decreased by ${formatZAR(Math.abs(diff))} from ${previous.month} to ${recent.month}, demonstrating improved floor controls.`;
    } else {
      monthlyTrendSummary = `Shrinkage remained relatively consistent between ${previous.month} and ${recent.month} (${formatZAR(recent.shopShrinkage)}).`;
    }
  }

  // Bakery performance summary
  let bakeryPerformanceSummary = 'Bakery section stable.';
  if (bakeryItems.length > 0) {
    const bakerySummary = report.bakerySummary || calculateSummary(bakeryItems);
    if (bakerySummary.totalShrinkage > 0) {
      bakeryPerformanceSummary = `Bakery recorded ${formatZAR(bakerySummary.totalShrinkage)} total shrinkage (${formatPercent(bakerySummary.shrinkagePercentage)} of bakery turnover). Quick-perish waste controls should be monitored daily.`;
    } else {
      bakeryPerformanceSummary = `Bakery operations recorded zero net shrinkage for ${report.reportingMonth} ${report.reportingYear}.`;
    }
  }

  return {
    highestShrinkageCategories: highestShrinkage,
    highestSurplusCategories: highestSurplus,
    unusualRatios: unusualRatios.slice(0, 4),
    historicalComparison,
    monthlyTrendSummary,
    bakeryPerformanceSummary,
  };
}
