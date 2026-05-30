import { Client } from 'ssh2';
import fs from 'fs';

interface SshOptions {
  host: string;
  username: string;
  privateKeyPath?: string;
  password?: string;
}

export async function executeRemoteCommand(options: SshOptions, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                let output = '';
                stream.on('close', (code: any, signal: any) => {
                    conn.end();
                    resolve(output);
                }).on('data', (data: any) => {
                    output += data;
                }).stderr.on('data', (data: any) => {
                    console.error('STDERR: ' + data);
                });
            });
        }).on('error', (err) => {
             reject(err);
        });

        const connectConfig: any = {
            host: options.host,
            port: 22,
            username: options.username,
        };

        if (options.privateKeyPath) {
             try {
                 connectConfig.privateKey = fs.readFileSync(options.privateKeyPath);
             } catch (e) {
                 return reject(`Could not read private key at ${options.privateKeyPath}`);
             }
        } else if (options.password) {
            connectConfig.password = options.password;
        } else {
            return reject('No password or private key provided for SSH');
        }

        conn.connect(connectConfig);
    });
}

export async function deployNginxConfig(configName: string, configContent: string) {
    const node1 = process.env.PROXY_NODE_01 || '10.90.135.11';
    const node2 = process.env.PROXY_NODE_02 || '10.90.135.12';
    const user = process.env.SSH_USER || 'root';
    const keyPath = process.env.SSH_KEY_PATH;
    const password = process.env.SSH_PASSWORD;

    const tmpFilePath = `/tmp/${configName}.conf`;
    const destPath = `/etc/nginx/conf.d/${configName}.conf`;
    
    // Command to write content securely to a file and move it, then reload
    // In a real environment we'd use SFTP, but doing inline bash for simplicity of agentless deployment
    const writeCmd = `cat << 'EOF' > ${tmpFilePath}\n${configContent}\nEOF\nmv ${tmpFilePath} ${destPath}`;
    const reloadCmd = `nginx -t && nginx -s reload`;

    const fullCmd = `${writeCmd} && ${reloadCmd}`;

    const sshOptionsNode1 = { host: node1, username: user, privateKeyPath: keyPath, password };
    const sshOptionsNode2 = { host: node2, username: user, privateKeyPath: keyPath, password };

    try {
        console.log(`Deploying to Node 1 (${node1})...`);
        const out1 = await executeRemoteCommand(sshOptionsNode1, fullCmd);
        console.log('Node 1 Output:', out1);
        
        console.log(`Deploying to Node 2 (${node2})...`);
        const out2 = await executeRemoteCommand(sshOptionsNode2, fullCmd);
        console.log('Node 2 Output:', out2);
        
        return { success: true, node1: out1, node2: out2 };
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
}
