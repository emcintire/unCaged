# unCaged - Nicolas Cage Filmography App

unCaged lets you find, rate and bookmark the entirety of Nicolas Cage's prolific filmography. Genius? Madness? Both? Sexy cat? We provide the data—you reach the conclusion.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: TanStack Query (React Query)
- **API Client**: Zodios with Zod validation
- **Forms**: Formik with Zod validation
- **Styling**: StyleSheet with custom theme system
- **Ads**: Google Mobile Ads

### TypeScript

- Strict mode enabled
- Explicit return types for functions
- No implicit `any`
- Comprehensive type definitions

## Architecture Decisions

### Why TanStack Query?

- Automatic caching and background refetching
- Optimistic updates support
- Built-in loading and error states
- Powerful dev tools

```typescript
// Example usage
const { data, isLoading, error } = useMovies();
```

### Why Zodios + Zod?

- All API endpoints are defined in `app/api/controllers/`
- Type-safe request/response schemas
- Automatic validation with Zod
- OpenAPI compatibility
- Excellent TypeScript support
- Tanstack Query integration
- Built in error handling

### Why Formik + Zod?

- Declarative form handling
- Built-in validation
- Easy error handling
- Good React Native support

## Performance Optimization

- Code splitting by screen
- Image optimization
- Lazy loading for heavy components
- Debounced search inputs
- Memoized components and callbacks
