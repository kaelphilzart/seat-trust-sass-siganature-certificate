import { endpoints } from "@/utils/helper-server";

export const SWR_KEYS = {

    //Users
    users: () => endpoints.users,
    // organization
    organizations: () => endpoints.Organization.base,
    organizationDetail: (id: string) =>
        `${endpoints.Organization.base}/${id}`,

    // subscription
    subscriptions: () => endpoints.subscription.base,
    subscriptionDetail: (id: string) =>
        `${endpoints.subscription.base}/${id}`,

    /// organization user
    organizationUser: (id?: string) =>
        id ? `${endpoints.Organization.user}/${id}` : endpoints.Organization.user,
    organizationUsers: () => endpoints.Organization.user,
};