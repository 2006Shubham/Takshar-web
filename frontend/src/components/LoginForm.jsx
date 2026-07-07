import { useState } from 'react';

export const LoginForm = ({ onNavigateToSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const API_URL = 'http://localhost:5000/api/login';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/container';
      } else {
        setErrorMessage(data.error || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrorMessage('Could not connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h2>
        <p className="mt-1.5 text-sm text-gray-500">Sign in to continue your learning journey.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>

        {/* Error Banner */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-3.5">
            <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your username"
            className="input-base"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <a href="#" className="text-xs font-semibold text-orange-600 hover:text-orange-500 transition-colors">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your password"
            className="input-base"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 mt-2 text-base"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Switch to Sign Up */}
        <p className="text-center text-sm text-gray-500 pt-1">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
          >
            Create one
          </button>
        </p>
      </form>
    </div>
  );
};
