import React from 'react';
import { Link } from 'react-router-dom';
import femaleImg from '../assets/female.jpg';
import maleImg from '../assets/male.jpg';

const GenderCategories = () => {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Female Category */}
          <div className="relative group overflow-hidden rounded-lg">
            <Link to="/collection?category=female">
              <img 
                src={femaleImg} 
                alt="Female Collection" 
                className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white text-3xl font-bold tracking-wider">FEMALE</h3>
              </div>
            </Link>
          </div>
          
          {/* Male Category */}
          <div className="relative group overflow-hidden rounded-lg">
            <Link to="/collection?category=male">
              <img 
                src={maleImg} 
                alt="Male Collection" 
                className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white text-3xl font-bold tracking-wider">MALE</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderCategories;
