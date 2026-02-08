# Frontend

Client-side React components, hooks, and contexts for the Compx application.

## Structure

- `components/` - Reusable UI components (buttons, cards, forms, modals, etc.)
- `hooks/` - Custom React hooks (useWallet, useYellowSession, etc.)
- `contexts/` - React Context providers (WalletContext, YellowContext, etc.)

## Usage

Import components and hooks from this directory:

```tsx
import { WalletButton } from '@frontend/components/WalletButton';
import { useYellowSession } from '@frontend/hooks/useYellowSession';
```
