import { useState } from 'react';

export const SignUpForm = ({ onSuccess, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your input.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = 'http://localhost:5000/api/signup';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, organization }),
      });

      const data = await response.json();
      if (response.ok) {
        if (onSuccess) onSuccess(data);
      } else {
        setErrorMessage(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrorMessage('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h2>
        <p className="mt-1.5 text-sm text-gray-500">Join Spark and start proving your skills.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>

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
          <label htmlFor="signup-username" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Username
          </label>
          <input
            id="signup-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            placeholder="Choose a username"
            className="input-base"
          />
        </div>

        {/* Role + Organization — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="signup-role" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Role
            </label>
            <input
              id="signup-role"
              name="role"
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. Developer"
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="signup-organization" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Organization
            </label>
            <input
              id="signup-organization"
              name="organization"
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. COEP Pune"
              className="input-base"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="At least 8 characters"
            className="input-base"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Repeat your password"
              className={`input-base pr-10 ${
                passwordsMismatch
                  ? 'ring-red-300 focus:ring-red-500'
                  : passwordsMatch
                    ? 'ring-green-300 focus:ring-green-500'
                    : ''
              }`}
            />
            {passwordsMatch && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          {passwordsMismatch && (
            <p className="mt-1.5 text-xs font-medium text-red-600">Passwords do not match.</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !!passwordsMismatch}
          className="btn-primary w-full py-3 mt-2 text-base"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-center text-sm text-gray-500 pt-1">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
};