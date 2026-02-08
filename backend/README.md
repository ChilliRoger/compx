# Backend

Server-side utilities, helpers, and type definitions for API routes.

## Structure

- `utils/` - Utility functions (GitHub API helpers, similarity algorithms, etc.)
- `types/` - TypeScript type definitions and interfaces

## Note

API routes in Next.js App Router are located in `app/api/` directory.
This folder contains reusable utilities and types used by those routes.

## Usage

```ts
import { fetchGitHubRepo } from '@backend/utils/github';
import { calculateSimilarity } from '@backend/utils/similarity';
```
