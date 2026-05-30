import mysql from 'mysql2/promise';

// Lazy initialized connection pool
let pool: mysql.Pool | null = null;

export function getDb() {
  if (!pool) {
    if (!process.env.DB_HOST) {
       console.warn('DB_HOST environment variable not set, falling back to mock DB');
    }
    
    pool = mysql.createPool({
      host: process.env.DB_HOST || '10.90.135.80',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'proxy_manager',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000, // Fail fast if unreachable
    });
  }
  return pool;
}
