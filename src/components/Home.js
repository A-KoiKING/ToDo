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

  const updateTimeLeft = (target) => {
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
  };

  useEffect(() => {
    const target = targetDate ? new Date(targetDate) : null;
    if (!target) return;

    updateTimeLeft(target);

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
        updateTimeLeft(target);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const { days, hours, minutes, seconds, isExpired } = timeLeft;

  const formatTime = (value) => String(value).padStart(2, '0');

  return (
    <div className="home">
      <h1 className="home-h1">
        <span className="title-part">函館高専</span>
        <span className="title-part">ロボット研究会</span>
      </h1>
      <h2 className="home-h2">
        地区大会まで
      </h2>
      {targetDate && (
        <p className={`timer ${isExpired ? 'expired' : ''}`}>
          {isExpired ? (
            '期限が過ぎています'
          ) : (
            <>
              <span className="time-group">
                <span className="time-part">{formatTime(days)}日 </span>
                <span className="time-part">{formatTime(hours)}時間</span>
              </span>
              <span className="time-group">
                <span className="time-part">{formatTime(minutes)}分 </span>
                <span className="time-part">{formatTime(seconds)}秒</span>
              </span>
            </>
          )}
        </p>
      )}
      <p><strong>お知らせ:</strong> {notice || 'お知らせはありません'}</p>
      <p><strong>バージョン:</strong> {version || '未設定'}</p>
      <p><strong>最終更新日:</strong> {lastUpdated || '未設定'}</p>
    </div>
  );
}

export default Home;