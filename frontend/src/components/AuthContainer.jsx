import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

export const AuthContainer = () => {
    const [isLogin, setIsLogin] = useState(true);

    // 1. Define explicit handler functions for state transitions
    const handleSwitchToSignUp = () => setIsLogin(false);
    const handleSwitchToLogin = () => setIsLogin(true);



    return (
        <div className="relative overflow-hidden bg-stone-50 min-h-screen">
            {/* 2. We use conditional rendering to show the active form.
        We pass the navigation handlers down as props so the forms 
        can trigger the toggle from inside their own UI layouts.
      */}
            {isLogin ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LoginForm

                        onNavigateToSignUp={handleSwitchToSignUp}


                    />

                    {/* External Global Toggle for Login View */}

                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SignUpForm
                        // Passing the handler down to the form we built previously
                        onNavigateToLogin={handleSwitchToLogin}
                        onSuccess={(data) => {
                            console.log('Signup success data:', data);
                            // Auto-switch back to login after successful registration
                            handleSwitchToLogin();
                        }}
                    />

                    {/* Note: The "Sign in instead" toggle is already built inside 
              the SignUpForm component from our previous iteration, 
              so we don't need a duplicate external toggle here. */}
                </div>
            )}
        </div>
    );
};

export default AuthContainer;