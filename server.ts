import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';
import { AuthUser, UserRole } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kgothatso-shrinkage-control-secret-key-2026';

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Helper to normalize route params
const getParam = (param: unknown): string => {
  if (Array.isArray(param)) return String(param[0]);
  return String(param || '');
};

// Extend express Request
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = tokenFromHeader || req.cookies?.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    const user = db.getUserById(decoded.id);

    if (user && user.accountStatus === 'active') {
      req.user = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        assignedShopIds: user.assignedShopIds,
      };
    }
  } catch {
    // Invalid token, ignore
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access forbidden: Administrative privileges required.' });
  }
  next();
}

app.use(authenticateToken);

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact an administrator.' });
    }

    if (!user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    db.addAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      entityType: 'AUTH',
      entityId: user.id,
      details: `${user.role} user ${user.fullName} logged in successfully.`,
    });

    const safeUser: AuthUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      assignedShopIds: user.assignedShopIds,
    };

    return res.json({ token, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Current User Me
app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  const fresh = db.getUserById(req.user.id);
  if (!fresh || fresh.accountStatus !== 'active') {
    return res.status(401).json({ user: null });
  }
  return res.json({
    user: {
      id: fresh.id,
      fullName: fresh.fullName,
      email: fresh.email,
      role: fresh.role,
      assignedShopIds: fresh.assignedShopIds,
    },
  });
});

// Logout
app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'LOGOUT',
      entityType: 'AUTH',
      entityId: req.user.id,
      details: `User ${req.user.fullName} logged out.`,
    });
  }
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// SHOPS ENDPOINTS
// ==========================================

// GET /api/shops - Admin gets all, client gets only assigned
app.get('/api/shops', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const allShops = db.getShops();
    if (req.user!.role === 'ADMIN') {
      return res.json(allShops);
    }
    // Client role: filter by assignedShopIds and active status
    const clientShops = allShops.filter(
      (s) => req.user!.assignedShopIds.includes(s.id) && s.status === 'active'
    );
    return res.json(clientShops);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/shops/:id - Verify access
app.get('/api/shops/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const shopId = getParam(req.params.id);
    const shop = db.getShopById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found.' });
    }
    if (req.user!.role !== 'ADMIN' && !req.user!.assignedShopIds.includes(shop.id)) {
      return res.status(403).json({ error: 'Access denied: You are not assigned to this shop.' });
    }
    return res.json(shop);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/shops - Admin only
app.post('/api/shops', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopName, shopCode, location } = req.body;
    if (!shopName || !shopCode || !location) {
      return res.status(400).json({ error: 'shopName, shopCode, and location are required.' });
    }
    const newShop = db.createShop({ shopName, shopCode, location });

    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'CREATE_SHOP',
      entityType: 'SHOP',
      entityId: newShop.id,
      details: `Created shop ${newShop.shopName} (${newShop.shopCode}).`,
    });

    return res.status(201).json(newShop);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/shops/:id - Admin only
app.put('/api/shops/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const shopId = getParam(req.params.id);
    const updated = db.updateShop(shopId, req.body);
    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'UPDATE_SHOP',
      entityType: 'SHOP',
      entityId: updated.id,
      details: `Updated shop ${updated.shopName} (${updated.shopCode}).`,
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// USERS ENDPOINTS (Admin Only)
// ==========================================

// GET /api/users
app.get('/api/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.getUsers().map((u) => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users
app.post('/api/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, email, password, role, assignedShopIds } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'fullName, email, password, and role are required.' });
    }
    const newUser = db.createUser({
      fullName,
      email,
      password,
      role,
      assignedShopIds: assignedShopIds || [],
    });

    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'CREATE_USER',
      entityType: 'USER',
      entityId: newUser.id,
      details: `Created ${newUser.role} user ${newUser.fullName} (${newUser.email}) with ${newUser.assignedShopIds.length} shop assignments.`,
    });

    const { passwordHash, ...safe } = newUser;
    return res.status(201).json(safe);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/users/:id
app.put('/api/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getParam(req.params.id);
    const updated = db.updateUser(userId, req.body);
    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'UPDATE_USER',
      entityType: 'USER',
      entityId: updated.id,
      details: `Updated user ${updated.fullName} (${updated.email}). Status: ${updated.accountStatus}, Assigned shops: [${updated.assignedShopIds.join(', ')}].`,
    });

    const { passwordHash, ...safe } = updated;
    return res.json(safe);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getParam(req.params.id);
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    db.deleteUser(userId);
    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'DELETE_USER',
      entityType: 'USER',
      entityId: userId,
      details: `Deleted user ${user.fullName} (${user.email}).`,
    });
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================

app.get('/api/categories', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    return res.json(db.getCategories());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Category name and type are required.' });
    }
    const newCat = db.createCategory({ name, type });
    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'CREATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: newCat.id,
      details: `Added new category: ${newCat.name} (${newCat.type}).`,
    });
    return res.status(201).json(newCat);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// STOCKTAKING REPORTS ENDPOINTS
// ==========================================

