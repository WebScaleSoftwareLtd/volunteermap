<p align="center">
  <img src="./public/logo-black.png" alt="VolunteerMap Logo" />
</p>

A website for mapping volunteering opportunities. Powered by **Next.js**, **Postgres**, **Drizzle**, **Algolia**, and **Google Maps**.

## Setting up for Development

### Prerequisites

- Node.js + npm
- Postgres (or a hosted Postgres URL)
- Algolia account (search)
- Google Maps Platform API key (maps)

### Environment variables

Create a `.env.local` with:

```bash
# Database
DATABASE_URL="postgres://..."

# App URL (used in email links + redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID="..."
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY="..."  # search-only key
ALGOLIA_ADMIN_API_KEY="..."               # admin key (server-side indexing)

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."

# Mailgun (optional in dev)
MAILGUN_DOMAIN="..."
MAILGUN_API_KEY="..."

# Avatars (S3)
AWS_REGION="..."
# Optional; if not set we auto-detect the bucket region via GetBucketLocation.
AWS_S3_REGION="..." # e.g. eu-north-1
AWS_S3_BUCKET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

### Install + run

```bash
npm install
npm run db:push
npm run dev
```

Then open `http://localhost:3000`.

## Notes

- **Database migrations**: this repo uses Drizzle; `npm run db:push` will sync schema to your DB during development.
- **Avatars**: avatar uploads are stored in S3. This codebase does **not** use object ACLs (works with buckets that have “Bucket owner enforced”). If you want public avatars, configure a bucket policy to allow public `s3:GetObject` for the `avatars/` prefix; otherwise switch to signed URLs.
