import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import { User, Shop, InventoryReport, Category, AuditLog } from '../../src/types';
import StocktakingReportView from '../Reports/StocktakingReportView';
import ReportEditor from '../Reports/ReportEditor';
import BrandingLogo from '../BrandingLogo';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle,
  FileCheck,
  History,
  Settings,
  LogOut,
  ShieldCheck,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Store,
  ChevronRight,
  AlertTriangle,
  Eye,
  X,
  Lock,
  Mail,
  User as UserIcon,
  MapPin,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { formatZAR, formatPercent } from '../../src/lib/calculations';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

type AdminTab =
  | 'overview'
  | 'users'
  | 'shops'
  | 'all_reports'
  | 'create_report'
  | 'draft_reports'
  | 'published_reports'
  | 'audit_trail'
  | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active viewing/editing state
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<InventoryReport | null>(null);
  const [viewReportData, setViewReportData] = useState<{ report: InventoryReport; priorReport?: InventoryReport | null } | null>(null);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'CLIENT' as 'ADMIN' | 'CLIENT',
    accountStatus: 'active' as 'active' | 'inactive',
    assignedShopIds: [] as string[],
  });

  const [showShopModal, setShowShopModal] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopFormData, setShopFormData] = useState({
    shopName: '',
    shopCode: '',
    location: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'main' | 'bakery'>('main');

  // Search & filter
  const [userSearch, setUserSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [reportShopFilter, setReportShopFilter] = useState('');

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, usersData, shopsData, reportsData, categoriesData, logsData] =
        await Promise.all([
          api.getAdminStats(),
          api.getUsers(),
          api.getShops(),
          api.getReports(),
          api.getCategories(),
          api.getAuditLogs(),
        ]);
      setStats(statsData);
      setUsers(usersData);
      setShops(shopsData);
      setReports(reportsData);
      setCategories(categoriesData);
      setAuditLogs(logsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch administration data.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // User Actions
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'CLIENT',
      accountStatus: 'active',
      assignedShopIds: [],
    });
    setShowUserModal(true);
  };

  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setUserFormData({
      fullName: u.fullName,
      email: u.email,
      password: '',
      role: u.role,
      accountStatus: u.accountStatus,
      assignedShopIds: u.assignedShopIds || [],
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, userFormData);
        showNotification(`User ${userFormData.fullName} updated successfully.`);
      } else {
        if (!userFormData.password) {
          setError('Password is required for new accounts.');
          return;
        }
        await api.createUser(userFormData);
        showNotification(`New ${userFormData.role} account created for ${userFormData.fullName}.`);
      }
      setShowUserModal(false);
      loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to save user.');
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${u.fullName} (${u.email})?`)) {
      return;
    }
    try {
      await api.deleteUser(u.id);
      showNotification(`User ${u.fullName} deleted.`);
      loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  const handleToggleUserStatus = async (u: User) => {
    try {
      const nextStatus = u.accountStatus === 'active' ? 'inactive' : 'active';
      await api.updateUser(u.id, { accountStatus: nextStatus });
      showNotification(`Account status for ${u.fullName} set to ${nextStatus}.`);
      loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle account status.');
    }
  };

  // Shop Actions
  const openCreateShopModal = () => {
    setEditingShop(null);
    setShopFormData({
      shopName: '',
      shopCode: '',
      location: '',
      status: 'active',
    });
    setShowShopModal(true);
  };

  const openEditShopModal = (s: Shop) => {
    setEditingShop(s);
    setShopFormData({
      shopName: s.shopName,
      shopCode: s.shopCode,
      location: s.location,
      status: s.status,
    });
    setShowShopModal(true);
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShop) {
        await api.updateShop(editingShop.id, shopFormData);
        showNotification(`Shop ${shopFormData.shopName} updated.`);
      } else {
        await api.createShop(shopFormData);
        showNotification(`New shop ${shopFormData.shopName} created.`);
      }
      setShowShopModal(false);
      loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to save shop.');
    }
  };

  // Report Viewing & Actions
  const handleViewReport = async (reportId: string) => {
    try {
      const res = await api.getReportById(reportId);
      setViewReportData(res);
      setViewingReportId(reportId);
    } catch (err: any) {
      setError(err.message || 'Failed to load report.');
    }
  };

  const handlePublishReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to finalize and publish this report? It will become visible to authorized shop clients.')) {
      return;
    }
    try {
      await api.publishReport(reportId);
      showNotification('Report published successfully! Now visible to authorized clients.');
      loadAllData();
      if (viewingReportId === reportId) {
        handleViewReport(reportId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish report.');
    }
  };

  const handleDeleteReport = async (report: InventoryReport) => {
    if (!window.confirm(`Delete report ${report.inventoryId} for ${report.shopName}?`)) {
      return;
    }
    try {
      await api.deleteReport(report.id);
      showNotification(`Report ${report.inventoryId} deleted.`);
      loadAllData();
      if (viewingReportId === report.id) {
        setViewingReportId(null);
        setViewReportData(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete report.');
    }
  };

  const handleCreateNewReport = () => {
    setEditingReport(null);
    setViewingReportId(null);
    setCurrentTab('create_report');
  };

  const handleResumeDraft = (report: InventoryReport) => {
    setEditingReport(report);
    setViewingReportId(null);
    setCurrentTab('create_report');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await api.createCategory({ name: newCategoryName, type: newCategoryType });
      setNewCategoryName('');
      setShowNewCategoryModal(false);
      showNotification(`Category "${newCategoryName}" added successfully.`);
      loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to add category.');
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.inventoryId.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.shopName.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.reportingMonth.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesShop = !reportShopFilter || r.shopId === reportShopFilter;
    const matchesTab =
      currentTab === 'draft_reports'
        ? r.status === 'draft'
        : currentTab === 'published_reports'
        ? r.status === 'published' || r.status === 'revised'
        : true;
    return matchesSearch && matchesShop && matchesTab;
  });

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-dark-card border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <BrandingLogo imgClassName="h-10 sm:h-12 w-auto" />
              <div className="hidden sm:block border-l border-gray-700 pl-4">
                <span className="text-xs uppercase tracking-widest text-brand-red font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Administrator Portal
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {user?.fullName} &bull; Full Control
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
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 px-4 py-2.5 text-xs text-center font-semibold animate-fadeIn">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-950/80 border-b border-red-800 text-red-200 px-4 py-2.5 text-xs text-center font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-brand-red" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Admin Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-dark-card rounded-2xl border border-gray-800 p-4 shadow-xl space-y-1 sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              System Management
            </div>

            <button
              onClick={() => {
                setViewingReportId(null);
                setCurrentTab('overview');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'overview' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. Dashboard Overview</span>
            </button>

            <button
              onClick={() => {
                setViewingReportId(null);
                setCurrentTab('users');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'users' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>2. Users &amp; Roles</span>
              </div>
              <span className="text-[10px] bg-gray-900 px-2 py-0.5 rounded font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => {
                setViewingReportId(null);
                setCurrentTab('shops');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'shops' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>3. Shops &amp; Branches</span>
              </div>
              <span className="text-[10px] bg-gray-900 px-2 py-0.5 rounded font-mono">
                {shops.length}
              </span>
            </button>

            <div className="pt-3 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-t border-gray-800/80">
              Stocktaking Audits
            </div>

            <button
              onClick={() => {
                setViewingReportId(null);
                setCurrentTab('all_reports');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'all_reports' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>4. Stocktaking Reports</span>
              </div>
              <span className="text-[10px] bg-gray-900 px-2 py-0.5 rounded font-mono">
                {reports.length}
              </span>
            </button>

            <button
              onClick={handleCreateNewReport}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'create_report' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-red-400 hover:text-white hover:bg-brand-red/20'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-brand-red" />
              <span>5. Create New Report</span>
            </button>

            <button
              onClick={() => {
                setViewingReportId(null);
                setCurrentTab('draft_reports');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'draft_reports' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>6. Draft Reports</span>
              </div>
              <span className="text-[10px] bg-amber-950/60 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                {reports.filter((r) => r.status === 'draft').length}
              </span>
            </button>

            <button
              onClick={() => {
                setViewingReportId(null);
                setCurrentTab('published_reports');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'published_reports' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>7. Published Reports</span>
              </div>
              <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded font-mono">
                {reports.filter((r) => r.status === 'published' || r.status === 'revised').length}
              </span>
            </button>

            <div className="pt-3 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-t border-gray-800/80">
              Audit &amp; System
            </div>

            <button
              onClick={() => {
                setViewingReportId(null);
                setCurrentTab('audit_trail');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'audit_trail' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>8. Audit Trail</span>
            </button>

            <button
              onClick={() => {
                setViewingReportId(null);
                setCurrentTab('settings');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'settings' && !viewingReportId
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>9. Categories &amp; Setup</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 min-w-0">
          {/* VIEW SINGLE REPORT (If active) */}
          {viewingReportId && viewReportData ? (
            <StocktakingReportView
              report={viewReportData.report}
              priorReport={viewReportData.priorReport}
              onBack={() => setViewingReportId(null)}
              onEditDraft={() => handleResumeDraft(viewReportData.report)}
              isAdmin={true}
            />
          ) : currentTab === 'create_report' ? (
            /* TAB 5: CREATE / RESUME REPORT */
            <ReportEditor
              existingReport={editingReport}
              shops={shops}
              categories={categories}
              onSaved={(saved) => {
                showNotification(
                  `Report ${saved.inventoryId} ${saved.status === 'published' ? 'published' : 'saved as draft'}.`
                );
                loadAllData();
                setCurrentTab('all_reports');
              }}
              onCancel={() => setCurrentTab('all_reports')}
            />
          ) : currentTab === 'overview' ? (
            /* TAB 1: DASHBOARD OVERVIEW */
            <div className="space-y-6 animate-fadeIn">
              {/* Stats KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-card p-5 rounded-2xl border border-gray-800 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                      Registered Users
                    </span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {users.length}
                    </div>
                  </div>
                </div>

                <div className="bg-dark-card p-5 rounded-2xl border border-gray-800 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                      Active Shops
                    </span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {shops.filter((s) => s.status === 'active').length}
                    </div>
                  </div>
                </div>

                <div className="bg-dark-card p-5 rounded-2xl border border-gray-800 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                      Published Audits
                    </span>
                    <div className="text-2xl font-black text-emerald-400 mt-0.5">
                      {reports.filter((r) => r.status === 'published' || r.status === 'revised').length}
                    </div>
                  </div>
                </div>

                <div className="bg-dark-card p-5 rounded-2xl border border-amber-900/30 bg-amber-950/10 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
                      Draft In-Progress
                    </span>
                    <div className="text-2xl font-black text-amber-400 mt-0.5">
                      {reports.filter((r) => r.status === 'draft').length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-dark-card p-6 rounded-2xl border border-gray-800 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Quick Administration Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={handleCreateNewReport}
                    className="p-4 rounded-xl bg-gradient-to-r from-red-600 to-brand-red hover:from-red-700 hover:to-red-800 text-white flex items-center gap-3 transition-all transform hover:scale-102 shadow-lg shadow-brand-red/20 text-left"
                  >
                    <PlusCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Create Stocktaking Report</div>
                      <div className="text-[11px] text-red-200">Start new audit session</div>
                    </div>
                  </button>

                  <button
                    onClick={openCreateUserModal}
                    className="p-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white flex items-center gap-3 transition-all text-left"
                  >
                    <UserPlus className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Add Client Account</div>
                      <div className="text-[11px] text-gray-400">Assign shops &amp; credentials</div>
                    </div>
                  </button>

                  <button
                    onClick={openCreateShopModal}
                    className="p-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white flex items-center gap-3 transition-all text-left"
                  >
                    <Store className="w-6 h-6 text-purple-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Register New Shop</div>
                      <div className="text-[11px] text-gray-400">Add branch to portfolio</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Incomplete Drafts to Resume */}
              {reports.filter((r) => r.status === 'draft').length > 0 && (
                <div className="bg-dark-card rounded-2xl border border-amber-900/40 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Incomplete Drafts (Resume Stocktaking)
                    </h3>
                    <span className="text-xs text-amber-400 font-semibold">Admin Only</span>
                  </div>

                  <div className="divide-y divide-gray-800">
                    {reports
                      .filter((r) => r.status === 'draft')
                      .map((draft) => (
                        <div
                          key={draft.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                                {draft.inventoryId}
                              </span>
                              <span className="font-bold text-white text-sm">{draft.shopName}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Period: {draft.reportingMonth} {draft.reportingYear} &bull; Stock Date:{' '}
                              {draft.stocktakingDate} &bull; Last updated:{' '}
                              {new Date(draft.updatedAt).toLocaleTimeString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResumeDraft(draft)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-colors"
                            >
                              Resume Draft
                            </button>
                            <button
                              onClick={() => handlePublishReport(draft.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                            >
                              Publish
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Recent Reports Table */}
              <div className="bg-dark-card rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-red" />
                    Latest Stocktaking Reports Across All Shops
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gray-900 text-gray-400 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
                      <tr>
                        <th className="py-3.5 px-4">Inventory ID</th>
                        <th className="py-3.5 px-4">Shop</th>
                        <th className="py-3.5 px-4">Period</th>
                        <th className="py-3.5 px-4">Stocktaking Date</th>
                        <th className="py-3.5 px-4 text-right">Turnover</th>
                        <th className="py-3.5 px-4 text-right">Shrinkage</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {reports.slice(0, 6).map((r) => (
                        <tr key={r.id} className="hover:bg-gray-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-brand-red">
                            {r.inventoryId}
                          </td>
                          <td className="py-3 px-4 font-sans font-semibold text-white">
                            {r.shopName}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {r.reportingMonth} {r.reportingYear}
                          </td>
                          <td className="py-3 px-4 text-gray-400">{r.stocktakingDate}</td>
                          <td className="py-3 px-4 text-right font-mono text-blue-400">
                            {formatZAR(r.summary.totalTurnover)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-brand-red font-bold">
                            {formatZAR(r.summary.totalShrinkage)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                r.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : r.status === 'draft'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleViewReport(r.id)}
                              className="text-gray-400 hover:text-white"
                              title="View Report"
                            >
                              <Eye className="w-4 h-4 inline" />
                            </button>
                            {r.status === 'draft' ? (
                              <button
                                onClick={() => handleResumeDraft(r)}
                                className="text-amber-400 hover:text-amber-300"
                                title="Edit Draft"
                              >
                                <Edit className="w-4 h-4 inline" />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : currentTab === 'users' ? (
            /* TAB 2: USER MANAGEMENT */
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-brand-red" />
                    User Accounts &amp; Multi-Shop Assignments
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage client and admin users, assign users to single or multiple shops dynamically.
                  </p>
                </div>

                <button
                  onClick={openCreateUserModal}
                  className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create User Account</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-dark-card rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gray-900 text-gray-300 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
                      <tr>
                        <th className="py-3.5 px-5">User</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Account Status</th>
                        <th className="py-3.5 px-5">Assigned Shops (Access)</th>
                        <th className="py-3.5 px-4">Registered Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {users.map((u) => {
                        const assignedShopNames = shops
                          .filter((s) => u.assignedShopIds?.includes(s.id))
                          .map((s) => s.shopCode);

                        return (
                          <tr key={u.id} className="hover:bg-gray-800/40">
                            <td className="py-4 px-5">
                              <div className="font-semibold text-white text-sm">{u.fullName}</div>
                              <div className="text-gray-400 font-mono text-[11px]">{u.email}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === 'ADMIN'
                                    ? 'bg-brand-red/20 text-red-400 border border-brand-red/30'
                                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                                  u.accountStatus === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                                title="Click to toggle status"
                              >
                                {u.accountStatus}
                              </button>
                            </td>
                            <td className="py-4 px-5">
                              {u.role === 'ADMIN' ? (
                                <span className="text-gray-400 text-xs italic">
                                  All Shops (Full Admin Access)
                                </span>
                              ) : assignedShopNames.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {assignedShopNames.map((code) => (
                                    <span
                                      key={code}
                                      className="bg-gray-900 border border-gray-700 text-gray-300 font-mono px-2 py-0.5 rounded text-[11px]"
                                    >
                                      {code}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-amber-400/80 text-xs">
                                  No shops assigned (Restricted)
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString('en-ZA')}
                            </td>
                            <td className="py-4 px-4 text-right space-x-2">
                              <button
                                onClick={() => openEditUserModal(u)}
                                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                                title="Edit user & shops"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {u.id !== user?.id && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-950 text-gray-400 hover:text-brand-red"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : currentTab === 'shops' ? (
            /* TAB 3: SHOP MANAGEMENT */
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-brand-red" />
                    Shop &amp; Branch Directory
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage store branches, locations, and view assigned client access.
                  </p>
                </div>

                <button
                  onClick={openCreateShopModal}
                  className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <Store className="w-4 h-4" />
                  <span>Register New Shop</span>
                </button>
              </div>

              {/* Shop Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((s) => {
                  const assignedUsers = users.filter((u) => u.assignedShopIds?.includes(s.id));
                  const shopReportsList = reports.filter((r) => r.shopId === s.id);

                  return (
                    <div
                      key={s.id}
                      className="bg-dark-card p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-xs font-bold text-brand-red bg-brand-red/10 px-2.5 py-1 rounded border border-brand-red/20">
                            {s.shopCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              s.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-gray-800 text-gray-500'
                            }`}
                          >
                            {s.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white">{s.shopName}</h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                          <span>{s.location}</span>
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Assigned Client Users:</span>
                          <span className="font-bold text-white font-mono">
                            {assignedUsers.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Total Audits:</span>
                          <span className="font-bold text-blue-400 font-mono">
                            {shopReportsList.length}
                          </span>
                        </div>

                        <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-800/60">
                          <button
                            onClick={() => openEditShopModal(s)}
                            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
                          >
                            Edit Shop
                          </button>
                          <button
                            onClick={() => {
                              setReportShopFilter(s.id);
                              setCurrentTab('all_reports');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-brand-red/20 text-red-300 hover:bg-brand-red hover:text-white text-xs font-semibold transition-colors"
                          >
                            View Audits
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentTab === 'all_reports' || currentTab === 'draft_reports' || currentTab === 'published_reports' ? (
            /* TAB 4, 6, 7: STOCKTAKING REPORTS LIST */
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-brand-red" />
                    {currentTab === 'draft_reports'
                      ? 'Draft Stocktaking Reports (In-Progress)'
                      : currentTab === 'published_reports'
                      ? 'Published Stocktaking Reports (Client Accessible)'
                      : 'All Stocktaking Reports'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage audits, save drafts, publish reports atomically, and review variances.
                  </p>
                </div>

                <button
                  onClick={handleCreateNewReport}
                  className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Stocktaking Audit</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-dark-card p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Inventory ID, shop, or month..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <select
                  value={reportShopFilter}
                  onChange={(e) => setReportShopFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="">All Shops</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shopCode} - {s.shopName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reports Table */}
              <div className="bg-dark-card rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gray-900 text-gray-300 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
                      <tr>
                        <th className="py-3.5 px-4">Inventory ID</th>
                        <th className="py-3.5 px-4">Shop</th>
                        <th className="py-3.5 px-4">Reporting Period</th>
                        <th className="py-3.5 px-4">Stock Date</th>
                        <th className="py-3.5 px-4 text-right">Turnover</th>
                        <th className="py-3.5 px-4 text-right">Total Shrinkage</th>
                        <th className="py-3.5 px-4 text-right">Shrinkage %</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredReports.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-800/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-red">
                            {r.inventoryId}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-white">{r.shopName}</td>
                          <td className="py-3.5 px-4 text-gray-300">
                            {r.reportingMonth} {r.reportingYear}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400">{r.stocktakingDate}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-blue-400">
                            {formatZAR(r.summary.totalTurnover)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-brand-red font-bold">
                            {formatZAR(r.summary.totalShrinkage)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-gray-300">
                            {formatPercent(r.summary.shrinkagePercentage)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                r.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : r.status === 'draft'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleViewReport(r.id)}
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                              title="View Full Dashboard"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {r.status === 'draft' && (
                              <>
                                <button
                                  onClick={() => handleResumeDraft(r)}
                                  className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black font-semibold text-xs"
                                  title="Edit & Resume Draft"
                                >
                                  Resume
                                </button>
                                <button
                                  onClick={() => handlePublishReport(r.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white font-semibold text-xs"
                                  title="Publish Report"
                                >
                                  Publish
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteReport(r)}
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-950 text-gray-400 hover:text-brand-red"
                              title="Delete report"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredReports.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-xs">
                    No reports found matching the criteria.
                  </div>
                )}
              </div>
            </div>
          ) : currentTab === 'audit_trail' ? (
            /* TAB 8: AUDIT TRAIL */
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-brand-red" />
                  System Audit Trail &amp; Accountability
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Immutable record of user registrations, shop assignment changes, draft saves, and report publications.
                </p>
              </div>

              <div className="bg-dark-card rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gray-900 text-gray-300 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
                      <tr>
                        <th className="py-3.5 px-4">Timestamp</th>
                        <th className="py-3.5 px-4">User</th>
                        <th className="py-3.5 px-4">Action</th>
                        <th className="py-3.5 px-4">Entity</th>
                        <th className="py-3.5 px-6">Event Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 font-mono">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-800/30">
                          <td className="py-3 px-4 text-gray-400">
                            {new Date(log.timestamp).toLocaleString('en-ZA')}
                          </td>
                          <td className="py-3 px-4 font-sans text-white font-semibold">
                            {log.userEmail}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-gray-900 border border-gray-700 px-2 py-0.5 rounded text-[11px] font-bold text-brand-red">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {log.entityType} ({log.entityId})
                          </td>
                          <td className="py-3 px-6 font-sans text-gray-300 max-w-md truncate">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 9: SETTINGS & CATEGORIES */
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings className="w-6 h-6 text-brand-red" />
                    Inventory Categories &amp; System Configuration
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage standard 24 inventory categories and bakery stock lines.
                  </p>
                </div>

                <button
                  onClick={() => setShowNewCategoryModal(true)}
                  className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Categories list */}
              <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Configured Stocktaking Categories ({categories.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-gray-900/80 rounded-xl border border-gray-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{c.name}</div>
                        <span
                          className={`text-[10px] uppercase font-semibold ${
                            c.type === 'bakery' ? 'text-amber-400' : 'text-gray-400'
                          }`}
                        >
                          {c.type} Section
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* USER MODAL (Create / Edit) */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-dark-card w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingUser ? 'Edit User & Shop Assignments' : 'Create New User Account'}
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Only authenticated administrators can provision accounts.
            </p>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  placeholder="e.g. Sipho Khumalo"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="user@client.co.za"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, role: e.target.value as 'ADMIN' | 'CLIENT' })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="CLIENT">CLIENT (Restricted Shop Access)</option>
                    <option value="ADMIN">ADMIN (Full System Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Status *</label>
                  <select
                    value={userFormData.accountStatus}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        accountStatus: e.target.value as 'active' | 'inactive',
                      })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive / Deactivated</option>
                  </select>
                </div>
              </div>

              {/* Shop Assignment (Many-to-Many) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Assign to Shops (Many-to-Many Access):
                </label>
                <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2 max-h-40 overflow-y-auto">
                  {shops.map((s) => {
                    const isChecked = userFormData.assignedShopIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2.5 text-xs text-gray-300 hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...userFormData.assignedShopIds, s.id]
                              : userFormData.assignedShopIds.filter((id) => id !== s.id);
                            setUserFormData({ ...userFormData, assignedShopIds: next });
                          }}
                          className="rounded text-brand-red focus:ring-brand-red bg-gray-800 border-gray-700"
                        />
                        <span className="font-mono font-bold text-brand-red">{s.shopCode}</span>
                        <span>{s.shopName}</span>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Clients only see shops checked here. Changes apply immediately.
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-red-700 text-white text-xs font-bold shadow-md"
                >
                  {editingUser ? 'Save User Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHOP MODAL (Create / Edit) */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-dark-card w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowShopModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingShop ? 'Edit Shop Information' : 'Register New Shop'}
            </h3>

            <form onSubmit={handleSaveShop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  value={shopFormData.shopName}
                  onChange={(e) => setShopFormData({ ...shopFormData, shopName: e.target.value })}
                  placeholder="e.g. Shop 004 - Centurion Express"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Shop Code *</label>
                <input
                  type="text"
                  required
                  value={shopFormData.shopCode}
                  onChange={(e) => setShopFormData({ ...shopFormData, shopCode: e.target.value })}
                  placeholder="SHOP-004"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Physical Location *</label>
                <input
                  type="text"
                  required
                  value={shopFormData.location}
                  onChange={(e) => setShopFormData({ ...shopFormData, location: e.target.value })}
                  placeholder="Street address, suburb, city"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Status *</label>
                <select
                  value={shopFormData.status}
                  onChange={(e) =>
                    setShopFormData({ ...shopFormData, status: e.target.value as 'active' | 'inactive' })
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowShopModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-red-700 text-white text-xs font-bold shadow-md"
                >
                  {editingShop ? 'Save Shop' : 'Register Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CATEGORY MODAL */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-dark-card w-full max-w-sm rounded-2xl border border-gray-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowNewCategoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Add Inventory Category</h3>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Coffee & Hot Drinks"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category Section *</label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value as 'main' | 'bakery')}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="main">Main Inventory Section</option>
                  <option value="bakery">Bakery / Fast Food Section</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-red hover:bg-red-700 text-white text-xs font-bold"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
