import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Shop, Category, InventoryReport } from '../../src/types';
import { api } from '../../src/services/api';
import {
  calculateItemRow,
  calculateSummary,
  formatZAR,
  formatPercent,
  round2,
} from '../../src/lib/calculations';
import {
  Save,
  CheckCircle,
  ArrowLeft,
  Building2,
  Calendar,
  AlertCircle,
  Hash,
  Clock,
  Layers,
  PieChart,
  HelpCircle,
} from 'lucide-react';

interface ReportEditorProps {
  existingReport?: InventoryReport | null;
  shops: Shop[];
  categories: Category[];
  onSaved: (report: InventoryReport) => void;
  onCancel: () => void;
}

interface ItemFormState {
  categoryId: string;
  categoryName: string;
  categoryType: 'main' | 'bakery';
  openingStockValue: string;
  negativeAdjustment: string;
  closingStockValue: string;
  turnover: string;
  comments: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ReportEditor: React.FC<ReportEditorProps> = ({
  existingReport,
  shops,
  categories,
  onSaved,
  onCancel,
}) => {
  const [shopId, setShopId] = useState(existingReport?.shopId || shops[0]?.id || '');
  const [reportingMonth, setReportingMonth] = useState(
    existingReport?.reportingMonth || 'September'
  );
  const [reportingYear, setReportingYear] = useState(existingReport?.reportingYear || 2026);
  const [stocktakingDate, setStocktakingDate] = useState(
    existingReport?.stocktakingDate || new Date().toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'main' | 'bakery'>('main');
  const [items, setItems] = useState<ItemFormState[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(
    existingReport?.updatedAt ? new Date(existingReport.updatedAt).toLocaleTimeString() : null
  );
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('All changes up to date');

  // Initialize items from categories and existingReport
  useEffect(() => {
    if (existingReport && existingReport.items && existingReport.items.length > 0) {
      const mapped = existingReport.items.map((i) => ({
        categoryId: i.categoryId,
        categoryName: i.categoryName,
        categoryType: i.categoryType,
        openingStockValue: String(i.openingStockValue),
        negativeAdjustment: String(i.negativeAdjustment),
        closingStockValue: String(i.closingStockValue),
        turnover: String(i.turnover),
        comments: i.comments || '',
      }));
      setItems(mapped);
    } else {
      // Initialize with all active categories
      const mapped = categories
        .filter((c) => c.isActive)
        .map((c) => ({
          categoryId: c.id,
          categoryName: c.name,
          categoryType: c.type,
          openingStockValue: '0',
          negativeAdjustment: '0',
          closingStockValue: '0',
          turnover: '0',
          comments: '',
        }));
      setItems(mapped);
    }
  }, [existingReport, categories]);

  // Compute live calculations
  const computedData = useMemo(() => {
    const computedItems = items.map((item, index) => {
      const o = parseFloat(item.openingStockValue) || 0;
      const n = parseFloat(item.negativeAdjustment) || 0;
      const c = parseFloat(item.closingStockValue) || 0;
      const t = parseFloat(item.turnover) || 0;
      const calcs = calculateItemRow(o, n, c, t);
      return {
        ...item,
        id: `temp_${index}`,
        reportId: existingReport?.id || 'new',
        openingStockValue: o,
        negativeAdjustment: n,
        closingStockValue: c,
        turnover: t,
        ...calcs,
      };
    });

    const mainItems = computedItems.filter((i) => i.categoryType === 'main');
    const bakeryItems = computedItems.filter((i) => i.categoryType === 'bakery');
    const mainSummary = calculateSummary(mainItems);
    const bakerySummary = calculateSummary(bakeryItems);

    return {
      computedItems,
      mainItems,
      bakeryItems,
      mainSummary,
      bakerySummary,
    };
  }, [items, existingReport]);

  const handleFieldChange = (
    index: number,
    field: keyof ItemFormState,
    value: string
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setAutoSaveStatus('Unsaved modifications');
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!shopId) {
      setError('Please select a shop.');
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const payloadItems = items.map((i) => ({
        categoryId: i.categoryId,
        categoryName: i.categoryName,
        categoryType: i.categoryType,
        openingStockValue: parseFloat(i.openingStockValue) || 0,
        negativeAdjustment: parseFloat(i.negativeAdjustment) || 0,
        closingStockValue: parseFloat(i.closingStockValue) || 0,
        turnover: parseFloat(i.turnover) || 0,
        comments: i.comments,
      }));

      const res = await api.saveReport({
        id: existingReport?.id,
        shopId,
        reportingMonth,
        reportingYear: Number(reportingYear),
        stocktakingDate,
        status,
        items: payloadItems,
      });

      setLastSavedTime(new Date().toLocaleTimeString());
      setAutoSaveStatus('Saved successfully');
      onSaved(res);
    } catch (err: any) {
      setError(err.message || 'Failed to save stocktaking report.');
    } finally {
      setSaving(false);
    }
  };

  const selectedShop = shops.find((s) => s.id === shopId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {existingReport ? 'Edit / Resume Stocktaking Report' : 'Create New Stocktaking Report'}
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-1 font-mono text-brand-red">
                <Hash className="w-3.5 h-3.5" />
                {existingReport?.inventoryId || 'INV-2026-AUTO'}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                {autoSaveStatus}
                {lastSavedTime && ` (Last saved: ${lastSavedTime})`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-brand-red/20 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Publish Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 flex items-center gap-3 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-brand-red flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Configuration Card */}
      <div className="bg-dark-card p-6 rounded-2xl border border-gray-800 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-red" />
          Report Metadata &amp; Shop Assignment
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Select Shop *
            </label>
            <select
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName} ({s.shopCode})
                </option>
              ))}
            </select>
            {selectedShop && (
              <span className="text-[11px] text-gray-500 mt-1 block truncate">
                {selectedShop.location}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Stocktaking Date *
            </label>
            <input
              type="date"
              value={stocktakingDate}
              onChange={(e) => setStocktakingDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Reporting Month *
            </label>
            <select
              value={reportingMonth}
              onChange={(e) => setReportingMonth(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Reporting Year *
            </label>
            <input
              type="number"
              value={reportingYear}
              onChange={(e) => setReportingYear(parseInt(e.target.value, 10))}
              min={2020}
              max={2030}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
        </div>
      </div>

      {/* Live Financial Totals Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-dark-card p-3.5 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            Opening Stock
          </span>
          <div className="text-base font-bold text-white mt-1">
            {formatZAR(computedData.mainSummary.openingStockValue)}
          </div>
        </div>

        <div className="bg-dark-card p-3.5 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            Negative Adjustments
          </span>
          <div className="text-base font-bold text-amber-400 mt-1">
            {formatZAR(computedData.mainSummary.negativeAdjustment)}
          </div>
        </div>

        <div className="bg-dark-card p-3.5 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            Closing Stock
          </span>
          <div className="text-base font-bold text-white mt-1">
            {formatZAR(computedData.mainSummary.closingStockValue)}
          </div>
        </div>

        <div className="bg-dark-card p-3.5 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            Turnover
          </span>
          <div className="text-base font-bold text-blue-400 mt-1">
            {formatZAR(computedData.mainSummary.totalTurnover)}
          </div>
        </div>

        <div className="bg-dark-card p-3.5 rounded-xl border border-red-900/40 bg-red-950/20">
          <span className="text-[10px] text-red-400 uppercase font-bold block">
            Total Shrinkage
          </span>
          <div className="text-base font-bold text-brand-red mt-1">
            {formatZAR(computedData.mainSummary.totalShrinkage)}
          </div>
        </div>

        <div className="bg-dark-card p-3.5 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            Shrinkage %
          </span>
          <div
            className={`text-base font-bold mt-1 ${
              computedData.mainSummary.shrinkagePercentage > 5
                ? 'text-brand-red'
                : 'text-emerald-400'
            }`}
          >
            {formatPercent(computedData.mainSummary.shrinkagePercentage)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 space-x-2">
        <button
          onClick={() => setActiveTab('main')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
            activeTab === 'main'
              ? 'bg-dark-card text-brand-red border-b-2 border-brand-red'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Main Inventory Categories ({computedData.mainItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bakery')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
            activeTab === 'bakery'
              ? 'bg-dark-card text-brand-red border-b-2 border-brand-red'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Bakery Stocktaking Lines ({computedData.bakeryItems.length})</span>
        </button>
      </div>

      {/* Category Input Table */}
      <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Enter Opening, Negative adjustments, Closing count, and Turnover. Shrinkage and % will auto-compute.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-900 text-gray-300 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-3 text-right">Opening Stock (R)</th>
                <th className="py-3 px-3 text-right">Negative Adj (R)</th>
                <th className="py-3 px-3 text-right">Closing Count (R)</th>
                <th className="py-3 px-3 text-right">Turnover (R)</th>
                <th className="py-3 px-3 text-right">Net Variance</th>
                <th className="py-3 px-3 text-right">Shrinkage %</th>
                <th className="py-3 px-3 text-right">Shrinkage</th>
                <th className="py-3 px-3 text-right">Surplus</th>
                <th className="py-3 px-4">Observation Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono">
              {items.map((item, idx) => {
                if (item.categoryType !== activeTab) return null;
                const calcs = calculateItemRow(
                  parseFloat(item.openingStockValue) || 0,
                  parseFloat(item.negativeAdjustment) || 0,
                  parseFloat(item.closingStockValue) || 0,
                  parseFloat(item.turnover) || 0
                );

                return (
                  <tr key={item.categoryId} className="hover:bg-gray-800/30">
                    <td className="py-2.5 px-4 font-sans font-medium text-white">
                      {item.categoryName}
                    </td>

                    {/* Opening Stock Input */}
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={item.openingStockValue}
                        onChange={(e) => handleFieldChange(idx, 'openingStockValue', e.target.value)}
                        className="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-right text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                      />
                    </td>

                    {/* Negative Adjustment Input */}
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={item.negativeAdjustment}
                        onChange={(e) => handleFieldChange(idx, 'negativeAdjustment', e.target.value)}
                        className="w-24 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-right text-xs text-amber-400 focus:outline-none focus:ring-1 focus:ring-brand-red"
                      />
                    </td>

                    {/* Closing Count Input */}
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={item.closingStockValue}
                        onChange={(e) => handleFieldChange(idx, 'closingStockValue', e.target.value)}
                        className="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-right text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-brand-red"
                      />
                    </td>

                    {/* Turnover Input */}
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={item.turnover}
                        onChange={(e) => handleFieldChange(idx, 'turnover', e.target.value)}
                        className="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-right text-xs text-blue-300 focus:outline-none focus:ring-1 focus:ring-brand-red"
                      />
                    </td>

                    {/* Live Computed Variance */}
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        calcs.shrinkageSurplus < 0 ? 'text-brand-red' : 'text-emerald-400'
                      }`}
                    >
                      {formatZAR(calcs.shrinkageSurplus, true)}
                    </td>

                    {/* Live Shrinkage % */}
                    <td className="py-2.5 px-3 text-right font-bold text-gray-300">
                      {formatPercent(calcs.shrinkageTurnoverPct)}
                    </td>

                    {/* Shrinkage */}
                    <td className="py-2.5 px-3 text-right text-brand-red font-semibold">
                      {calcs.shrinkage > 0 ? formatZAR(calcs.shrinkage) : '—'}
                    </td>

                    {/* Surplus */}
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                      {calcs.surplus > 0 ? formatZAR(calcs.surplus) : '—'}
                    </td>

                    {/* Comments Input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="Notes / variances..."
                        value={item.comments}
                        onChange={(e) => handleFieldChange(idx, 'comments', e.target.value)}
                        className="w-44 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-brand-red"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;
