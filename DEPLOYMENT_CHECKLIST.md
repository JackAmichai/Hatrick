# 🚀 Deployment Checklist

## Pre-Deployment Validation

### ✅ Code Quality
- [x] All TypeScript files compile without errors
- [x] No ESLint warnings in components
- [x] All imports properly resolved
- [x] Python backend modules load without errors
- [x] Git history clean with meaningful commits

### ✅ Documentation
- [x] README.md updated with all features
- [x] INTEGRATION_GUIDE.md created
- [x] FEATURE_SHOWCASE.md created
- [x] API_TESTING.md created
- [x] IMPLEMENTATION_COMPLETE.md created

### ✅ Dependencies
- [x] package.json includes all frontend deps
- [x] requirements.txt includes all backend deps
- [x] No missing or conflicting versions

---

## Backend Deployment

### Option 1: Render.com (Recommended)

1. **Create account**: https://render.com
2. **Connect GitHub repository**
3. **Create new Web Service**:
   - **Name**: hatrick-backend
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variable**:
   - Key: `GROQ_API_KEY`
   - Value: `[your_groq_api_key]`
5. **Deploy**: Click "Create Web Service"

**Expected URL**: `https://hatrick-backend.onrender.com`

---

### Option 2: Railway.app

1. **Create account**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select repository**: HatTrick
4. **Configure**:
   - **Root Directory**: backend
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   - `GROQ_API_KEY=[your_key]`
6. **Deploy**

**Expected URL**: `https://hatrick-backend.railway.app`

---

### Option 3: AWS EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv nginx

# Clone repository
git clone https://github.com/yourusername/hatrick.git
cd hatrick/backend

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variable
export GROQ_API_KEY="your_key_here"
echo "export GROQ_API_KEY='your_key_here'" >> ~/.bashrc

# Run with systemd
sudo nano /etc/systemd/system/hatrick.service
```

**systemd service file**:
```ini
[Unit]
Description=HatTrick Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/hatrick/backend
Environment="GROQ_API_KEY=your_key_here"
ExecStart=/home/ubuntu/hatrick/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start hatrick
sudo systemctl enable hatrick
sudo systemctl status hatrick

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/hatrick
```

**Nginx config**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hatrick /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
cd "c:\Users\yamichai\OneDrive - Deloitte (O365D)\Documents\General\temp"
vercel
```

3. **Configure**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Update API URL**:
   - In `EnterprisePortfolio.tsx`, update:
   ```typescript
   const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000';
   
   // Change all fetch calls to use:
   fetch(`${API_BASE_URL}/api/apt-profiles`)
   ```

5. **Set Environment Variable** in Vercel dashboard:
   - Key: `VITE_API_URL`
   - Value: `https://hatrick-backend.onrender.com`

**Expected URL**: `https://hatrick.vercel.app`

---

### Option 2: Netlify

1. **Create account**: https://netlify.com
2. **New site from Git** → Connect GitHub
3. **Configure**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. **Environment Variables**:
   - `VITE_API_URL=https://hatrick-backend.onrender.com`
5. **Deploy**

**Expected URL**: `https://hatrick.netlify.app`

---

### Option 3: GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json:
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Update vite.config.ts:
export default defineConfig({
  base: '/hatrick/',
  // ... rest of config
})

# Deploy
npm run deploy
```

**Expected URL**: `https://yourusername.github.io/hatrick/`

---

## Post-Deployment Testing

### Backend Health Check
```bash
curl https://hatrick-backend.onrender.com/
# Expected: {"status":"ok","service":"Hatrick Backend"}
```

### Frontend Access
```bash
curl https://hatrick.vercel.app/
# Expected: HTML page with HatTrick
```

### WebSocket Connection
```javascript
// Test in browser console
const ws = new WebSocket('wss://hatrick-backend.onrender.com/ws/game');
ws.onopen = () => console.log('Connected!');
```

### API Endpoints
```bash
# Test APT profiles
curl https://hatrick-backend.onrender.com/api/apt-profiles

# Test report generation
curl -X POST https://hatrick-backend.onrender.com/api/reports/pentest \
  -H "Content-Type: application/json" \
  -d '{"client_name":"Test","engagement_type":"Black Box","test_dates":"2025-01-01","mission_results":[]}'
```

---

## Environment Variables

### Backend (.env)
```env
GROQ_API_KEY=gsk_your_key_here
PORT=8000
ENVIRONMENT=production
```

### Frontend (.env)
```env
VITE_API_URL=https://hatrick-backend.onrender.com
VITE_WS_URL=wss://hatrick-backend.onrender.com
```

---

## Performance Optimization

### Backend
- [ ] Enable CORS only for production frontend URL
- [ ] Add rate limiting to prevent abuse
- [ ] Implement API key authentication for report generation
- [ ] Cache APT profile data (Redis)
- [ ] Enable gzip compression

### Frontend
- [ ] Lazy load visualization components
- [ ] Optimize Canvas rendering (debounce updates)
- [ ] Minimize bundle size (code splitting)
- [ ] Add service worker for offline support
- [ ] Enable CDN for static assets

---

## Security Checklist

