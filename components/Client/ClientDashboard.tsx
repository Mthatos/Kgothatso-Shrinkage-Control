import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import { Shop, InventoryReport } from '../../src/types';
import StocktakingReportView from '../Reports/StocktakingReportView';
import BrandingLogo from '../BrandingLogo';
import {
  Building2,
  FileText,
  Calendar,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Eye,
  LogOut,
  ShieldCheck,
  TrendingDown,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatZAR, formatPercent } from '../../src/lib/calculations';

interface ClientDashboardProps {
  onBackToHome: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onBackToHome }) => {
  const { user, logout } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopReports, setShopReports] = useState<InventoryReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<InventoryReport | null>(null);
  const [priorReport, setPriorReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shops assigned to this client
  useEffect(() => {
    loadAssignedShops();
  }, []);

  const loadAssignedShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getShops();
      setShops(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned shops.');
    } finally {
      setLoading(false);
    }
  };

  // When a shop is selected, load its published reports
  const handleSelectShop = async (shop: Shop) => {
    setSelectedShop(shop);
    setSelectedReportId(null);
    setCurrentReport(null);
    setLoading(true);
    try {
      // Backend automatically restricts to published reports and verifies user authorization
      const reports = await api.getReports({ shopId: shop.id });
      setShopReports(reports);
    } catch (err: any) {
      setError(err.message || 'Failed to load shop stocktaking reports.');
    } finally {
      setLoading(false);
    }
  };

  // When a specific report is chosen to view
  const handleViewReport = async (reportId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getReportById(reportId);
      setCurrentReport(res.report);
      setPriorReport(res.priorReport || null);
      setSelectedReportId(reportId);
    } catch (err: any) {
      setError(err.message || 'Failed to load stocktaking report.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHistory = () => {
    setSelectedReportId(null);
    setCurrentReport(null);
  };

  const handleBackToShops = () => {
    setSelectedShop(null);
    setShopReports([]);
    setSelectedReportId(null);
    setCurrentReport(null);
  };

  if (loading && shops.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading Client Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200">
      {/* Client Portal Header */}
      <header className="bg-dark-card border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-4">
              <BrandingLogo imgClassName="h-10 sm:h-11 w-auto" />
              <div className="hidden sm:block border-l border-gray-700 pl-4">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block">
                  Client Portal
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {user?.fullName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onBackToHome}
                className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              >
                Website Home
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors border border-gray-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        {/* VIEW 3: Full Stocktaking Report View (Read-Only) */}
        {selectedReportId && currentReport ? (
          <StocktakingReportView
            report={currentReport}
            priorReport={priorReport}
            onBack={handleBackToHistory}
            isAdmin={false}
          />
        ) : selectedShop ? (
          /* VIEW 2: Shop Report History */
          <div className="space-y-6 animate-fadeIn">
            {/* Breadcrumb / Return */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
              <button
                onClick={handleBackToShops}
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Assigned Shops</span>
              </button>

              <div className="text-xs text-gray-400">
                Viewing published reports for{' '}
                <span className="font-semibold text-white">{selectedShop.shopName}</span>
              </div>
            </div>

            {/* Shop Banner Card */}
            <div className="bg-dark-card p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-brand-red bg-brand-red/10 px-2.5 py-0.5 rounded border border-brand-red/20">
                      {selectedShop.shopCode}
                    </span>
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Active Branch
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {selectedShop.shopName}
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">{selectedShop.location}</p>
                </div>

                <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800 text-center sm:text-right">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">
                    Available Published Audits
                  </span>
                  <div className="text-2xl font-black text-brand-red mt-0.5">
                    {shopReports.length} {shopReports.length === 1 ? 'Report' : 'Reports'}
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List Table */}
            <div className="bg-dark-card rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-red" />
                    Published Stocktaking Reports
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Select any period to review the comprehensive financial and shrinkage breakdown.
                  </p>
                </div>
              </div>

              {shopReports.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="text-base font-semibold text-white">No Published Reports Yet</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Stock audits conducted for this shop will be visible here once published by the administrator.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-900 text-gray-300 font-semibold uppercase tracking-wider text-xs border-b border-gray-800">
                      <tr>
                        <th className="py-4 px-6">Reporting Period</th>
                        <th className="py-4 px-6">Stocktaking Date</th>
                        <th className="py-4 px-6">Inventory ID</th>
                        <th className="py-4 px-6 text-right">Turnover</th>
                        <th className="py-4 px-6 text-right">Total Shrinkage</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {shopReports.map((report) => (
                        <tr
                          key={report.id}
                          className="hover:bg-gray-800/40 transition-colors group cursor-pointer"
                          onClick={() => handleViewReport(report.id)}
                        >
                          <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-red" />
                            <span>
                              {report.reportingMonth} {report.reportingYear}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-300">
                            {new Date(report.stocktakingDate).toLocaleDateString('en-ZA', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-4 px-6 font-mono text-xs text-gray-400">
                            {report.inventoryId}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-blue-400">
                            {formatZAR(report.summary.totalTurnover)}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-semibold text-brand-red">
                            {formatZAR(report.summary.totalShrinkage)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Published
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewReport(report.id);
                              }}
                              className="inline-flex items-center gap-1.5 bg-brand-red hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all transform group-hover:scale-105"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Report</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VIEW 1: Shop Selection */
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40">
                  Authorized Client Access
                </span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Welcome Back, {user?.fullName}!
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Select one of your assigned shops below to access official inventory and shrinkage reports.
              </p>
            </div>

            {/* Shop Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => handleSelectShop(shop)}
                  className="bg-dark-card hover:bg-gray-800/60 border border-gray-800 hover:border-brand-red/50 p-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400 bg-gray-900 px-2.5 py-1 rounded border border-gray-800">
                        {shop.shopCode}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                      {shop.shopName}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {shop.location}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-500" />
                        Published Audits
                      </span>
                      <span className="font-bold text-white font-mono">
                        {shop.reportCount ?? '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        Latest Stocktaking
                      </span>
                      <span className="font-medium text-gray-300">
                        {shop.latestReportDate
                          ? new Date(shop.latestReportDate).toLocaleDateString('en-ZA', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'No reports yet'}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-brand-red group-hover:translate-x-1 transition-transform">
                        <span>Enter Shop Reports</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {shops.length === 0 && (
              <div className="bg-dark-card p-12 rounded-2xl border border-gray-800 text-center space-y-3">
                <Building2 className="w-12 h-12 text-gray-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Shops Assigned</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Your client account currently has no active shop assignments. Please contact Kgothatso Shrinkage Control administration to configure your branch access.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
