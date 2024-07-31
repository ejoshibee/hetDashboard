# Map Dashboard

This project is a React-based dashboard application that visualizes geospatial data using Leaflet maps. It is built with TypeScript, Vite, and Tailwind CSS, and includes various tools for interacting with and analyzing the data.

## Features

- **React & TypeScript**: Leverages the power of React for building UI components and TypeScript for type safety.
- **Vite**: Utilizes Vite for fast development and build processes.
- **Leaflet**: Integrates Leaflet for interactive maps.
- **Tailwind CSS**: Uses Tailwind CSS for utility-first styling.
- **Data Visualization**: Displays geospatial data with markers, polylines, and tooltips.

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- npm
- docker
- local or remote sql connection 

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mapdashboard.git
   ```
   ```bash
   cd mapdashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup .env file with the following:
   ```ruby
   DB_HOST=host_name
   DB_USER=username
   DB_PASSWORD=pwd
   DB_DATABASE=db_name
   ```


### Development

To start the vite development server and backend server:
   ```bash
   docker-compose up --build
   ```

This will start the Vite development server and open the application in your default web browser.

### Building for Production

To build the project for production:

```
npm run build
```
Before serving out of `/dist`

## Project Structure

```
mapdashboard/
├── server/
├── src/
│   ├── assets/
│   │   ├── HankenGrotesk-VariableFont...
│   │   ├── RBlogo.svg
│   │   └── react.svg
│   ├── components/
│   │   └── map/
│   │       ├── locationImpactMap/
│   │       │   ├── additionalPoints.tsx
│   │       │   ├── boundsUpdates.tsx
│   │       │   ├── uuidSelector.tsx
│   │       │   └── locationImpactMa... 9+
│   │       ├── deltaDistanceHistogram.t...
│   │       └── modal.tsx
│   ├── lib/
│   │   ├── mapHelpers.ts
│   │   └── navHelpers.ts
│   ├── pages/
│   │   ├── dashboard.tsx
│   │   ├── error.tsx
│   │   ├── index.tsx
│   │   ├── map.tsx
│   │   └── root.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .env
├── docker-compose.yaml
├── Dockerfile
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Configuration

### Vite

This project uses Vite as its build tool. The Vite configuration is located in `vite.config.ts`.

### ESLint

ESLint is configured for code quality. To expand the ESLint configuration:

1. Configure the top-level `parserOptions` property in `.eslintrc.cjs`:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

2. For stricter type checking, replace `plugin:@typescript-eslint/recommended` with `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`.

3. Optionally add `plugin:@typescript-eslint/stylistic-type-checked` for additional stylistic rules.

4. Install `eslint-plugin-react` and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list.

### Tailwind CSS

Tailwind CSS is configured in `tailwind.config.js`.

## Docker

The project includes Docker configuration for both frontend and backend services. Use `docker-compose up --build` to run the entire application stack.
