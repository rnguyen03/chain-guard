# ChainGuardia Deployment Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Frontend (Vite) - Prefix with VITE_
```bash
VITE_API_BASE=http://localhost:5050/api
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://chain-guardia-api
```

### Backend (Server)
```bash
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chainguardia
FRONTEND_ORIGIN=http://localhost:5173

# Auth0 Server Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://chain-guardia-api

# Optional: NVD API Key (for higher rate limits)
NVD_API_KEY=your-nvd-api-key

# Optional: Slack Webhook URL (for notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Production Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### MongoDB Atlas
1. Create a MongoDB Atlas cluster
2. Get connection string
3. Update MONGODB_URI in environment variables

## Auth0 Setup
1. Create Auth0 application
2. Set allowed callback URLs: `https://your-domain.vercel.app/callback`
3. Set allowed logout URLs: `https://your-domain.vercel.app`
4. Configure API with identifier: `https://chain-guardia-api`

## Features Implemented

✅ **Fixed Production API Error**: Resolved TypeError in authenticated user requests
✅ **ChainGuardia Branding**: Updated throughout the application
✅ **Enhanced Dashboard**: Real-time monitoring indicators and better UX
✅ **CVE Monitoring**: NVD API integration with recent vulnerability fetching
✅ **Improved Matching**: Enhanced algorithm with keyword extraction
✅ **Alert System**: Real-time alerts with notification center
✅ **UI Improvements**: Better component headers and descriptions

## Demo Flow
1. Sign in with Auth0
2. Add applications (Slack, Zoom, GitHub, etc.)
3. View vulnerabilities affecting your apps
4. Monitor alerts in real-time
5. Manage vulnerability status

## Next Steps
- Set up Auth0 account and configure
- Deploy to Vercel and Railway/Render
- Configure MongoDB Atlas
- Test the complete flow
