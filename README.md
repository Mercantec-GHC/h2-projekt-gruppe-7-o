# Hotel KabdiKhan - H2 Projekt Gruppe 7-0

Et lille bitte hotel management system bygget med Next.js frontend og ASP.NET Core Web API backend.

## 🚀 Teknologi Stack

### Frontend - Next.js

- **Framework:** Next.js 15.5 med App Router
- **Sprog:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Komponenter:**
  - Radix UI primitives
  - Shadcn/ui komponent bibliotek
- **State Management:**
  - Zustand for global state
  - TanStack React Query for async server state
- **Forms:** React Hook Form med Zod validation
- **Real-time:** Microsoft SignalR

### Backend - ASP.NET Core Web API
Backend er bygget med:

- **Framework:** ASP.NET Core 9.0 Web API
- **Database:** PostgreSQL med Entity Framework Core 9.0
- **Authentication:** JWT Bearer tokens
- **Architecture:** Vertical Slice Architecture
- **Documentation:** Swagger/OpenAPI
- **Testing:** Bogus for test data generation
- **Monitoring:** Sentry for error tracking
- **Active Directory:** Integration for brugeradministration

### Infrastructure
- **Containerization:** Docker med Docker Compose
- **Development:** .NET 9.0
- **Database:** PostgreSQL
- **API Client Generation:** OpenAPI Generator

## 📁 Projekt Struktur

```
h2-api-ef-core/
├── API/                          # ASP.NET Core Web API
│   ├── Features/                 # Feature-baseret arkitektur
│   ├── Database/                 # EF Core DbContext og konfiguration
│   ├── Migrations/               # Database migrationer
│   ├── Hubs/                     # SignalR hubs
│   └── Common/                   # Shared utilities
├── frontend/                     # Next.js frontend applikation
│   ├── app/                      # Next.js App Router pages
│   ├── components/               # Genbrugelige UI komponenter
│   ├── features/                 # Feature-specifikke komponenter
│   ├── lib/                      # Utility funktioner
│   ├── hooks/                    # Custom React hooks
│   ├── providers/                # Context providers
│   └── api/                      # API client og types
├── Bruno/                        # API test samling
```

## 🛠️ Installation og Opsætning

### Frontend Setup (Next.js)


1. **Naviger til frontend mappen:**
   ```bash
   cd frontend
   ```

2. **Kopier `.example.env` til `.env`:**
   ```bash
   cp .example.env .env
   ```

3. **Installer dependencies:**
   ```bash
   npm install
   ```


4. **Start development server:**
   ```bash
   npm run dev
   ```

Frontend kører på `http://localhost:3000`

 ### Forudsætninger
- .NET 9.0 SDK
- Node.js 18+ og npm/yarn
- PostgreSQL database

### Backend Setup (API)

???

API'en kører på `https://localhost:7087`
