import React from 'react';
import { Outlet } from 'react-router-dom';
import UserHeader from './UserHeader';
import '../../styles/user/layout.scss';

const UserLayout = () => {
  return (
    <div className="user-layout">
      <UserHeader />
      
          <Outlet />
        
    </div>
  );
};

export default UserLayout; 