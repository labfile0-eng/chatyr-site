#!/usr/bin/env bash
# Chatyr server bootstrap. Usage: bash bootstrap.sh <seed>
set -euo pipefail
SEED="${1:-}"
[ -n "$SEED" ] || { echo "seed required"; exit 1; }
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates python3 ufw >/dev/null
if ! command -v docker >/dev/null; then curl -fsSL https://get.docker.com | sh >/dev/null; fi
mkdir -p /opt/ops /srv/chatyr
TOKEN=$(printf '%s' "${SEED}chatyr-ops" | sha256sum | cut -c1-48)
printf '%s' "$TOKEN" > /opt/ops/token; chmod 600 /opt/ops/token
cat > /opt/ops/ops.py <<'PY'
import http.server, json, subprocess, os, base64, hmac
TOKEN=open('/opt/ops/token').read().strip()
class H(http.server.BaseHTTPRequestHandler):
    def _ok(self,code,obj):
        b=json.dumps(obj).encode(); self.send_response(code); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
    def log_message(self,*a): pass
    def do_GET(self):
        self._ok(200,{'ok':True}) if self.path=='/__ops/ping' else self._ok(404,{})
    def do_POST(self):
        t=self.headers.get('X-Token','')
        if not hmac.compare_digest(t,TOKEN): return self._ok(403,{'error':'forbidden'})
        n=int(self.headers.get('Content-Length','0')); body=self.rfile.read(n)
        if self.path=='/__ops/run':
            d=json.loads(body); cmd=d['cmd']; to=int(d.get('timeout',900))
            try:
                p=subprocess.run(['bash','-lc',cmd],capture_output=True,text=True,timeout=to,cwd=d.get('cwd','/srv/chatyr'))
                self._ok(200,{'rc':p.returncode,'out':p.stdout[-200000:],'err':p.stderr[-50000:]})
            except subprocess.TimeoutExpired: self._ok(200,{'rc':124,'out':'','err':'timeout'})
        elif self.path=='/__ops/put':
            d=json.loads(body); path=d['path']; os.makedirs(os.path.dirname(path),exist_ok=True)
            with open(path,'wb') as f: f.write(base64.b64decode(d['b64']))
            if d.get('mode'): os.chmod(path,int(d['mode'],8))
            self._ok(200,{'ok':True,'bytes':os.path.getsize(path)})
        elif self.path=='/__ops/get':
            d=json.loads(body)
            with open(d['path'],'rb') as f: self._ok(200,{'b64':base64.b64encode(f.read()).decode()})
        else: self._ok(404,{})
http.server.ThreadingHTTPServer(('0.0.0.0',8088),H).serve_forever()
PY
cat > /etc/systemd/system/ops.service <<'UNIT'
[Unit]
Description=Chatyr ops agent
After=network.target
[Service]
ExecStart=/usr/bin/python3 /opt/ops/ops.py
Restart=always
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload; systemctl enable --now ops.service
echo "OPS READY"
