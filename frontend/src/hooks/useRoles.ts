import { useAuth } from '@/context/AuthContext';

/**
 * Centralized role permission helpers for AssetFlow.
 * Use this hook instead of scattering `user?.role === 'X'` checks everywhere.
 */
export function useRoles() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    role,
    userId: user?.id,

    /** Full system access */
    isAdmin: role === 'ADMIN',

    /** Can register assets, approve maintenance, allocate, handle returns */
    isAssetManager: role === 'ASSET_MANAGER',

    /** Can approve transfers/returns within their department, book on behalf of dept */
    isDeptHead: role === 'DEPARTMENT_HEAD',

    /** Standard user — can book, raise maintenance, initiate transfer/return requests */
    isEmployee: role === 'EMPLOYEE',

    // ─── Composite permission flags ───────────────────────────────────────

    /** Admins and Asset Managers — can allocate, approve maintenance, manage assets */
    canManageAssets: role === 'ADMIN' || role === 'ASSET_MANAGER',

    /** Can approve/reject transfers and mark returns */
    canApproveTransfers: role === 'ADMIN' || role === 'ASSET_MANAGER' || role === 'DEPARTMENT_HEAD',

    /** Can approve/reject maintenance requests and update ticket status */
    canManageMaintenance: role === 'ADMIN' || role === 'ASSET_MANAGER',

    /** Can create and close audit cycles */
    canManageAudits: role === 'ADMIN' || role === 'ASSET_MANAGER',

    /** Admin only — close audit cycles, manage org setup, promote users */
    canAdminOrg: role === 'ADMIN',

    /** View org-wide analytics */
    canViewReports: role === 'ADMIN' || role === 'ASSET_MANAGER',

    /** Can book shared resources (all roles) */
    canBook: true,

    /** Can raise a maintenance request (all roles) */
    canRaiseMaintenance: true,

    /** Can initiate a transfer request (all roles) */
    canInitiateTransfer: true,
  };
}
