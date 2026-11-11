import React, { useState, useMemo } from 'react';
import { InventoryReport, InventoryReportItem } from '../../src/types';
import {
  formatZAR,
  formatPercent,
  formatRatio,
  generateStockInsights,
} from '../../src/lib/calculations';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Hash,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  PieChart,
  BarChart3,
  Layers,
  Info,
  DollarSign,
  ArrowUpDown,
  Search,
} from 'lucide-react';

interface StocktakingReportViewProps {
  report: InventoryReport;
  priorReport?: InventoryReport | null;
  onBack: () => void;
  onEditDraft?: () => void;
  isAdmin?: boolean;
}

const StocktakingReportView: React.FC<StocktakingReportViewProps> = ({
  report,
  priorReport,
  onBack,
  onEditDraft,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'bakery' | 'monthly' | 'insights'>('main');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof InventoryReportItem>('shrinkage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const mainItems = useMemo(
    () => report.items.filter((i) => i.categoryType === 'main'),
    [report.items]
  );
  const bakeryItems = useMemo(
    () => report.items.filter((i) => i.categoryType === 'bakery'),
    [report.items]
  );

  const insights = useMemo(
    () => generateStockInsights(report, priorReport),
    [report, priorReport]
  );

  // Sorting and filtering
  const filteredMainItems = useMemo(() => {
    return mainItems
      .filter((i) => i.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const valA = a[sortBy] ?? 0;
        const valB = b[sortBy] ?? 0;
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        }
        return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });
  }, [mainItems, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: keyof InventoryReportItem) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Report History</span>
        </button>

        <div className="flex items-center gap-3">
          {report.status === 'draft' && isAdmin && (
            <button
              onClick={onEditDraft}
              className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-colors"
            >
              Resume Draft Report
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 7.1 Report Header */}
      <div className="bg-dark-card rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  report.status === 'published'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : report.status === 'draft'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {report.status === 'published' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                {report.status === 'draft' && <Clock className="w-3.5 h-3.5 mr-1" />}
                {report.status} Report
              </span>

              <span className="text-xs text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-800 flex items-center gap-1.5 font-mono">
                <Hash className="w-3 h-3 text-brand-red" />
                {report.inventoryId}
              </span>

              {report.version > 1 && (
                <span className="text-[11px] bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50">
                  Version {report.version} (Revised)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-brand-red hidden sm:inline" />
              {report.shopName}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Shop Code: <span className="font-semibold text-gray-300">{report.shopCode}</span> &bull; Period:{' '}
              <span className="font-semibold text-white">{report.reportingMonth} {report.reportingYear}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-gray-800 pt-4 lg:pt-0 lg:pl-8 text-xs text-gray-400">
            <div>
              <span className="block text-gray-500 uppercase tracking-wider text-[10px]">Stocktaking Date</span>
              <span className="font-semibold text-white text-sm mt-0.5 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {report.stocktakingDate}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 uppercase tracking-wider text-[10px]">Publication Date</span>
              <span className="font-semibold text-white text-sm mt-0.5 block">
                {report.publishedAt
                  ? new Date(report.publishedAt).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Unpublished'}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 uppercase tracking-wider text-[10px]">Audited By</span>
              <span className="font-semibold text-white text-sm mt-0.5 block">
                {report.createdByName || 'Kgothatso Lead Auditor'}
              </span>
            </div>
          </div>
        </div>

          {report.revisionNote && (
            <div className="mt-4 p-3 bg-purple-950/30 border border-purple-800/40 rounded-lg text-xs text-purple-200">
              <span className="font-bold">Revision Notice:</span> {report.revisionNote}
            </div>
          )}
      </div>

      {/* 7.2 Main Stocktaking Summary Cards (ZAR) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-red" />
            Financial &amp; Stocktaking Summary
          </h2>
          <span className="text-xs text-gray-400">Values in South African Rand (ZAR)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Opening Stock Value */}
          <div className="bg-dark-card p-4 rounded-xl border border-gray-800 shadow-md">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Opening Stock Value
            </span>
            <div className="text-lg sm:text-xl font-bold text-white mt-1">
              {formatZAR(report.summary.openingStockValue)}
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Beginning of period</span>
          </div>

          {/* Closing Stock Value */}
          <div className="bg-dark-card p-4 rounded-xl border border-gray-800 shadow-md">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Closing Stock Value
            </span>
            <div className="text-lg sm:text-xl font-bold text-white mt-1">
              {formatZAR(report.summary.closingStockValue)}
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Physical count value</span>
          </div>

          {/* Total Turnover */}
          <div className="bg-dark-card p-4 rounded-xl border border-gray-800 shadow-md">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Turnover
            </span>
            <div className="text-lg sm:text-xl font-bold text-blue-400 mt-1">
              {formatZAR(report.summary.totalTurnover)}
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Monthly retail sales</span>
          </div>

          {/* Total Shrinkage */}
          <div className="bg-dark-card p-4 rounded-xl border border-red-900/40 bg-gradient-to-b from-dark-card to-red-950/20 shadow-md">
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider block flex items-center justify-between">
              Total Shrinkage
              <TrendingDown className="w-3.5 h-3.5 text-brand-red" />
            </span>
            <div className="text-lg sm:text-xl font-black text-brand-red mt-1">
              {formatZAR(report.summary.totalShrinkage)}
            </div>
            <span className="text-[10px] text-red-300/70 mt-0.5 block">Negative variances</span>
          </div>

          {/* Total Surplus */}
          <div className="bg-dark-card p-4 rounded-xl border border-emerald-900/40 bg-gradient-to-b from-dark-card to-emerald-950/20 shadow-md">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block flex items-center justify-between">
              Total Surplus
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
              {formatZAR(report.summary.totalSurplus)}
            </div>
            <span className="text-[10px] text-emerald-300/70 mt-0.5 block">Positive variances</span>
          </div>

          {/* Shrinkage Percentage */}
          <div className="bg-dark-card p-4 rounded-xl border border-gray-800 shadow-md">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Shrinkage / Turnover
            </span>
            <div
              className={`text-lg sm:text-xl font-black mt-1 ${
                report.summary.shrinkagePercentage > 5
                  ? 'text-brand-red'
                  : report.summary.shrinkagePercentage > 2
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {formatPercent(report.summary.shrinkagePercentage)}
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Target benchmark: &lt;2.0%</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800 space-x-1 sm:space-x-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('main')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'main'
              ? 'bg-dark-card text-brand-red border-b-2 border-brand-red'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Main Inventory ({mainItems.length} Categories)</span>
        </button>

        <button
          onClick={() => setActiveTab('bakery')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'bakery'
              ? 'bg-dark-card text-brand-red border-b-2 border-brand-red'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Bakery Section ({bakeryItems.length} Lines)</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'monthly'
              ? 'bg-dark-card text-brand-red border-b-2 border-brand-red'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Monthly Shrinkage Analysis (Jan - Dec)</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'insights'
              ? 'bg-dark-card text-brand-red border-b-2 border-brand-red'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Stock Performance Insights</span>
        </button>
      </div>

      {/* TAB 1: 7.3 Main Inventory Breakdown */}
      {activeTab === 'main' && (
        <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Main Inventory Breakdown</h3>
              <p className="text-xs text-gray-400">
                Detailed category reconciliation including adjustments, turnover, and variance analytics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-red w-44 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Professional Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-900/90 text-gray-300 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
                <tr>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('categoryName')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Category</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-500" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('openingStockValue')}
                  >
                    Opening Stock (+)
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('negativeAdjustment')}
                  >
                    Negative (-)
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('closingStockValue')}
                  >
                    Closing Stock
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('shrinkageSurplus')}
                  >
                    Shrinkage &amp; Surplus
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('turnover')}
                  >
                    Turnover
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('shrinkageTurnoverPct')}
                  >
                    Shrinkage %
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('shrinkage')}
                  >
                    Shrinkage (Loss)
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('surplus')}
                  >
                    Surplus (Gain)
                  </th>
                  <th
                    className="py-3.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('stockTurnoverRatio')}
                  >
                    Stock / Turnover
                  </th>
                  <th className="py-3.5 px-4 text-left">Comment</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800/60 font-mono">
                {filteredMainItems.map((item) => {
                  const hasSignificantShrinkage = item.shrinkage > 2500;
                  const isExpanded = expandedItemId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`transition-colors hover:bg-gray-800/40 ${
                          hasSignificantShrinkage ? 'bg-red-950/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-sans font-medium text-white flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            {hasSignificantShrinkage && (
                              <AlertTriangle className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                            )}
                            {item.categoryName}
                          </span>
                          {item.comments && (
                            <button
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className="text-gray-500 hover:text-gray-300 ml-2"
                              title="Toggle details"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-300">
                          {formatZAR(item.openingStockValue)}
                        </td>
                        <td className="py-3 px-3 text-right text-amber-400">
                          {item.negativeAdjustment > 0 ? formatZAR(item.negativeAdjustment) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right text-white font-semibold">
                          {formatZAR(item.closingStockValue)}
                        </td>
                        {/* Shrinkage & Surplus (Net) */}
                        <td
                          className={`py-3 px-3 text-right font-bold ${
                            item.shrinkageSurplus < 0
                              ? 'text-brand-red'
                              : item.shrinkageSurplus > 0
                              ? 'text-emerald-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.shrinkageSurplus !== 0 ? formatZAR(item.shrinkageSurplus, true) : 'R 0.00'}
                        </td>
                        <td className="py-3 px-3 text-right text-blue-300">
                          {formatZAR(item.turnover)}
                        </td>
                        {/* Shrinkage/Turnover % */}
                        <td
                          className={`py-3 px-3 text-right font-bold ${
                            item.shrinkageTurnoverPct > 5
                              ? 'text-brand-red'
                              : item.shrinkageTurnoverPct > 2
                              ? 'text-amber-400'
                              : 'text-gray-300'
                          }`}
                        >
                          {formatPercent(item.shrinkageTurnoverPct)}
                        </td>
                        {/* Shrinkage (Negative Variance) */}
                        <td className="py-3 px-3 text-right text-brand-red font-semibold">
                          {item.shrinkage > 0 ? formatZAR(item.shrinkage) : '—'}
                        </td>
                        {/* Surplus (Positive Variance) */}
                        <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                          {item.surplus > 0 ? formatZAR(item.surplus) : '—'}
                        </td>
                        {/* Stock/Turnover Ratio */}
                        <td className="py-3 px-3 text-right text-gray-400">
                          {formatRatio(item.stockTurnoverRatio)}x
                        </td>
                        {/* Comment */}
                        <td className="py-3 px-4 font-sans text-gray-400 text-[11px] max-w-xs truncate">
                          {item.comments || '—'}
                        </td>
                      </tr>

                      {/* Expanded row for observations */}
                      {isExpanded && item.comments && (
                        <tr className="bg-gray-900/60 text-xs">
                          <td colSpan={11} className="py-2.5 px-6 font-sans text-gray-300 border-b border-gray-800">
                            <span className="font-semibold text-brand-red mr-2">Audit Observation:</span>
                            {item.comments}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Totals Row */}
              <tfoot className="bg-gray-900 font-bold font-mono text-xs border-t-2 border-gray-700 text-white">
                <tr>
                  <td className="py-4 px-4 font-sans uppercase tracking-wider text-brand-red">
                    Total Main Stock
                  </td>
                  <td className="py-4 px-3 text-right">
                    {formatZAR(report.summary.openingStockValue)}
                  </td>
                  <td className="py-4 px-3 text-right text-amber-400">
                    {formatZAR(report.summary.negativeAdjustment)}
                  </td>
                  <td className="py-4 px-3 text-right">
                    {formatZAR(report.summary.closingStockValue)}
                  </td>
                  <td
                    className={`py-4 px-3 text-right ${
                      report.summary.netVariance < 0 ? 'text-brand-red' : 'text-emerald-400'
                    }`}
                  >
                    {formatZAR(report.summary.netVariance, true)}
                  </td>
                  <td className="py-4 px-3 text-right text-blue-300">
                    {formatZAR(report.summary.totalTurnover)}
                  </td>
                  <td className="py-4 px-3 text-right text-brand-red">
                    {formatPercent(report.summary.shrinkagePercentage)}
                  </td>
                  <td className="py-4 px-3 text-right text-brand-red">
                    {formatZAR(report.summary.totalShrinkage)}
                  </td>
                  <td className="py-4 px-3 text-right text-emerald-400">
                    {formatZAR(report.summary.totalSurplus)}
                  </td>
                  <td className="py-4 px-3 text-right text-gray-300">
                    {report.summary.totalTurnover > 0
                      ? formatRatio(report.summary.closingStockValue / report.summary.totalTurnover)
                      : '0.00'}
                    x
                  </td>
                  <td className="py-4 px-4 font-sans text-gray-400 text-[11px]">
                    24 Categories Reconciled
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: 7.5 Bakery Stocktaking Section */}
      {activeTab === 'bakery' && (
        <div className="space-y-6">
          <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-amber-400" />
                  Dedicated Bakery Stocktaking Section
                </h3>
                <p className="text-xs text-gray-400">
                  Specialized tracking for short-shelf-life bakery and hot food operations (Pies, Steers, and quick-serve lines).
                </p>
              </div>

              {/* Bakery summary tags */}
              <div className="flex items-center gap-3">
                <div className="bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800 text-xs">
                  <span className="text-gray-400">Bakery Turnover: </span>
                  <span className="font-bold text-blue-400">{formatZAR(report.bakerySummary.totalTurnover)}</span>
                </div>
                <div className="bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800 text-xs">
                  <span className="text-gray-400">Bakery Shrinkage: </span>
                  <span className="font-bold text-brand-red">{formatZAR(report.bakerySummary.totalShrinkage)}</span>
                </div>
              </div>
            </div>

            {/* Bakery Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-gray-900 text-gray-300 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">Bakery Category</th>
                    <th className="py-3.5 px-3 text-right">Opening Stock (+)</th>
                    <th className="py-3.5 px-3 text-right">Negative (-)</th>
                    <th className="py-3.5 px-3 text-right">Closing Stock</th>
                    <th className="py-3.5 px-3 text-right">Shrinkage &amp; Surplus</th>
                    <th className="py-3.5 px-3 text-right">Turnover</th>
                    <th className="py-3.5 px-3 text-right">Shrinkage %</th>
                    <th className="py-3.5 px-3 text-right">Shrinkage</th>
                    <th className="py-3.5 px-3 text-right">Surplus</th>
                    <th className="py-3.5 px-3 text-right">Stock/Turnover</th>
                    <th className="py-3.5 px-4 text-left">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono">
                  {bakeryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/30">
                      <td className="py-3.5 px-4 font-sans font-medium text-white">{item.categoryName}</td>
                      <td className="py-3.5 px-3 text-right text-gray-300">{formatZAR(item.openingStockValue)}</td>
                      <td className="py-3.5 px-3 text-right text-amber-400">
                        {item.negativeAdjustment > 0 ? formatZAR(item.negativeAdjustment) : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right text-white font-semibold">{formatZAR(item.closingStockValue)}</td>
                      <td
                        className={`py-3.5 px-3 text-right font-bold ${
                          item.shrinkageSurplus < 0 ? 'text-brand-red' : 'text-emerald-400'
                        }`}
                      >
                        {formatZAR(item.shrinkageSurplus, true)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-blue-300">{formatZAR(item.turnover)}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-brand-red">
                        {formatPercent(item.shrinkageTurnoverPct)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-brand-red font-semibold">
                        {item.shrinkage > 0 ? formatZAR(item.shrinkage) : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right text-emerald-400 font-semibold">
                        {item.surplus > 0 ? formatZAR(item.surplus) : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right text-gray-400">{formatRatio(item.stockTurnoverRatio)}x</td>
                      <td className="py-3.5 px-4 font-sans text-gray-400 text-[11px]">{item.comments || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-900 font-bold font-mono text-xs border-t-2 border-gray-700 text-white">
                  <tr>
                    <td className="py-4 px-4 font-sans uppercase tracking-wider text-amber-400">Bakery Totals</td>
                    <td className="py-4 px-3 text-right">{formatZAR(report.bakerySummary.openingStockValue)}</td>
                    <td className="py-4 px-3 text-right text-amber-400">{formatZAR(report.bakerySummary.negativeAdjustment)}</td>
                    <td className="py-4 px-3 text-right">{formatZAR(report.bakerySummary.closingStockValue)}</td>
                    <td
                      className={`py-4 px-3 text-right ${
                        report.bakerySummary.netVariance < 0 ? 'text-brand-red' : 'text-emerald-400'
                      }`}
                    >
                      {formatZAR(report.bakerySummary.netVariance, true)}
                    </td>
                    <td className="py-4 px-3 text-right text-blue-300">{formatZAR(report.bakerySummary.totalTurnover)}</td>
                    <td className="py-4 px-3 text-right text-brand-red">{formatPercent(report.bakerySummary.shrinkagePercentage)}</td>
                    <td className="py-4 px-3 text-right text-brand-red">{formatZAR(report.bakerySummary.totalShrinkage)}</td>
                    <td className="py-4 px-3 text-right text-emerald-400">{formatZAR(report.bakerySummary.totalSurplus)}</td>
                    <td className="py-4 px-3 text-right text-gray-300">
                      {report.bakerySummary.totalTurnover > 0
                        ? formatRatio(report.bakerySummary.closingStockValue / report.bakerySummary.totalTurnover)
                        : '0.00'}
                      x
                    </td>
                    <td className="py-4 px-4 font-sans text-gray-400 text-[11px]">All Bakery Lines Audited</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bakery Monthly Trend */}
            <div className="pt-6 border-t border-gray-800">
              <h4 className="text-sm font-bold text-white mb-3">Monthly Bakery Shrinkage Trend (Jan - Dec)</h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 text-center text-xs">
                {report.monthlyShrinkage.map((m) => (
                  <div key={m.month} className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">{m.month}</span>
                    <span
                      className={`text-xs font-mono font-bold mt-1 block ${
                        m.bakeryShrinkage > 0 ? 'text-amber-400' : 'text-gray-600'
                      }`}
                    >
                      {m.bakeryShrinkage > 0 ? `R ${(m.bakeryShrinkage / 1000).toFixed(1)}k` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 7.4 Monthly Shrinkage Analysis Chart */}
      {activeTab === 'monthly' && (
        <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-red" />
                Monthly Shrinkage Analysis (January – December)
              </h3>
              <p className="text-xs text-gray-400">
                Annual shop variance monitoring displaying historical monthly shop shrinkage and trends.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-brand-red block"></span>
                <span className="text-gray-300">Shop Shrinkage (ZAR)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-amber-400 block"></span>
                <span className="text-gray-300">Bakery Shrinkage (ZAR)</span>
              </div>
            </div>
          </div>

          {/* Bespoke Responsive Bar Chart */}
          <div className="pt-6">
            <div className="h-64 sm:h-80 w-full flex items-end gap-2 sm:gap-4 px-2 border-b border-gray-700">
              {(() => {
                const maxVal = Math.max(
                  ...report.monthlyShrinkage.map((m) => Math.max(m.shopShrinkage, m.bakeryShrinkage, 10000))
                );

                return report.monthlyShrinkage.map((m) => {
                  const shopHeightPct = m.shopShrinkage > 0 ? Math.min(100, (m.shopShrinkage / maxVal) * 100) : 0;
                  const bakeryHeightPct = m.bakeryShrinkage > 0 ? Math.min(100, (m.bakeryShrinkage / maxVal) * 100) : 0;
                  const isCurrent = m.month.toLowerCase().startsWith(report.reportingMonth.toLowerCase().slice(0, 3));

                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 border border-gray-700 text-white text-[11px] py-1 px-2.5 rounded shadow-xl pointer-events-none z-30 whitespace-nowrap">
                        <div className="font-bold">{m.month} {report.reportingYear}</div>
                        <div>Shop: <span className="text-brand-red font-mono">{formatZAR(m.shopShrinkage)}</span></div>
                        <div>Bakery: <span className="text-amber-400 font-mono">{formatZAR(m.bakeryShrinkage)}</span></div>
                      </div>

                      {/* Bars */}
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Shop Bar */}
                        <div
                          style={{ height: `${shopHeightPct}%` }}
                          className={`w-1/2 rounded-t transition-all duration-300 ${
                            isCurrent
                              ? 'bg-gradient-to-t from-red-700 to-brand-red shadow-lg shadow-brand-red/30'
                              : m.shopShrinkage > 0
                              ? 'bg-red-700/80 hover:bg-brand-red'
                              : 'bg-gray-800/30'
                          }`}
                        ></div>

                        {/* Bakery Bar */}
                        <div
                          style={{ height: `${bakeryHeightPct}%` }}
                          className={`w-1/2 rounded-t transition-all duration-300 ${
                            m.bakeryShrinkage > 0 ? 'bg-amber-500/80 hover:bg-amber-400' : 'bg-gray-800/30'
                          }`}
                        ></div>
                      </div>

                      {/* Month label */}
                      <span
                        className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                          isCurrent ? 'text-brand-red font-black' : 'text-gray-400'
                        }`}
                      >
                        {m.month}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Month Data Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
            {report.monthlyShrinkage.map((m) => (
              <div
                key={m.month}
                className={`p-3 rounded-xl border text-xs ${
                  m.month.toLowerCase().startsWith(report.reportingMonth.toLowerCase().slice(0, 3))
                    ? 'bg-brand-red/10 border-brand-red/50 shadow-md'
                    : 'bg-gray-900/60 border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between text-gray-400 mb-1">
                  <span className="font-bold text-white uppercase">{m.month}</span>
                  {m.shopShrinkage > 0 && <span className="text-[10px] text-gray-500 font-mono">Act</span>}
                </div>
                <div className="font-mono text-sm font-bold text-brand-red">
                  {m.shopShrinkage > 0 ? formatZAR(m.shopShrinkage) : '—'}
                </div>
                {m.bakeryShrinkage > 0 && (
                  <div className="text-[10px] font-mono text-amber-400 mt-1">
                    Bakery: {formatZAR(m.bakeryShrinkage)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 7.6 Stock Performance Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highest Shrinkage */}
            <div className="bg-dark-card rounded-2xl border border-red-900/30 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-brand-red" />
                Categories with Highest Shrinkage
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Priority vulnerability lines requiring intensified stock security, intake checks, and shelf auditing.
              </p>

              <div className="space-y-3">
                {insights.highestShrinkageCategories.map((item, idx) => (
                  <div
                    key={item.categoryName}
                    className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-red/20 text-brand-red font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{item.categoryName}</div>
                        <div className="text-[11px] text-gray-400">
                          Variance: {formatPercent(item.percentage)} of category turnover
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-brand-red text-sm">
                      {formatZAR(item.shrinkage)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highest Surplus */}
            <div className="bg-dark-card rounded-2xl border border-emerald-900/30 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Categories with Positive Surplus
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Categories where physical stock exceeded theoretical book stock. May indicate mis-scans or delivery over-delivery.
              </p>

              <div className="space-y-3">
                {insights.highestSurplusCategories.length > 0 ? (
                  insights.highestSurplusCategories.map((item, idx) => (
                    <div
                      key={item.categoryName}
                      className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div className="text-sm font-semibold text-white">{item.categoryName}</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        +{formatZAR(item.surplus)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No positive surplus recorded across active lines.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historical comparison & ratios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Historical Comparison */}
            <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-400" />
                Historical Comparison
              </h3>

              {insights.historicalComparison ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                    <span className="text-xs text-gray-400 uppercase tracking-wider block">
                      Compared to {insights.historicalComparison.priorPeriodName}
                    </span>
                    <div className="flex items-baseline gap-3 mt-2">
                      <span
                        className={`text-2xl font-bold ${
                          insights.historicalComparison.direction === 'improved'
                            ? 'text-emerald-400'
                            : insights.historicalComparison.direction === 'worsened'
                            ? 'text-brand-red'
                            : 'text-gray-300'
                        }`}
                      >
                        {formatZAR(insights.historicalComparison.shrinkageChange, true)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({formatPercent(Math.abs(insights.historicalComparison.percentageChange))} variance)
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">
                      {insights.historicalComparison.direction === 'improved'
                        ? 'Shrinkage loss decreased compared to previous audit period. Control measures have demonstrated quantifiable efficacy.'
                        : insights.historicalComparison.direction === 'worsened'
                        ? 'Shrinkage loss increased compared to the previous reporting period. Immediate investigation into receiving docks and high-value cage access recommended.'
                        : 'Loss variance is stable relative to prior period.'}
                    </p>
                  </div>

                  <div className="text-xs text-gray-400 bg-gray-900/40 p-3 rounded-lg border border-gray-800/80">
                    <span className="font-bold text-gray-300">Trend Observation: </span>
                    {insights.monthlyTrendSummary}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">
                  First published audit report on file for this shop. Trend baseline established.
                </div>
              )}
            </div>

            {/* Stock to Turnover Anomalies */}
            <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Stock-to-Turnover Observations
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Identifies lines with unusual inventory depth vs trading velocity.
              </p>

              <div className="space-y-3">
                {insights.unusualRatios.map((item) => (
                  <div key={item.categoryName} className="p-3 bg-gray-900/80 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.categoryName}</span>
                      <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded">
                        {formatRatio(item.ratio)}x Ratio
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{item.observation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StocktakingReportView;
