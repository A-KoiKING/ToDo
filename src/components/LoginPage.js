import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ handleLogin, userId, setUserId, password, setPassword }) {
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="loginpage">
        <h1 className="loginpage-title">
            Welcome to Hakorobo
        </h1>
        <form onSubmit={(e) => handleLogin(e, setErrorMessage)} className="loginpage-form">
            <label className="loginpage-label">
                ユーザーID
            </label>
            <input 
                type="text" 
                name="userId" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
                required 
                autoComplete="off" 
                className="loginpage-input"
            />
            <label className="loginpage-label">
                パスワード
            </label>
            <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="off" 
                className="loginpage-input"
            />
            {errorMessage && <p className="loginpage-error">{errorMessage}</p>}
            <button type="submit" className="loginpage-button">
                ログイン
            </button>
        </form>
    </div>
  );
}

export default LoginPage;
