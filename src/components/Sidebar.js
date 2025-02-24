import React from 'react'
import { SidebarData } from './SidebarData'

function Sidebar({
    userName, 
    handleLogout, 
}) {
  return (
    <div className='Sidebar'>
        <label className="label">{userName}</label>
        <button onClick={handleLogout} className="button">ログアウト</button>
        <ul className='SidebarList'>
            {SidebarData.map((value, key) => {
                return (
                    <li 
                        key={key} 
                        id={window.location.pathname === value.link ? "active" : ""}
                        className='row'
                        onClick={() => {
                            window.location.pathname = value.link
                        }}
                    >
                            <div id='icon'>{value.icon}</div>
                            <div id='title'>{value.title}</div>
                    </li>
                )
            })}
        </ul>

    </div>
  )
}

export default Sidebar
