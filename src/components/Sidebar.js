// Sidebar.js
import React, { useState, useEffect } from 'react';
import { SidebarData } from './SidebarData';
import Confirm from './Confirm';

function Sidebar({ userName, handleLogout }) {
  const [activeLink, setActiveLink] = useState(window.location.hash);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveLink(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const confirmLogout = () => {
    handleLogout();
    setIsConfirmOpen(false);
  };

  const cancelLogout = () => {
    setIsConfirmOpen(false);
  };

  return (
    <div className="Sidebar">
      <p className="Sidebar-p">ユーザー名</p>
      <label className="Sidebar-label">{userName}</label>
      <button
        onClick={() => setIsConfirmOpen(true)} 
        className="Sidebar-button"
      >
        ログアウト
      </button>
      <ul className="SidebarList">
        {SidebarData.map((value, key) => (
          <li
            key={key}
            className={`row ${activeLink === value.link ? "active" : ""}`}
            onClick={() => { window.location.hash = value.link; }}
          >
            <div id="icon">{value.icon}</div>
            <div id="title">{value.title}</div>
          </li>
        ))}
      </ul>

      {isConfirmOpen && (
        <Confirm
          message="本当にログアウトしますか？"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
    </div>
  );
}

export default Sidebar;