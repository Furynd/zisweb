This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


# ZISWeb

A simple Zakat, Infaq, Shodaqoh recording app.

## Stack
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase (Auth & DB)
- Lucide Icons

## Features
- Manual Zakat, Infaq, Shodaqoh entry (no payment gateway)
- Supabase Auth & DB
- Clean, white, trustworthy UI (Tailwind, shadcn/ui, green/gold accents)
- Lucide icons
- Operator & SuperAdmin roles
- Transaction reports, invoice printout
- Zakat calculator
- Takjil registration (money, food, others)

## Getting Started

1. Install dependencies:

	```bash
	npm install
	```

2. Copy `.env.local.example` to `.env.local` and fill in your Supabase project credentials:

	```bash
	cp .env.local.example .env.local
	# Edit .env.local and set your Supabase URL and anon key
	```

3. Start the development server:

	```bash
	npm run dev
	```

## Project Structure
- Uses Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase
- Lucide icons

## License
MIT
