# Blawesome

Blawesome (bloom + awesome) is an open-source goal tracking platform that grows with you. Build your personal growth dashboard by enabling modules that matter to you - from weight lifting to meditation, the possibilities are endless.

## Features

- **Modular Architecture**: Enable/disable tracking modules through settings
- **Dynamic Pages**: Modules automatically create their own pages at `/modules/[MODULE]`
- **Custom Reports**: Each module contributes to `/reports` and can be added to your dashboard
- **Self-hosted**: Run your own instance with your PostgreSQL database
- **Extensible**: Write your own modules or install community modules

## Tech Stack

- [Next.js](https://nextjs.org) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Bun](https://bun.sh) - JavaScript Runtime & Package Manager
- [TailwindCSS](https://tailwindcss.com) - Styling
- [DrizzleORM](https://orm.drizzle.team) - Database ORM
- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Biome](https://biomejs.dev) - Linter & Formatter

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and add your PostgreSQL URL
3. Install dependencies:
```bash
bun install
```

4. Run the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
bun build
bun start
```

## Deployment

### Vercel
1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Add your `POSTGRES_URL` to environment variables
4. Deploy

### AWS Amplify
1. Fork this repository
2. Create a new app in [AWS Amplify](https://aws.amazon.com/amplify/)
3. Add your `POSTGRES_URL` to environment variables
4. Deploy

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Creating Modules

Modules can be created by:
1. Adding a new module to `/src/modules`
2. Creating required database schemas
3. Implementing the module interface
4. Submitting a PR

Detailed module creation documentation coming soon.

## License

MIT License - see LICENSE file for details