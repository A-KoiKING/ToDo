import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import { firestore } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import Confirm from "./Confirm";
import TextConfirm from "./TextConfirm";

function CalendarComponent({ initialUserName }) {
  const [date, setDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [activityDays, setActivityDays] = useState([]);
  const [userName] = useState(initialUserName);
  const [absentees, setAbsentees] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [textConfirmOpen, setTextConfirmOpen] = useState(false);
  const [authGranted, setAuthGranted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(false);


  // 活動日一覧を取得
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "activities"), (snapshot) => {
      const days = snapshot.docs
        .filter(doc => doc.data().active === true)
        .map(doc => doc.id)
        .filter(id => /^\d{4}-\d{2}-\d{2}$/.test(id));
      setActivityDays(days);
    });

    return () => unsubscribe();
  }, []);

  // 選択した日の欠席者と活動日状態を取得
  useEffect(() => {
    const formattedDate = date.toLocaleDateString("en-CA");
    const docRef = doc(firestore, "activities", formattedDate);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAbsentees(data.users || []);
        setIsActive(data.active === true);
      } else {
        setAbsentees([]);
        setIsActive(false);
      }
    });

    return () => unsubscribe();
  }, [date]);

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
    const formattedDate = date.toLocaleDateString("en-CA");
    const docRef = doc(firestore, "activities", formattedDate);
    await setDoc(docRef, { users: arrayUnion(userName) }, { merge: true });
  };

  const handleRemove = async () => {
    const formattedDate = date.toLocaleDateString("en-CA");
    const docRef = doc(firestore, "activities", formattedDate);
    await updateDoc(docRef, { users: arrayRemove(userName) });
  };

  const isAbsent = absentees.includes(userName);

  return (
    <div className="calendar-container">
      <div className="calendar-background">
        {/* カスタムナビゲーション */}
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

        {/* パスワード認証用ボタン */}
        <div className="activity-setup-button-container">
          {!authGranted && (
            <button className="activity-setup-button" onClick={() => setTextConfirmOpen(true)}>
              活動ステータスを編集
            </button>
          )}
        </div>

        {/* カレンダー表示 */}
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

        {/* 活動ステータスの変更ドロップダウン */}
        {authGranted && (
          <div className="activity-status-dropdown">
            <label>活動ステータス: </label>
            <select
              value={isActive ? "active" : "inactive"}
              onChange={async (e) => {
                const newStatus = e.target.value === "active";
                const formattedDate = date.toLocaleDateString("en-CA");
                const docRef = doc(firestore, "activities", formattedDate);

                try {
                  await setDoc(docRef, { active: newStatus }, { merge: true });
                  setIsActive(newStatus);
                } catch (error) {
                  console.error("活動ステータス更新エラー:", error);
                }
              }}
            >
              <option value="active">活動日</option>
              <option value="inactive">非活動日</option>
            </select>
          </div>
        )}

        {/* 欠席登録フォームと一覧 */}
        <div className="absence-container">
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

          <form
            onSubmit={(event) => {
              event.preventDefault();
              isAbsent ? handleRemove() : handleSubmit();
            }}
            className="absence-form"
          >
            <h3>{date.toLocaleDateString("ja-JP")} の欠席登録</h3>
            <p>ユーザー名: <strong>{userName}</strong></p>
            {isAbsent ? (
              <button
                type="button"
                onClick={() => {
                  setPendingRemove(true);
                  setConfirmOpen(true);
                }}
                className="deletebutton"
              >
                削除
              </button>
            ) : (
              <button type="submit" disabled={!isActive}>
                提出
              </button>
            )}
          </form>
        </div>

        {/* パスワード入力ダイアログ */}
        <TextConfirm
          open={textConfirmOpen}
          onCancel={() => setTextConfirmOpen(false)}
          onConfirm={() => {
            setTextConfirmOpen(false);
            setAuthGranted(true);
          }}
        />

        {confirmOpen && (
          <Confirm
            message="欠席者登録を削除しますか？"
            onConfirm={async () => {
              await handleRemove();
              setConfirmOpen(false);
              setPendingRemove(false);
            }}
            onCancel={() => {
              setConfirmOpen(false);
              setPendingRemove(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default CalendarComponent;
