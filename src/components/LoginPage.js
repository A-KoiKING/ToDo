import React from 'react'

function LoginPage({ handleLogin, userId, setUserId, password, setPassword }) {
  return (
    <div className="container">
        <h1 className="title">Welcome to Hakorobo</h1>
        <form onSubmit={handleLogin} className="form">
            <label className="login_label">ユーザーID</label>
            <input type="text" name="userId" value={userId} onChange={(e) => setUserId(e.target.value)} required autoComplete="off" className="input"/>
            <label className="login_label">パスワード</label>
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" className="input"/>
            <button type="submit" className="button">ログイン</button>
        </form>
    </div>
  )
}

export default LoginPage
