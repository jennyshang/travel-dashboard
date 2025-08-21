## Travel Dashboard

A travel app that provides a public-facing itinerary search for travelers and a full admin dashboard for travel agencies. Travelers can discover, view, comment on, and bookmark itineraries; agency users can create, update, and delete trips, manage users, and moderate content. The UI is responsive and built with Tailwind CSS.

## Features

**Public-facing page**
- Search & browse itineraries by destination, date, tags, price, or keywords.
- View detailed itinerary pages with day-by-day plans.
- Read and post comments.
- Save itineraries for later.
- Pay for a trip with Stripe.

**Admin Dashboard**
- Create, read, update, and delete itineraries.
- View and manage user accounts and roles.
- Track real-time activities and trends.

## Tech Stack
- Typescript
- React
- React Router
- Vite
- Next.js
- Tailwind CSS
- Docker
  
## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```


