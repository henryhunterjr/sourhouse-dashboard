# SourHouse Commission Tracker

A personal dashboard to track your SourHouse affiliate commissions from Affiliatly email notifications.

**Affiliate Code:** HBK23  
**Commission Rate:** 15%

## Features

- **Gmail Integration** - Connects to your Gmail to automatically fetch Affiliatly commission emails
- **Running Totals** - All-time, this month, and this week commission stats
- **Visual Charts** - Monthly commission bar chart and order trend line chart
- **Order History** - Detailed list of all tracked orders with dates and amounts
- **Local Storage** - Data cached in your browser for instant loading
- **Manual Refresh** - Pull new emails whenever you want

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Gmail API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click Enable

### 2. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/api/auth/gmail`
   - For production: `https://your-vercel-app.vercel.app/api/auth/gmail`
5. Save and copy your Client ID and Client Secret

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Fill in app name: "SourHouse Commission Tracker"
4. Add your email as a test user
5. Add scope: `https://www.googleapis.com/auth/gmail.readonly`

### 4. Set Environment Variables

Create a `.env.local` file in the project root:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail
```

### 5. Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (use your Vercel URL)

4. Update Google Cloud Console redirect URI to match your Vercel URL

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How It Works

1. Click "Connect Gmail" to authorize read-only access
2. Click "Refresh" to fetch all Affiliatly commission emails
3. The dashboard parses each email for order ID and price
4. Calculates your 15% commission automatically
5. Data is cached locally for instant loading on return visits

## Email Format Parsed

The dashboard looks for emails from `affiliatly.com` with subject "Sourhouse: New referred order" containing:

```
There is a new referred order with ID: SH43589 and price $329.99
```

## Privacy

- Gmail access is read-only
- Only searches for Affiliatly/Sourhouse emails
- Data stored locally in your browser
- No data sent to external servers (except Gmail API)

---

Built for Henry Hunter's Baking Great Bread at Home community.
