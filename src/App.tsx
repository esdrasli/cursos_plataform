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
import CreatorPagesListPage from './pages/creator/CreatorPagesListPage';
import CreatorPageEditor from './pages/creator/CreatorPageEditor';
import LandingPageViewPage from './pages/creator/LandingPageViewPage';
import CreatorCourseEditor from './pages/creator/CreatorCourseEditor';
import AffiliateDashboardPage from './pages/AffiliateDashboardPage';
import AffiliateRegisterPage from './pages/AffiliateRegisterPage';
import CartPage from './pages/CartPage';
import CategoriesPage from './pages/CategoriesPage';
import ForBusinessPage from './pages/ForBusinessPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cursos" element={<CoursesPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/empresas" element={<ForBusinessPage />} />
        <Route path="/curso/:id" element={<CourseDetailPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/checkout/:id" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/aprender/:courseId" element={<ProtectedRoute><CourseLearningPage /></ProtectedRoute>} />
        
        {/* Rotas de Afiliado */}
        <Route path="/affiliate" element={<ProtectedRoute><AffiliateDashboardPage /></ProtectedRoute>} />
        <Route path="/affiliate/register" element={<ProtectedRoute><AffiliateRegisterPage /></ProtectedRoute>} />

        {/* Rotas da Área do Criador - Acessível para todos os usuários autenticados */}
        <Route path="/creator" element={<ProtectedRoute><CreatorLayout /></ProtectedRoute>}>
          <Route index element={<CreatorDashboardPage />} />
          <Route path="courses" element={<CreatorCoursesPage />} />
          <Route path="courses/new" element={<CreatorCourseEditor />} />
          <Route path="courses/edit/:courseId" element={<CreatorCourseEditor />} />
          <Route path="sales" element={<CreatorSalesPage />} />
          <Route path="students" element={<CreatorStudentsPage />} />
          <Route path="pages" element={<CreatorPagesListPage />} />
          <Route path="pages/view/:pageId" element={<LandingPageViewPage />} />
          <Route path="pages/edit/:pageId" element={<CreatorPageEditor />} />
          <Route path="pages/new" element={<CreatorPageEditor />} />
          <Route path="settings" element={<CreatorSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
