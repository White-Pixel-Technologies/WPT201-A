# WPT 201 - A

A privacy-focused personal expense management application built with Expo, React Native and TypeScript.

## App Configuration

| Setting         | Value                             |
| --------------- | --------------------------------- |
| App name        | WPT 201 - A                       |
| Slug            | wpt-201-a                         |
| Scheme          | wpt201a                           |
| Expo SDK        | 57                                |
| Android package | in.whitepixeltechnologies.wpt201a |
| iOS bundle ID   | in.whitepixeltechnologies.wpt201a |

## Prerequisites

- Node.js LTS
- Git
- Visual Studio Code
- Expo Go for device testing
- Android Studio for native Android development

## Setup

Clone the repository:

```bash
git clone https://github.com/joshitha29-08/SaveMode.git
cd SaveMode
```

Install dependencies:

```bash
npm install
```

Create your environment file:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Add the required environment values to `.env`.

## Run the Application

Start the web version:

```bash
npm run web
```

Start the Expo development server:

```bash
npm start
```

Scan the QR code using Expo Go on a compatible device.

Run the native Android app:

```bash
npm run android
```

iOS native development requires macOS and Xcode. The app is configured for iPhone, not iPad.

## Environment Variables

Configure these values in your local `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Use only the approved public/publishable key in the client application. Never expose a Supabase service-role key in the app.

Do not commit `.env` or other secrets to Git.

## Available Checks

TypeScript:

```bash
npm run typecheck
```

Tests:

```bash
npm test -- --runInBand
```

Lint:

```bash
npm run lint
```

Check formatting:

```bash
npm run format:check
```

Apply formatting:

```bash
npm run format
```

## Project Structure

```text
src/
├── app/          # Expo Router screens and routes
├── components/   # Shared UI components
├── constants/    # Application constants
├── data/         # Data-related modules
├── features/     # Feature-specific modules
├── hooks/        # Reusable React hooks
├── i18n/         # Translation resources
├── lib/          # Shared libraries and services
├── theme/        # Colors, typography, spacing and theme context
├── types/        # TypeScript types
└── __tests__/    # Tests

assets/           # Static assets
supabase/         # Supabase-related files
plugins/          # Expo plugin configuration
.github/          # GitHub project configuration
docs/             # Project documentation
```

## Theme System

The application supports three theme modes:

- System: follows the device appearance.
- Light: uses the light theme.
- Dark: uses the dark theme.

Theme preferences are persisted locally. Use the shared theme context and design tokens rather than hardcoding colors or styles in screens.

The current theme palette is provisional until the approved Design Pack is available.

## Project Notes

- Keep reusable UI in `src/components`.
- Keep theme values in `src/theme`.
- Keep user-facing translations in `src/i18n/en.json`.
- Follow the project's TypeScript and formatting conventions.
- Do not commit credentials, secrets or local environment files.

Refer to the approved project requirements and design documentation before treating provisional implementation details as final.
