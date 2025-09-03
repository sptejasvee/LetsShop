import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SearchBar from './SearchBar';
import PageTransition from './PageTransition';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SearchBar />
      <main className="flex-grow pt-24 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pb-12">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