### Backend
- [ ] GROQ_API_KEY stored securely (environment variable, not in code)
- [ ] CORS configured for specific origins only
- [ ] Rate limiting enabled (e.g., 100 requests/hour per IP)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (if using databases)
- [ ] HTTPS enforced (no HTTP fallback)

### Frontend
- [ ] No API keys exposed in client code
- [ ] Content Security Policy headers configured
- [ ] XSS prevention (React handles this by default)
- [ ] Dependency vulnerabilities checked (`npm audit`)
- [ ] Environment variables properly configured

---

## Monitoring & Analytics

### Backend Monitoring
```bash
# Install monitoring tools
pip install sentry-sdk prometheus-client

# Add to main.py:
import sentry_sdk
sentry_sdk.init(dsn="your_sentry_dsn")
```

### Frontend Analytics
```typescript
// Add Google Analytics or Plausible
// In index.html:
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Error Tracking
- **Backend**: Sentry (https://sentry.io)
- **Frontend**: Sentry or LogRocket (https://logrocket.com)

---

## CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy HatTrick

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-xxxxx?key=${{ secrets.RENDER_DEPLOY_KEY }}

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install and Build
        run: |
          npm install
          npm run build
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Rollback Plan

### If Backend Fails
```bash
# Render: Click "Rollback" in dashboard
# Railway: Select previous deployment
# AWS: Restore from snapshot
```

### If Frontend Fails
```bash
# Vercel: Click "Rollback" in deployments
# Netlify: Select previous deploy in dashboard
```

---

## Success Criteria

- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] WebSocket connection established
- [ ] 3D topology renders correctly
- [ ] Heat map auto-scan works
- [ ] Packet animation shows 60fps
- [ ] APT profiles load from backend
- [ ] Report generation downloads JSON
- [ ] Cost dashboard updates every 5 seconds
- [ ] All API endpoints respond < 5 seconds

---

## Domain Configuration (Optional)

### Custom Domain Setup

1. **Purchase domain** (Namecheap, GoDaddy, etc.)
2. **Add DNS records**:

**Backend (A Record)**:
```
Type: A
Name: api
Value: [Render IP address]
TTL: 3600
```

**Frontend (CNAME)**:
```
Type: CNAME
Name: www
Value: hatrick.vercel.app
TTL: 3600
```

3. **Configure in hosting provider**:
   - Render: Settings → Custom Domain → Add `api.yourdomain.com`
   - Vercel: Settings → Domains → Add `www.yourdomain.com`

4. **Update frontend API URL**:
```typescript
const API_BASE_URL = 'https://api.yourdomain.com';
```

---

## Final Verification

### Smoke Test
1. ✅ Visit frontend URL
2. ✅ Click "Enterprise Portfolio" button
3. ✅ Switch between all tabs (3D Topology, Heat Map, Packet Flow, etc.)
4. ✅ Load APT29 scenario
5. ✅ Generate pen test report (should download JSON)
6. ✅ Check browser console for errors (should be none)
7. ✅ Open Network tab, verify WebSocket connection
8. ✅ Test on mobile device (responsive design)

### Performance Test
```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://hatrick-backend.onrender.com/api/apt-profiles

# Expected: < 500ms average response time
```

---

## Documentation Links

After deployment, update these links:

- **Live Demo**: https://hatrick.vercel.app
- **API Documentation**: https://api.hatrick.com/docs
- **GitHub Repository**: https://github.com/yourusername/hatrick
- **Technical Blog Post**: [Link to your blog]
- **Video Demo**: [YouTube/Vimeo link]

---

## Next Steps After Deployment

1. 🎥 **Create video demo** (3-5 minutes showing all features)
2. 📝 **Write blog post** about implementation details
3. 🐦 **Share on Twitter/LinkedIn** with screenshots
4. 📧 **Email to recruiters** with live demo link
5. 💼 **Add to portfolio** website
6. 📄 **Update resume** with project link
7. 🎤 **Prepare elevator pitch** (30 seconds, 2 minutes, 5 minutes)

---

## Support & Troubleshooting

### Common Issues

**Backend won't start**:
- Check GROQ_API_KEY is set correctly
- Verify all dependencies installed (`pip list`)
- Check logs in hosting provider dashboard

**Frontend can't connect to backend**:
- Verify VITE_API_URL environment variable
- Check CORS settings in backend
- Test backend URL directly with curl

**WebSocket connection fails**:
- Ensure backend supports WSS (not just WS)
- Check proxy/load balancer WebSocket support
- Verify firewall allows WebSocket traffic

**Visualizations not rendering**:
- Check browser console for Canvas errors
- Verify Framer Motion is installed
- Test on different browsers (Chrome, Firefox, Safari)

---

## Contact Information

For deployment support:
- GitHub Issues: [Your repo issues page]
- Email: [Your email]
- Twitter: [@yourhandle]

---

## 🎉 Ready to Deploy!

All components tested and ready for production. Follow the checklist step-by-step for a successful deployment.

**Estimated Time**: 1-2 hours for full deployment

**Cost**: Free tier available on Render, Vercel, Netlify

**Support**: Comprehensive documentation and troubleshooting guides included
