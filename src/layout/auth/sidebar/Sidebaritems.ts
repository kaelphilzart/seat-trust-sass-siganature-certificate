import { uniqueId } from 'lodash'
import { paths } from '@/routes/paths'

/* ================= ROLE ================= */
export type Role = 'ADMIN' | 'REPRESENTATIVE' | 'SUPERADMIN';

export function normalizeRole(role?: string): Role | undefined {
  if (!role) return;

  const r = role.toUpperCase();

  if (r.includes('SUPER')) return 'SUPERADMIN';
  if (r.includes('ADMIN')) return 'ADMIN';
  if (r.includes('REP')) return 'REPRESENTATIVE';

  return undefined;
}

/* ================= TYPES ================= */
export interface ChildItem {
  id?: number | string
  name?: string
  icon?: any
  children?: ChildItem[]
  url?: any
  disabled?: boolean
  roles?: Role[]
}

export interface MenuItem {
  heading?: string
  children?: ChildItem[]
}

/* ================= FILTER ROLE ================= */
export function filterByRole(items: ChildItem[], role?: Role): ChildItem[] {
  if (!role) return [];

  return items
    .filter((item) => {
      if (item.roles && !item.roles.includes(role)) return false;
      return true;
    })
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterByRole(item.children, role);

        if (filteredChildren.length === 0) return null;

        return {
          ...item,
          children: filteredChildren,
        };
      }

      return item;
    })
    .filter(Boolean) as ChildItem[];
}

/* ================= SIDEBAR ================= */
const SidebarContent: MenuItem[] = [
  {
    heading: 'Dashboards',
    children: [
      {
        name: "Dashboard",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "/",
        roles: ['ADMIN', 'REPRESENTATIVE', 'SUPERADMIN'],
      },
      {
        name: "Users",
        icon: "solar:users-group-two-rounded-linear",
        id: uniqueId(),
        url: `${paths.user}`,
        roles: ['SUPERADMIN'],
      },
      {
        name: 'Subscriber',
        id: uniqueId(),
        icon: 'solar:home-angle-linear',
        roles: ['ADMIN', 'SUPERADMIN'],
        children: [
          {
            name: "Organization",
            id: uniqueId(),
            url: `${paths.organization.base}`,
            roles: ['ADMIN', 'SUPERADMIN'],
          },
          {
            name: "Organization User",
            id: uniqueId(),
            url: `${paths.organization.user}`,
            roles: ['SUPERADMIN'],
          },
          {
            name: "Asset",
            id: uniqueId(),
            url: `${paths.organization.asset}`,
            roles: ['ADMIN', 'SUPERADMIN'],
          },
                    {
            name: "Representative",
            id: uniqueId(),
            url: `${paths.representative}`,
            roles: ['ADMIN', 'SUPERADMIN'],
          },
        ],
      },
      {
        name: "Subscription",
        id: uniqueId(),
        icon: "solar:cart-3-line-duotone",
        roles: ['SUPERADMIN'],
        children: [
          {
            id: uniqueId(),
            name: "Plan",
            url: `${paths.subscription.plan.root}`,
            roles: ['SUPERADMIN'],
          },
          {
            id: uniqueId(),
            name: "Feature",
            url: `${paths.subscription.feature}`,
            roles: ['SUPERADMIN'],
          },
          {
            id: uniqueId(),
            name: "Subscriptions",
            url: `${paths.subscription.base}`,
            roles: ['SUPERADMIN'],
          },
        ],
      },
      {
        name: "Template",
        id: uniqueId(),
        icon: "solar:widget-add-line-duotone",
        roles: ['ADMIN', 'SUPERADMIN'],
        children: [
          {
            id: uniqueId(),
            name: "Element Type",
            url: `${paths.elementType.base}`,
            roles: ['SUPERADMIN'],
          },
          {
            id: uniqueId(),
            name: "Templates",
            url: `${paths.template.base}`,
            roles: ['ADMIN', 'SUPERADMIN'],
          },
        ],
      },
      {
        name: "Batch",
        id: uniqueId(),
        icon: "solar:shield-user-outline",
        roles: ['ADMIN', 'SUPERADMIN'],
        children: [
          {
            id: uniqueId(),
            name: "Participant",
            url: "#!",
            roles: ['ADMIN', 'SUPERADMIN'],
          },
          {
            id: uniqueId(),
            name: "Batches",
            url: `${paths.batch.base}`,
            roles: ['ADMIN','SUPERADMIN'],
          },
        ],
      },
    ],
  },
]

export default SidebarContent