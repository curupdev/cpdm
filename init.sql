CREATE DATABASE IF NOT EXISTS cpdm;
USE cpdm;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor') DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cloudflare_token VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proxy_hosts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_names VARCHAR(255) NOT NULL,
    forward_scheme ENUM('http', 'https') DEFAULT 'http',
    forward_host VARCHAR(255) NOT NULL,
    forward_port INT NOT NULL,
    block_exploits BOOLEAN DEFAULT 1,
    caching_enabled BOOLEAN DEFAULT 0,
    allow_websocket_upgrade BOOLEAN DEFAULT 1,
    ssl_provider ENUM('none', 'letsencrypt', 'custom') DEFAULT 'none',
    ssl_key_type ENUM('ecdsa', 'rsa') DEFAULT 'ecdsa',
    auto_dns BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS streams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incoming_port INT NOT NULL,
    forward_ip VARCHAR(255) NOT NULL,
    forward_port INT NOT NULL,
    protocol ENUM('tcp', 'udp') DEFAULT 'tcp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin (password: admin123 - ensure to change in prod)
INSERT IGNORE INTO users (username, password_hash, role) VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'admin');