// GET /api/reports - Filter by shop and status with strict role isolation
app.get('/api/reports', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const shopId = req.query.shopId as string | undefined;
    const status = req.query.status as any;

    if (req.user!.role === 'ADMIN') {
      const reports = db.getReports({
        shopId,
        status,
      });
      return res.json(reports);
    }

    // CLIENT role:
    // If shopId is requested, verify the client is assigned to that shop!
    if (shopId && !req.user!.assignedShopIds.includes(shopId)) {
      return res.status(403).json({ error: 'Access denied: You are not assigned to this shop.' });
    }

    // Never return drafts to clients!
    const clientReports = db.getReports({
      shopId,
      allowedShopIds: req.user!.assignedShopIds,
      onlyPublished: true,
    });

    return res.json(clientReports);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:id - Single report details
app.get('/api/reports/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = getParam(req.params.id);
    const report = db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Stocktaking report not found.' });
    }

    // Client access verification:
    if (req.user!.role !== 'ADMIN') {
      if (report.status === 'draft') {
        return res.status(403).json({ error: 'Access denied: Draft reports are confidential.' });
      }
      if (!req.user!.assignedShopIds.includes(report.shopId)) {
        return res.status(403).json({ error: 'Access denied: You are not assigned to this shop.' });
      }
    }

    // Fetch prior report for comparison if available
    const shopReports = db
      .getReports({ shopId: report.shopId, onlyPublished: true })
      .filter((r) => r.id !== report.id && new Date(r.stocktakingDate) < new Date(report.stocktakingDate));
    const priorReport = shopReports[0] || null;

    return res.json({
      report,
      priorReport,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/reports - Admin only (Create or save draft/publish)
app.post('/api/reports', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      shopId,
      reportingMonth,
      reportingYear,
      stocktakingDate,
      status,
      items,
      monthlyShrinkage,
      revisionNote,
    } = req.body;

    if (!shopId || !reportingMonth || !reportingYear || !stocktakingDate || !items) {
      return res.status(400).json({
        error: 'shopId, reportingMonth, reportingYear, stocktakingDate, and items are required.',
      });
    }

    const saved = db.saveReport({
      shopId,
      reportingMonth,
      reportingYear: parseInt(reportingYear, 10),
      stocktakingDate,
      status: status || 'draft',
      createdBy: req.user!.id,
      createdByName: req.user!.fullName,
      revisionNote,
      items,
      monthlyShrinkage,
    });

    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: saved.status === 'published' ? 'PUBLISH_REPORT' : 'SAVE_DRAFT_REPORT',
      entityType: 'REPORT',
      entityId: saved.inventoryId,
      details: `${saved.status === 'published' ? 'Published' : 'Saved draft'} report ${saved.inventoryId} for ${saved.shopName} (${saved.reportingMonth} ${saved.reportingYear}).`,
    });

    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/reports/:id - Admin only (Update draft or revise report)
app.put('/api/reports/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = getParam(req.params.id);
    const existing = db.getReportById(reportId);
    if (!existing) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const updated = db.saveReport({
      id: reportId,
      shopId: req.body.shopId || existing.shopId,
      reportingMonth: req.body.reportingMonth || existing.reportingMonth,
      reportingYear: req.body.reportingYear || existing.reportingYear,
      stocktakingDate: req.body.stocktakingDate || existing.stocktakingDate,
      status: req.body.status || existing.status,
      createdBy: existing.createdBy,
      createdByName: existing.createdByName,
      revisionNote: req.body.revisionNote,
      items: req.body.items || existing.items,
      monthlyShrinkage: req.body.monthlyShrinkage || existing.monthlyShrinkage,
    });

    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: updated.status === 'published' ? 'UPDATE_PUBLISHED_REPORT' : 'UPDATE_DRAFT_REPORT',
      entityType: 'REPORT',
      entityId: updated.inventoryId,
      details: `Updated report ${updated.inventoryId} for ${updated.shopName}. Status: ${updated.status}.`,
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/reports/:id/publish - Admin only (Atomic publish transaction)
app.post('/api/reports/:id/publish', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = getParam(req.params.id);
    const published = db.publishReport(reportId, req.user!.fullName);
    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'PUBLISH_REPORT',
      entityType: 'REPORT',
      entityId: published.inventoryId,
      details: `Published stocktaking report ${published.inventoryId} for ${published.shopName} (${published.reportingMonth} ${published.reportingYear}).`,
    });
    return res.json(published);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/reports/:id - Admin only
app.delete('/api/reports/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = getParam(req.params.id);
    const report = db.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    db.deleteReport(reportId);
    db.addAuditLog({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'DELETE_REPORT',
      entityType: 'REPORT',
      entityId: report.inventoryId,
      details: `Deleted report ${report.inventoryId} from ${report.shopName}.`,
    });
    return res.json({ success: true, message: 'Report deleted.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD & AUDIT ENDPOINTS
// ==========================================

app.get('/api/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.getUsers();
    const shops = db.getShops();
    const allReports = db.getReports();
    const publishedReports = allReports.filter((r) => r.status === 'published' || r.status === 'revised');
    const draftReports = allReports.filter((r) => r.status === 'draft');

    const recentReports = allReports.slice(0, 5);
    const recentDrafts = draftReports.slice(0, 5);

    return res.json({
      totalUsers: users.length,
      totalActiveShops: shops.filter((s) => s.status === 'active').length,
      totalPublishedReports: publishedReports.length,
      totalDraftReports: draftReports.length,
      recentReports,
      recentDrafts,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/audit-logs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    return res.json(db.getAuditLogs());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kgothatso Shrinkage Control server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
