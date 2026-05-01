// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/belahub-test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.BACKEND_URL = 'http://localhost:5000';
