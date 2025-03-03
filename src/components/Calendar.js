import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { firestore } from '../firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import Confirm from './Confirm';
import './Calendar.css';

function CalendarComponent({ userName }) {
  const [date, setDate] = useState(new Date());
  const [activities, setActivities] = useState({});
  const [absentees, setAbsentees] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesCollection = collection(firestore, 'activities');
        const activitiesSnapshot = await getDocs(activitiesCollection);
        const activitiesData = {};
        activitiesSnapshot.forEach(doc => {
          const data = doc.data();
          activitiesData[data.date] = { time: data.time, color: getColor(data.time) };
        });
        setActivities(activitiesData);

        const nextActivityDate = getNextActivityDate(activitiesData);
        if (nextActivityDate) {
          const absenteesQuery = query(
            collection(firestore, 'absences'),
            where('date', '==', nextActivityDate)
          );
          const absenteesSnapshot = await getDocs(absenteesQuery);
          const absenteeList = absenteesSnapshot.docs.map(doc => doc.data().user);
          setAbsentees(absenteeList);
        } else {
          setAbsentees([]);
        }
      } catch (error) {
        console.error('データ取得エラー:', error); // 必要最低限のエラー出力
      }
    };
    fetchData();
  }, []);

  const getColor = (time) => {
    if (time >= 5) return '#ff4d4d'; // 5時間以上: 赤
    if (time >= 3) return '#ffcc00'; // 3時間以上: 黄色
    return '#00cc00'; // それ以外: 緑
  };

  const getNextActivityDate = (activitiesData) => {
    const today = new Date();
    const dates = Object.keys(activitiesData)
      .map(d => new Date(d))
      .filter(d => d >= today)
      .sort((a, b) => a - b);
    return dates[0]?.toISOString().split('T')[0] || null;
  };

  const handleDayClick = (value) => {
    setSelectedDate(value);
    setIsConfirmOpen(true);
  };

  const handleSubmitAbsence = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      await addDoc(collection(firestore, 'absences'), {
        date: dateStr,
        user: userName,
      });

      const nextActivityDate = getNextActivityDate(activities);
      if (dateStr === nextActivityDate) {
        setAbsentees([...absentees, userName]);
      }
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('欠席提出エラー:', error); // 必要最低限のエラー出力
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    return activities[dateStr] ? 'activity-tile' : null;
  };

  const tileContent = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    return activities[dateStr] ? (
      <div style={{ backgroundColor: activities[dateStr].color, height: '100%' }} />
    ) : null;
  };

  return (
    <div className="calendar-page">
      <div className="absentees-list">
        <h3>次の活動日の欠席者</h3>
        {absentees.length > 0 ? (
          <ul>
            {absentees.map((absentee, index) => (
              <li key={index}>{absentee}</li>
            ))}
          </ul>
        ) : (
          <p>欠席者なし</p>
        )}
      </div>
      <div className="calendar-container">
        <Calendar
          onChange={setDate}
          value={date}
          tileClassName={tileClassName}
          tileContent={tileContent}
          onClickDay={handleDayClick}
          minDate={new Date()}
          maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
          view="month"
          navigation={true}
        />
      </div>
      {isConfirmOpen && (
        <Confirm
          message={`${selectedDate?.toLocaleDateString()} の欠席を提出しますか？`}
          onConfirm={handleSubmitAbsence}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
}

export default CalendarComponent;