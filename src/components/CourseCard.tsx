import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Converter preços para números
  const coursePrice = typeof course.price === 'number' ? course.price : parseFloat(course.price) || 0;
  const originalPrice = course.originalPrice 
    ? (typeof course.originalPrice === 'number' ? course.originalPrice : parseFloat(course.originalPrice) || 0)
    : null;
  
  const discount = originalPrice && originalPrice > coursePrice
    ? Math.round(((originalPrice - coursePrice) / originalPrice) * 100)
    : 0;

  // Garantir que o ID existe antes de criar o link
  const courseId = course.id || course._id;
  
  if (!courseId) {
    console.error('CourseCard: curso sem ID', course);
    return null; // Não renderiza se não tiver ID
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <Link to={`/curso/${courseId}`}>
        <div className="relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{discount}%
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            {course.level}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={course.instructorAvatar}
              alt={course.instructor}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-600">{course.instructor}</span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
            {course.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">{course.rating || '0.0'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{(course.totalStudents || 0).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {originalPrice && originalPrice > coursePrice && (
                <span className="text-sm text-gray-400 line-through mr-2">
                  R$ {originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-bold text-primary-600">
                R$ {coursePrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
