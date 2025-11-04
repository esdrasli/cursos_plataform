import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import CourseLearningPage from './pages/CourseLearningPage';
import LoginPage from './pages/LoginPage';
import CreatorLayout from './layouts/CreatorLayout';
import CreatorDashboardPage from './pages/creator/CreatorDashboardPage';
import CreatorCoursesPage from './pages/creator/CreatorCoursesPage';
import CreatorSalesPage from './pages/creator/CreatorSalesPage';
import CreatorStudentsPage from './pages/creator/CreatorStudentsPage';
import CreatorSettingsPage from './pages/creator/CreatorSettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cursos" element={<CoursesPage />} />
        <Route path="/curso/:id" element={<CourseDetailPage />} />
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/aprender/:courseId" element={<CourseLearningPage />} />

        {/* Rotas da Área do Criador */}
        <Route path="/creator" element={<CreatorLayout />}>
          <Route index element={<CreatorDashboardPage />} />
          <Route path="courses" element={<CreatorCoursesPage />} />
          <Route path="sales" element={<CreatorSalesPage />} />
          <Route path="students" element={<CreatorStudentsPage />} />
          <Route path="settings" element={<CreatorSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
