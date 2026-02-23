# AI Development Rules - Condominios App

## Tech Stack
- **React (Vite)**: Core framework for building the user interface with fast HMR.
- **TypeScript**: Mandatory for all files to ensure type safety and better developer experience.
- **Tailwind CSS**: Primary styling method using utility classes for responsive and consistent design.
- **shadcn/ui**: Base component library built on Radix UI primitives for accessible and styled components.
- **Supabase**: Backend-as-a-Service providing PostgreSQL database, Authentication, and File Storage.
- **TanStack Query (React Query)**: Handles all server-side state management, caching, and data synchronization.
- **React Router**: Client-side routing for navigation between pages.
- **React Hook Form & Zod**: Standardized form handling and schema-based validation.
- **Lucide React**: The exclusive icon library for the application.
- **Sonner**: Used for all user-facing toast notifications and alerts.

## Library Usage Rules

### UI & Styling
- **Components**: Always check `src/components/ui/` for existing shadcn components before creating new ones.
- **Icons**: Use `lucide-react` for all icons. Maintain consistent sizing (usually `h-4 w-4` or `h-5 w-5`).
- **Layouts**: Use the `AppLayout` component for all authenticated pages to maintain sidebar and header consistency.
- **Responsive Design**: Always use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) to ensure mobile-first compatibility.

### Data & State
- **Supabase Client**: Always use the client from `@/integrations/supabase/client`.
- **Data Fetching**: Use TanStack Query hooks (`useQuery`, `useMutation`). Do not use `useEffect` for data fetching.
- **Database Types**: Use the generated types from `@/integrations/supabase/types` for all database interactions.
- **Custom Hooks**: Logic for data fetching should be encapsulated in hooks within `src/hooks/` (e.g., `useApartments`, `usePayments`).

### Forms & Validation
- **Validation**: Define all schemas in `src/lib/validations.ts` using Zod.
- **Implementation**: Use `react-hook-form` with the `zodResolver`.
- **Feedback**: Use `sonner` to provide immediate feedback on form submission success or failure.

### Architecture
- **Pages**: Keep page components in `src/pages/`. They should primarily compose high-level components.
- **Components**: Keep reusable UI logic in `src/components/`. Organize by feature (e.g., `src/components/payments/`).
- **Auth**: Wrap protected routes or page content with the `AuthGuard` component.