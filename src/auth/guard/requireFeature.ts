// lib/auth/requireFeature.ts

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

interface Token {
    id?: string;
    role?: string;
    organization_id?: string | null;
    features?: Record<string, string>;
}

export async function requireFeature(featureKey: string) {
    const cookieStore = await cookies();
    const token =
        cookieStore.get("next-auth.session-token")?.value ||
        cookieStore.get("__Secure-next-auth.session-token")?.value;
    if (!token) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
        );
    }
    try {
        const decoded = jwt.verify(
            token,
            process.env.NEXTAUTH_SECRET!
        ) as Token;
        const hasFeature = decoded.features?.[featureKey];
        if (!hasFeature) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }
        return null;
    } catch {

        return NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
        );

    }
}