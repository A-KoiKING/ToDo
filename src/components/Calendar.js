import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css';
import { firestore } from '../firebase'; // Firebase 設定をインポート
import { collection, getDocs } from 'firebase/firestore';

function CalendarComponent() {
  const [date, setDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // カレンダーの表示される月を管理
  const [activityDays, setActivityDays] = useState([]); // 活動日リスト

  useEffect(() => {
    const fetchActivityDays = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'activities'));
        const days = querySnapshot.docs.map(doc => doc.id); // ドキュメントIDを日付として取得（"YYYY-MM-DD"形式を想定）
        setActivityDays(days);
      } catch (error) {
        console.error('活動日の取得エラー:', error);
      }
    };

    fetchActivityDays();
  }, []);

  const onChange = (newDate) => {
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(viewDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setViewDate(nextMonth);
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(viewDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setViewDate(prevMonth);
  };

  // 現在の年月
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based（3月は2）

  // minDate（現在の月の1日）と maxDate（次の月の最終日）
  const minDate = new Date(currentYear, currentMonth, 1);
  const maxDate = new Date(currentYear, currentMonth + 2, 0);

  // タイルの無効化（現在表示している月以外の日付を無効化）
  const tileDisabled = ({ date }) => {
    return date.getMonth() !== viewDate.getMonth();
  };

  // タイルのスタイル変更（活動日を赤色にする）
  const tileClassName = ({ date }) => {
    const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD" 形式
    return activityDays.includes(formattedDate) ? 'active-day' : '';
  };

  return (
    <div>
      <div className="custom-navigation">
        <button 
          onClick={handlePrevMonth} 
          disabled={viewDate.getFullYear() === currentYear && viewDate.getMonth() === currentMonth}
        >
          前の月へ
        </button>
        <div className="custom-navigation-label">
          {`${viewDate.getFullYear()}/${viewDate.getMonth() + 1}`}
        </div>
        <button 
          onClick={handleNextMonth} 
          disabled={viewDate.getFullYear() === maxDate.getFullYear() && viewDate.getMonth() === maxDate.getMonth()}
        >
          次の月へ
        </button>
      </div>
      <Calendar
        onChange={onChange}
        value={date}
        locale="ja-JP"
        showNavigation={false}
        minDate={minDate}
        maxDate={maxDate}
        tileDisabled={tileDisabled}
        activeStartDate={viewDate} // カレンダーの表示を制御
        onActiveStartDateChange={({ activeStartDate }) => setViewDate(activeStartDate)} // 月が変わったら反映
        tileClassName={tileClassName} // 活動日を赤色にする
      />
      <p>選択された日付: {date.toLocaleDateString('ja-JP')}</p>
    </div>
  );
}

export default CalendarComponent;