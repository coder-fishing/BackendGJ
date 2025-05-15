import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployerHeader from './EmployerHeader';
import '../../styles/employer/layout.scss';

const EmployerLayout = () => {
  return (
    <div className="employer-layout">
      <EmployerHeader />
      <main className="employer-main">
        <div className="employer-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployerLayout; 