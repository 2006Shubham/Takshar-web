import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';


function AuthContainer(){


    const [isLogin, setIsLogin] = useState(true);


    return (

        <div>

                {isLogin ? <LoginForm/> : <SignUpForm/>}

                <div style={{marginTop:'20px',textDecoration:'underline',cursor:'pointer'}}>

                    {isLogin ?(<p onClick={() => setIsLogin(false)}>Don't have an account? Sign Up</p>):(
          <p onClick={() => setIsLogin(true)}>Already have an account? Login</p>
        )}

                </div>
        </div>

    )

}

export default AuthContainer;