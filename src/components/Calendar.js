import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import { firestore } from "../firebase";
import { collection, getDocs, doc, setDoc, arrayUnion } from "firebase/firestore";
import Confirm from "./Confirm";

function CalendarComponent({ initialUserName }) {
  const [date, setDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [activityDays, setActivityDays] = useState([]);
  const [userName] = useState(initialUserName);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchActivityDays = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "activities"));
        const days = querySnapshot.docs
          .map((doc) => {
            const id = doc.id;
            return /^\d{4}-\d{2}-\d{2}$/.test(id) ? id : null;
          })
          .filter((day) => day !== null);

        if (mounted) {
          setActivityDays(days);
        }
      } catch (error) {
        console.error("活動日の取得エラー:", error);
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
    const currentDate = new Date();
    const maxMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

    if (viewDate < maxMonth) {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const handlePrevMonth = () => {
    const currentDate = new Date();
    const minMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    if (viewDate > minMonth) {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };


  const handleSubmit = async () => {
    if (!userName.trim()) {
      setConfirmMessage("ログイン情報がありません");
      setShowConfirm(true);
      return;
    }

    const formattedDate = date.toLocaleDateString("en-CA");
    const docRef = doc(firestore, "activities", formattedDate);

    try {
      await setDoc(docRef, { users: arrayUnion(userName) }, { merge: true });
    } catch (error) {
      console.error("エラー:", error);
      setConfirmMessage("登録に失敗しました");
      setShowConfirm(true);
    }
  };


  const tileClassName = ({ date }) => {
    const formattedDate = date.toLocaleDateString("en-CA");
    return activityDays.includes(formattedDate) ? "active-day" : "";
  };

  return (
    <div className="calendar-container">
      <div className="calendar-background">
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
            disabled={viewDate.getFullYear() === new Date().getFullYear() && viewDate.getMonth() === new Date().getMonth() + 1}
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
          formatShortWeekday={(locale, date) => ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]}
        />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setConfirmMessage(`${date.toLocaleDateString("ja-JP")} の欠席を登録しますか？`);
            setShowConfirm(true);
          }}
          className="absence-form"
        >
          <h3>{date.toLocaleDateString("ja-JP")} の欠席登録</h3>
          <p>ユーザー名: <strong>{userName}</strong></p>
          <button type="submit">提出</button>
        </form>
        {/* 確認ダイアログ */}
        {showConfirm && (
          <Confirm
            message={confirmMessage}
            onConfirm={() => {
              setShowConfirm(false);
              if (confirmMessage.includes("登録しますか？")) {
                handleSubmit();
              }
            }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default CalendarComponent;
