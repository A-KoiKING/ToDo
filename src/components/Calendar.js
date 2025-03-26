import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css';
import { firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function CalendarComponent() {
  const [date, setDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [activityDays, setActivityDays] = useState([]);

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

  const tileClassName = ({ date }) => {
    const formattedDate = date.toLocaleDateString('en-CA');
    if (activityDays.includes(formattedDate)) return 'active-day';

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 6) return 'saturday';
    if (dayOfWeek === 0) return 'sunday';
    return '';
  };

  return (
    <div>
      <div className="custom-navigation">
        <button
          onClick={handlePrevMonth}
          disabled={viewDate.getFullYear() === new Date().getFullYear() && viewDate.getMonth() === new Date().getMonth()}
          className="nav-button"
        >
          前の月へ
        </button>
        <div className="custom-navigation-label">
          {viewDate.getFullYear()}/{viewDate.getMonth() + 1}
        </div>
        <button
          onClick={handleNextMonth}
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
        activeStartDate={viewDate}
        onActiveStartDateChange={({ activeStartDate }) => setViewDate(activeStartDate)}
        tileClassName={tileClassName}
        showNeighboringMonth={false}
        formatShortWeekday={(locale, date) => ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
      />
      <p>選択された日付: {date.toLocaleDateString('ja-JP')}</p>
    </div>
  );
}

export default CalendarComponent;
