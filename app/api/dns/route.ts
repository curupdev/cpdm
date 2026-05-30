import { NextResponse } from 'next/server';

// Simplified Cloudflare DNS provisioning
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { zone_id, name, content } = body;
        
        const token = process.env.CLOUDFLARE_API_TOKEN;
        if (!token) {
             return NextResponse.json({ error: 'Cloudflare token not configured' }, { status: 400 });
        }
        
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`, {
           method: 'POST',
           headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               type: 'A',
               name: name,
               content: content || process.env.VIP_ADDRESS || '10.90.135.10',
               ttl: 120,
               proxied: false
           })
        });
        
        const data = await response.json();
        return NextResponse.json(data);
        
    } catch(err: any) {
        return NextResponse.json({ error: 'DNS creation failed', details: err.message }, {status: 500});
    }
}
