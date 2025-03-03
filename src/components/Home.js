// src/components/Home.js
import React from 'react';

function Home({ lastUpdated, version, notice }) {
  return (
    <div className="home">
      <h1>Home Page</h1>
      <p><strong>最終更新日:</strong> {lastUpdated || '未設定'}</p>
      <p><strong>バージョン:</strong> {version || '未設定'}</p>
      <p><strong>お知らせ:</strong> {notice || 'お知らせはありません'}</p>
    </div>
  );
}

export default Home;