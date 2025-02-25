import React, { useState, useEffect } from 'react';
import { SidebarData } from './SidebarData';

function Sidebar({ userName, handleLogout }) {
  const [activeLink, setActiveLink] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveLink(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="Sidebar">
      <p className="p">ユーザー名</p>
      <label className="label">{userName}</label>
      <button onClick={handleLogout} className="button">ログアウト</button>
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
    </div>
  );
}

export default Sidebar;
