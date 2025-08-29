# 🚀 weeme.ai Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
```bash
# Production .env file
NODE_ENV=production
VITE_API_BASE=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
OPENAI_API_KEY=sk-proj-your-real-key-here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
API_PORT=8787
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Supabase Setup
1. Create Supabase project
2. Run migrations (automatic with database connection)
3. Enable RLS policies
4. Get URL and anon key

### 3. OpenAI API
1. Get production API key from OpenAI
2. Set usage limits and monitoring
3. Configure rate limiting

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### Option 3: Docker
```bash
# Build image
docker build -t weeme-ai .

# Run container
docker run -p 8787:8787 --env-file .env weeme-ai
```

### Option 4: VPS/Server
```bash
# Install dependencies
npm ci --only=production

# Build frontend
npm run build

# Start server
npm start
```

## 🔧 Production Configuration

### Nginx (if using VPS)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api/ {
        proxy_pass http://localhost:8787;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        root /app/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### PM2 (Process Manager)
```bash
# Install PM2
npm i -g pm2

# Start with PM2
pm2 start npm --name "weeme-ai" -- start

# Save PM2 config
pm2 save
pm2 startup
```

## 🔒 Security Checklist

- ✅ HTTPS enforced
- ✅ Security headers (helmet.js)
- ✅ Rate limiting active
- ✅ CORS properly configured
- ✅ Environment variables secured
- ✅ API keys not exposed to client
- ✅ Input validation
- ✅ SQL injection protection (Supabase RLS)

## 📊 Monitoring

### Health Check
```bash
curl https://yourdomain.com/health
```

### Log Monitoring
- Server logs: `pm2 logs weeme-ai`
- Error tracking: Consider Sentry integration
- Performance: Consider New Relic/DataDog

## 🚨 Troubleshooting

### Common Issues
1. **OpenAI API 403**: Check API key validity and billing
2. **Supabase connection**: Verify URL and key
3. **CORS errors**: Check allowed origins
4. **Build failures**: Check TypeScript errors

### Debug Commands
```bash
# Check environment
npm run health-check

# Test OpenAI connection
node server/test-openai.js

# Check build
npm run build

# Test production locally
npm run preview
```

## 📈 Performance Optimization

### Frontend
- ✅ Code splitting implemented
- ✅ Lazy loading for images
- ✅ Bundle optimization
- ✅ Asset compression

### Backend
- ✅ Response compression
- ✅ Request timeout handling
- ✅ Database connection pooling (Supabase)
- ✅ Caching headers

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📝 Post-Deployment

1. **DNS Setup**: Point domain to deployment
2. **SSL Certificate**: Ensure HTTPS is working
3. **Monitoring**: Set up uptime monitoring
4. **Backup**: Configure database backups
5. **Analytics**: Set up error tracking

---

**Ready for production!** 🎉