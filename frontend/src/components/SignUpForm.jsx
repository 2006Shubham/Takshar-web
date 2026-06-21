import { useState } from 'react';

function SignUpForm() {
  // 1. Create state variables for the registration fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

const handleSubmit = async (event) => {
  event.preventDefault();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`sign up success: ${data.message}`);
      // You could automatically switch them to the login form here!
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("Could not connect to the backend server.");
  }
};
  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Username Input */}
        <label htmlFor="signup-username">Username</label>
        <input 
          type="text" 
          id="signup-username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        
        {/* Password Input */}
        <label htmlFor="signup-password">Password</label>
        <input 
          type="password" 
          id="signup-password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />

        {/* Confirm Password Input */}
        <label htmlFor="confirm-password">Confirm Password</label>
        <input 
          type="password" 
          id="confirm-password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default SignUpForm;
