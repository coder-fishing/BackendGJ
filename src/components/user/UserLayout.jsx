import React from 'react';
import { Outlet } from 'react-router-dom';
import UserHeader from './UserHeader';
import '../../styles/user/layout.scss';

const UserLayout = () => {
  return (
    <div className="user-layout">
      <UserHeader />
      <main className="user-main">
        <div className="user-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout; 