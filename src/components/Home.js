import React, { useState, useEffect } from 'react';
import './Home.css';

function Home({ lastUpdated, version, notice, targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const target = targetDate ? new Date(targetDate) : null;
    if (!target) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diffMs = target - now;

      if (diffMs <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        clearInterval(timer);
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const { days, hours, minutes, seconds, isExpired } = timeLeft;

  return (
    <div className="home">
      <h1>地区大会まで</h1>
      {targetDate && (
        <p className={`timer ${isExpired ? 'expired' : ''}`}>
          <strong>地区大会まであと:</strong>{' '}
          {isExpired
            ? '期限が過ぎています'
            : `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`}
        </p>
      )}
      <p><strong>最終更新日:</strong> {lastUpdated || '未設定'}</p>
      <p><strong>バージョン:</strong> {version || '未設定'}</p>
      <p><strong>お知らせ:</strong> {notice || 'お知らせはありません'}</p>
    </div>
  );
}

export default Home;