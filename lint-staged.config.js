module.exports = {
    'backend/src/**/*.ts': ['cd backend && npm run lint -- --fix'],
    'frontend/app/**/*.{ts,tsx}': ['cd frontend && npm run lint -- --fix'],
    'frontend/components/**/*.{ts,tsx}': ['cd frontend && npm run lint -- --fix'],
    'frontend/lib/**/*.{ts,tsx}': ['cd frontend && npm run lint -- --fix'],
};
