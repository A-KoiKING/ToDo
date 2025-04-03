import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import { firestore } from "../firebase";
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import Confirm from "./Confirm";

function CalendarComponent({ initialUserName }) {
  const [date, setDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [activityDays, setActivityDays] = useState([]);
  const [userName] = useState(initialUserName);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [absentees, setAbsentees] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "activities"), (snapshot) => {
      const days = snapshot.docs
        .filter(doc => doc.data().active === true)
        .map(doc => doc.id)
        .filter(id => /^\d{4}-\d{2}-\d{2}$/.test(id));

      setActivityDays(days);
    });

    fetchAbsentees(new Date());

    return () => unsubscribe();
  }, []);

  const fetchAbsentees = async (selectedDate) => {
    const formattedDate = selectedDate.toLocaleDateString("en-CA");
    const docRef = doc(firestore, "activities", formattedDate);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setAbsentees(docSnap.data().users || []);
    } else {
      setAbsentees([]);
    }
  };

  const onChange = (newDate) => {
    setDate(newDate);
    fetchAbsentees(newDate);
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
      fetchAbsentees(date);
    } catch (error) {
      console.error("エラー:", error);
      setConfirmMessage("登録に失敗しました");
      setShowConfirm(true);
    }
  };

  const handleRemove = async () => {
    const formattedDate = date.toLocaleDateString("en-CA");
    const docRef = doc(firestore, "activities", formattedDate);

    try {
      await updateDoc(docRef, { users: arrayRemove(userName) });
      fetchAbsentees(date);
    } catch (error) {
      console.error("削除エラー:", error);
      setConfirmMessage("削除に失敗しました");
      setShowConfirm(true);
    }
  };

  const isActivityDay = activityDays.includes(date.toLocaleDateString("en-CA"));
  const isAbsent = absentees.includes(userName);

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
          showNeighboringMonth={false}
          tileClassName={({ date }) =>
            activityDays.includes(date.toLocaleDateString("en-CA")) ? "active-day" : ""
          }
        />
        {/* 欠席者一覧 & 欠席登録フォーム */}
        <div className="absence-container">
          {/* 欠席者一覧 */}
          <div className="absentees-list">
            <h3>{date.toLocaleDateString("ja-JP")} の欠席者</h3>
            {absentees.length > 0 ? (
              <ul>
                {absentees.map((absentee, index) => (
                  <li key={index}>{absentee}</li>
                ))}
              </ul>
            ) : (
              <p>欠席者はいません</p>
            )}
          </div>
          {/* 欠席登録フォーム */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (isAbsent) {
                setConfirmMessage(`${date.toLocaleDateString("ja-JP")} の欠席を削除しますか？`);
              } else {
                setConfirmMessage(`${date.toLocaleDateString("ja-JP")} の欠席を登録しますか？`);
              }
              setShowConfirm(true);
            }}
            className="absence-form"
          >
            <h3>{date.toLocaleDateString("ja-JP")} の欠席登録</h3>
            <p>ユーザー名: <strong>{userName}</strong></p>
            {isAbsent ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmMessage(`${date.toLocaleDateString("ja-JP")} の欠席を削除しますか？`);
                  setShowConfirm(true);
                }}
                className="deletebutton"
              >
                削除
              </button>
            ) : (
              <button type="submit" disabled={!isActivityDay}>
                提出
              </button>
            )}
          </form>
          {/* 確認ダイアログ */}
          {showConfirm && (
            <Confirm
              message={confirmMessage}
              onConfirm={() => {
                setShowConfirm(false);
                if (confirmMessage.includes("削除しますか？")) {
                  handleRemove();
                } else {
                  handleSubmit();
                }
              }}
              onCancel={() => setShowConfirm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarComponent;
