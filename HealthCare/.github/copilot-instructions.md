# AI Agent Instructions for Healthcare Project

## Project Overview

This is a TypeScript-based React application built with Vite, focusing on healthcare-related functionality. The application currently implements a secure login system with future plans for healthcare management features.

## Architecture & Structure

- Built using React 19 with TypeScript and Vite for development and building
- Component-based architecture with modular structure:
  - `src/components/` - Reusable React components
  - `src/assets/` - Static assets (images, styles)
  - Root level configuration files for TypeScript, ESLint, and Vite

## Development Workflow

### Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

### Key Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build production bundle (runs TypeScript build first)
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build locally

## Project Conventions

### TypeScript & React Patterns

- Use functional components with TypeScript FC type annotation
  ```typescript
  const Component: React.FC = () => {
    // Component code
  };
  ```
- Implement strict type checking for all props and state
- Use React.FormEvent type for form submissions (see `LoginPage.tsx`)

### State Management

- Currently using React's built-in useState for local component state
- Form handling pattern established in `LoginPage.tsx`:
  ```typescript
  const [fieldName, setFieldName] = useState("");
  const handleChange = (e) => setFieldName(e.target.value);
  ```

### ESLint Configuration

- Extended type-aware lint rules configuration is available
- Project uses recommended TypeScript ESLint rules
- See `eslint.config.js` for detailed configuration

## Integration Points

- Authentication system placeholder in `LoginPage.tsx` - ready for backend integration
- Component styling uses CSS modules pattern (see `LoginPage.css`)

## Future Considerations

- Backend API integration for authentication
- State management solution for larger application state
- Protected routes implementation
- Healthcare-specific feature components

## Notes for AI Agents

- When adding new components, follow the established pattern in `LoginPage.tsx`
- Maintain strict TypeScript typing throughout the codebase
- Respect the existing project structure when adding new features
- Consider HMR implications when modifying Vite configuration
