# Touch Your Bible

A React Native application that helps users build a daily Bible reading habit by requiring physical interaction with their Bible before accessing selected apps.

## Features

- Bible page verification using camera and OCR
- App blocking mechanism
- Daily streak tracking
- Multiple discipline levels
- Dark mode support
- Offline functionality
- Battery-efficient operation

## Tech Stack

- React Native with Expo
- TypeScript
- NativeWind (TailwindCSS)
- React Navigation
- Zustand for state management
- React Query for data fetching
- Zod for validation
- React Native Reanimated for animations

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- iOS Simulator / Android Emulator
- Expo Go app for physical device testing

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/DamonRedding/touch-your-bible-project.git
cd touch-your-bible-project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios     # for iOS
npm run android # for Android
```

## Development

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── hooks/          # Custom React hooks
├── services/       # API and service integrations
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── constants/      # App constants
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.