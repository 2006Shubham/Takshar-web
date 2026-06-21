import { useState } from 'react';


function LoginForm() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Success: ${data.message}`);
        console.log("Token receives:", data.token);
      } else {
        alert(`Error: ${data.error}`);
      }

    } catch (error) {
      console.error("Network error:", error);
      alert("Could not connect to the backend server.");
    }

  }

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        {/* Username Input */}
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Password Input */}
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm
