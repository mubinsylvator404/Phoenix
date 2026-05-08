# Analytics Tracking Extension Guide

To extend the current IP/Location detection system into a full analytics tracking suite, follow these steps:

## 1. Database Schema (Supabase)
Create an `analytics` table to store visitor data:

```sql
CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  visitor_ip TEXT,
  city TEXT,
  country TEXT,
  region TEXT,
  path TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Server-Side Implementation
Update the `/api/location` endpoint (or create a middleware) to log every request:

```typescript
// In server.ts
app.use(async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  
  // Log to Supabase asynchronously (don't block the request)
  supabase.from('analytics').insert({
    visitor_ip: ip,
    path: req.path,
    user_agent: req.headers['user-agent'],
    referrer: req.headers['referer']
  }).then(({ error }) => {
    if (error) console.error('Analytics log error:', error);
  });
  
  next();
});
```

## 3. Frontend Tracking
Use a custom hook to track page views and events:

```typescript
// src/hooks/useAnalytics.ts
export const useAnalytics = () => {
  const trackEvent = (eventName: string, properties: any) => {
    fetch('/api/track', {
      method: 'POST',
      body: JSON.stringify({ eventName, properties, timestamp: Date.now() })
    });
  };
  
  return { trackEvent };
};
```

## 4. Dashboard Integration
Create an Admin view to visualize this data using `recharts` or `d3`:
- **Heatmap**: Show where visitors are coming from.
- **Traffic Spikes**: Monitor concurrent users.
- **Conversion Funnel**: Track how many visitors become students.
