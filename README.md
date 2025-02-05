# YBDBD Telegram Mini App

A Telegram Mini App built with Next.js, NestJS, shadcn/ui, and Supabase.

## Demo

(it may not work since it's using ngrok for now, deployment soon)
Current Telegram Mini App: [https://t.me/ybdbd_bot](https://t.me/ybdbd_bot)

## Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/)
- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** [Supabase](https://supabase.com)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) & [shadcn/ui](https://ui.shadcn.com)
- **Monorepo:** [Turborepo](https://turbo.build/repo)
- **API:** REST & WebSocket
- **Authentication:** Telegram Login & Supabase Auth

## Project Structure

```bash
├── apps
│   ├── frontend        # Next.js frontend application
│   └── backend         # NestJS backend application
├── supabase
│   ├── functions      # Supabase Edge Functions
│   └── migrations     # Database migrations
└── packages          # Shared packages
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Telegram account

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
# From root directory
pnpm dev
```

### Development

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps

## License

MIT
