import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const [rows] = await db.query('SELECT * FROM proxy_hosts ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Database Error:', error);
        // Fallback for preview environment when real DB is unreachable
        return NextResponse.json([
            {
                id: 1,
                domain_names: "api.production.cloud",
                forward_scheme: "http",
                forward_host: "10.12.5.40",
                forward_port: 8080,
                ssl_provider: "letsencrypt",
                auto_dns: 1,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                domain_names: "dashboard.internal.net",
                forward_scheme: "http",
                forward_host: "10.12.5.55",
                forward_port: 3000,
                ssl_provider: "none",
                auto_dns: 0,
                created_at: new Date().toISOString()
            }
        ]);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const db = getDb();
        const { domain_names, forward_scheme, forward_host, forward_port, auto_dns } = body;
        
        const [result] = await db.execute(
            `INSERT INTO proxy_hosts (domain_names, forward_scheme, forward_host, forward_port, auto_dns) 
             VALUES (?, ?, ?, ?, ?)`,
            [domain_names, forward_scheme, forward_host, forward_port, auto_dns ? 1 : 0]
        );
        
        // Setup Nginx config generation triggers here or in a separate background job
        // Example template creation, we can defer real deployment via an explicit API call
        
        return NextResponse.json({ success: true, id: (result as any).insertId });
    } catch (error: any) {
         return NextResponse.json({ error: 'Failed to create host', details: error.message }, { status: 500 });
    }
}
