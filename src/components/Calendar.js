import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css';
import { firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function CalendarComponent() {
  const [date, setDate] = useState(new Date()); // 選択された日付
  const [viewDate, setViewDate] = useState(new Date()); // 表示中の月
  const [activityDays, setActivityDays] = useState([]); // 活動日リスト

  useEffect(() => {
    let mounted = true;

    const fetchActivityDays = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'activities'));
        const days = querySnapshot.docs
          .map(doc => {
            const id = doc.id;
            return /^\d{4}-\d{2}-\d{2}$/.test(id) ? id : null;
          })
          .filter(day => day !== null);

        if (mounted) {
          setActivityDays(days);
        }
      } catch (error) {
        console.error('活動日の取得エラー:', error);
      }
    };

    fetchActivityDays();

    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (newDate) => {
    setDate(newDate);
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // 現在の年月
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const minDate = new Date(currentYear, currentMonth, 1);
  const maxDate = new Date(currentYear, currentMonth + 2, 0);

  // タイルのスタイル変更（活動日にのみ下線）
  const tileClassName = ({ date }) => {
    const formattedDate = date.toLocaleDateString('en-CA');
    return activityDays.includes(formattedDate) ? 'active-day' : '';
  };

  return (
    <div>
      <div className="custom-navigation">
        <button
          onClick={handlePrevMonth}
          disabled={viewDate.getFullYear() === currentYear && viewDate.getMonth() === currentMonth}
          className="nav-button"
        >
          前の月へ
        </button>
        <div className="custom-navigation-label">
          {viewDate.getFullYear()}/{viewDate.getMonth() + 1}
        </div>
        <button
          onClick={handleNextMonth}
          disabled={viewDate.getFullYear() === maxDate.getFullYear() && viewDate.getMonth() === maxDate.getMonth()}
          className="nav-button"
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
        activeStartDate={viewDate}
        onActiveStartDateChange={({ activeStartDate }) => setViewDate(activeStartDate)}
        tileClassName={tileClassName}
        showNeighboringMonth={false} // ★これが重要
      />
      <p>選択された日付: {date.toLocaleDateString('ja-JP')}</p>
    </div>
  );
}

export default CalendarComponent;
