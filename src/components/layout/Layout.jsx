import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-64 transition-all duration-300 ease-in-out">
        <Header />

        <main className="py-6 relative z-10">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;