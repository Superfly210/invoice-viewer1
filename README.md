# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/699bff26-15a1-449e-992d-323eb65935a0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/699bff26-15a1-449e-992d-323eb65935a0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables (REQUIRED)
# Copy the example file and fill in your Supabase credentials
cp .env.example .env
# Edit .env with your actual Supabase URL, Project ID, and Publishable Key
# See SECURITY.md for detailed setup instructions and security best practices

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Authentication)

## Security

This project uses environment variables for Supabase configuration. All environment variables are client-side (prefixed with `VITE_`) and embedded in the browser bundle.

**Important:** See [SECURITY.md](./SECURITY.md) for:
- Understanding client-side environment variables
- Why `VITE_SUPABASE_PUBLISHABLE_KEY` is safe to expose
- Row Level Security (RLS) best practices
- Environment setup instructions
- Security checklist

Quick setup:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/699bff26-15a1-449e-992d-323eb65935a0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Security & Deployment Documentation

This project includes comprehensive security and deployment documentation:

- **[SECURITY.md](./SECURITY.md)** - Detailed security guide covering:
  - Environment variables and why they're safe to expose
  - Row Level Security (RLS) best practices
  - Setup instructions and security checklist
  
- **[SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)** - Quick reference checklist for:
  - Pre-deployment security verification
  - Regular maintenance tasks
  - Incident response procedures
  
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Platform-specific deployment guides for:
  - Vercel, Netlify, Docker
  - Manual VPS/Server deployment
  - Environment variable configuration
  - Troubleshooting common issues

**Quick Start:**
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your Supabase credentials
# (Get them from https://app.supabase.com > Settings > API)

# 3. Start development
npm run dev
```
