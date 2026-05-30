import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { deployNginxConfig } from '@/lib/ssh';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { hostId } = body;
        
        const db = getDb();
        const [rows]: any = await db.query('SELECT * FROM proxy_hosts WHERE id = ?', [hostId]);
        
        if (rows.length === 0) {
            return NextResponse.json({ error: 'Host not found' }, { status: 404 });
        }
        
        const host = rows[0];
        
        // Generate simple Nginx Config template
        const configTemplate = `
server {
    listen 80;
    server_name ${host.domain_names};

    location / {
        proxy_pass ${host.forward_scheme}://${host.forward_host}:${host.forward_port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;
        // Deploy via SSH
        const deployResult = await deployNginxConfig(`proxy_host_${hostId}`, configTemplate);
        
        // Log auditing...
        
        return NextResponse.json({ success: true, deployment: deployResult });
        
    } catch (error: any) {
         console.error('Deployment error', error);
         return NextResponse.json({ error: 'Deployment Failed', details: error.message }, { status: 500 });
    }
}
