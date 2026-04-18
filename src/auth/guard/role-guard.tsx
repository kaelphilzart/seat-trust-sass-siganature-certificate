'use client';
import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { paths } from "@/routes/paths";

type Props = { allowed: string[]; children: ReactNode; };

export default function RoleGuard({ allowed, children }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    const check = useCallback(() => {
        const role = session?.user?.role;
        if (status === "unauthenticated") router.replace(`${paths.universal.login}`);
        else if (role && role !== "SUPERADMIN" && !allowed.includes(role)) router.replace("/unauthorized");
        else setChecked(true);
    }, [status, session, allowed, router]);

    useEffect(() => { check(); }, [status, session]);

    if (!checked) return null;
    return <>{children}</>;
}