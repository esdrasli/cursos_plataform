import axios from 'axios';

// Configuração da URL da API
// IMPORTANTE: 
// - Em desenvolvimento: usa o proxy do Vite (/api) que redireciona para backend:3001
// - Em produção com Docker/nginx: usa /api (nginx faz proxy para backend:3001)
// - Em produção sem nginx (ex: Hostinger): usa VITE_API_URL do .env.production
const getApiUrl = () => {
  // 1. Se houver VITE_API_URL definida (produção sem nginx), usar ela
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // Ignorar se contém nome de serviço Docker (não funciona no navegador)
    if (envUrl.includes('backend:') || envUrl.includes('backend/')) {
      console.warn('⚠️ VITE_API_URL contém nome de serviço Docker, usando proxy');
      return '/api';
    }
    
    // Corrigir Mixed Content: se a página está em HTTPS, garantir que a API também use HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      // Se a URL da API está em HTTP, converter para HTTPS
      if (envUrl.startsWith('http://')) {
        const httpsUrl = envUrl.replace('http://', 'https://');
        console.warn('⚠️ Convertendo URL da API de HTTP para HTTPS:', envUrl, '→', httpsUrl);
        return httpsUrl;
      }
    }
    
    // URL válida para produção (ex: https://api.exemplo.com/api)
    return envUrl;
  }
  
  // 2. Em desenvolvimento ou produção com nginx: usar o proxy (/api)
  // - Desenvolvimento: proxy do Vite redireciona /api para backend:3001
  // - Produção com nginx: nginx redireciona /api para backend:3001
  // Isso funciona perfeitamente no navegador
  return '/api';
};

// Função utilitária para obter a URL base completa da API
// Usada quando precisamos construir URLs completas (ex: para imagens)
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Se VITE_API_URL está definida e é uma URL válida, usar ela
  if (envUrl && !envUrl.includes('backend:') && !envUrl.includes('backend/')) {
    // Remover /api do final se existir, pois vamos adicionar depois
    return envUrl.replace(/\/api\/?$/, '');
  }
  
  // Em desenvolvimento, usar localhost:3001
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // Em produção com nginx ou sem nginx, usar o domínio atual
  // O nginx faz proxy de /api para backend:3001, então URLs relativas funcionam
  // Se precisar de URL absoluta, usar window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback (SSR ou ambiente sem window)
  return '';
};

const API_URL = getApiUrl();

// Log para debug
console.log('🔧 API URL configurada:', API_URL);
console.log('🔧 API Base URL:', getApiBaseUrl());

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Exportar api para uso em componentes de upload
export { api };

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação e melhorar mensagens de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar diferentes tipos de erros
    if (error.response) {
      // Erro da API com resposta
      const status = error.response.status;
      const message = error.response.data?.message || 'Erro desconhecido';

      switch (status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          error.message = 'Sua sessão expirou. Por favor, faça login novamente.';
          break;
        case 403:
          error.message = 'Você não tem permissão para realizar esta ação.';
          break;
        case 404:
          error.message = message || 'Recurso não encontrado.';
          break;
        case 422:
          error.message = message || 'Dados inválidos. Verifique os campos e tente novamente.';
          break;
        case 500:
          error.message = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        default:
          error.message = message || 'Ocorreu um erro. Tente novamente.';
      }
    } else if (error.request) {
      // Erro de rede (sem resposta do servidor)
      console.error('Erro de rede:', error.request);
      console.error('URL tentada:', error.config?.url);
      console.error('Base URL:', error.config?.baseURL);
      error.message = 'Erro de conexão. Verifique sua internet e tente novamente.';
    } else {
      // Outro tipo de erro
      error.message = error.message || 'Ocorreu um erro inesperado.';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Courses API
export const coursesAPI = {
  getAll: async (params?: { search?: string; category?: string; level?: string; page?: number; limit?: number }) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/courses', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
  getMyCourses: async () => {
    const response = await api.get('/courses/creator/my-courses');
    return response.data;
  },
};

      // Checkout API
      export const checkoutAPI = {
        getCourseInfo: async (courseId: string) => {
          const response = await api.get(`/checkout/course/${courseId}`);
          return response.data;
        },
        process: async (data: { courseId: string; paymentMethod: string; paymentData?: any; affiliateCode?: string }) => {
          const response = await api.post('/checkout/process', data);
          return response.data;
        },
        createCheckoutSession: async (data: { courseId: string; affiliateCode?: string }) => {
          const response = await api.post('/checkout/create-checkout-session', data);
          return response.data;
        },
        getSessionStatus: async (sessionId: string) => {
          const response = await api.get(`/checkout/session-status?session_id=${sessionId}`);
          return response.data;
        },
      };

// Affiliate API
export const affiliateAPI = {
  register: async (data: { name: string; email: string; paymentInfo?: string }) => {
    const response = await api.post('/affiliate/register', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/affiliate/me');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/affiliate/stats');
    return response.data;
  },
  getSales: async () => {
    const response = await api.get('/affiliate/sales');
    return response.data;
  },
  getCourses: async () => {
    const response = await api.get('/affiliate/courses');
    return response.data;
  },
  getLink: async (courseId: string) => {
    const response = await api.get(`/affiliate/link/${courseId}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getMyCourses: async () => {
    const response = await api.get('/dashboard/my-courses');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/dashboard/recommendations');
    return response.data;
  },
};

// Learning API
export const learningAPI = {
  getCourse: async (courseId: string) => {
    const response = await api.get(`/learning/course/${courseId}`);
    return response.data;
  },
  completeLesson: async (data: { courseId: string; moduleId: string; lessonId: string }) => {
    const response = await api.post('/learning/complete-lesson', data);
    return response.data;
  },
  getProgress: async (courseId: string) => {
    const response = await api.get(`/learning/progress/${courseId}`);
    return response.data;
  },
};

// Branding API
export const brandingAPI = {
  getMyBranding: async () => {
    const response = await api.get('/branding/me');
    return response.data;
  },
  getBrandingByCreator: async (creatorId: string) => {
    const response = await api.get(`/branding/creator/${creatorId}`);
    return response.data;
  },
  updateBranding: async (data: any) => {
    const response = await api.post('/branding/me', data);
    return response.data;
  },
  uploadLogo: async (logoUrl: string, type: 'light' | 'dark' = 'light') => {
    const response = await api.post('/branding/me/logo', { logoUrl, type });
    return response.data;
  },
};

// Creator API
export const creatorAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/creator/dashboard/stats');
    return response.data;
  },
  getCoursesStats: async () => {
    const response = await api.get('/creator/courses/stats');
    return response.data;
  },
  getSales: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/creator/sales', { params });
    return response.data;
  },
  getStudents: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/creator/students', { params });
    return response.data;
  },
  getLandingPages: async () => {
    const response = await api.get('/creator/landing-pages');
    return response.data;
  },
  getLandingPage: async (id: string) => {
    const response = await api.get(`/creator/landing-pages/${id}`);
    return response.data;
  },
  createLandingPage: async (data: any) => {
    const response = await api.post('/creator/landing-pages', data);
    return response.data;
  },
  updateLandingPage: async (id: string, data: any) => {
    const response = await api.put(`/creator/landing-pages/${id}`, data);
    return response.data;
  },
  deleteLandingPage: async (id: string) => {
    const response = await api.delete(`/creator/landing-pages/${id}`);
    return response.data;
  },
  generateAIContent: async (data: { prompt: string; courseTitle?: string; courseDescription?: string }) => {
    const response = await api.post('/creator/ai/generate-content', data);
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadVideo: async (file: File, courseId: string, lessonNumber: number) => {
    // Garantir que courseId é uma string válida
    const courseIdStr = String(courseId || '').trim();
    const lessonNumberStr = String(lessonNumber || '').trim();
    
    console.log('📤 API - Preparando upload de vídeo:', {
      courseId: courseIdStr,
      lessonNumber: lessonNumberStr,
      courseIdLength: courseIdStr.length,
      lessonNumberLength: lessonNumberStr.length
    });
    
    if (!courseIdStr || courseIdStr === '') {
      throw new Error('courseId é obrigatório e não pode estar vazio');
    }
    
    if (!lessonNumberStr || lessonNumberStr === '') {
      throw new Error('lessonNumber é obrigatório e não pode estar vazio');
    }
    
    const formData = new FormData();
    formData.append('video', file);
    formData.append('courseId', courseIdStr);
    formData.append('lessonNumber', lessonNumberStr);
    
    console.log('📤 API - FormData criado:', {
      hasVideo: formData.has('video'),
      hasCourseId: formData.has('courseId'),
      hasLessonNumber: formData.has('lessonNumber')
    });
    
    const response = await api.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Config API
export const configAPI = {
  getAll: async () => {
    const response = await api.get('/config');
    return response.data;
  },
  getByKey: async (key: string) => {
    const response = await api.get(`/config/${key}`);
    return response.data;
  },
  set: async (key: string, value: any, type?: string, description?: string, category?: string) => {
    const response = await api.post('/config', { key, value, type, description, category });
    return response.data;
  },
  update: async (key: string, value: any, type?: string, description?: string, category?: string) => {
    const response = await api.put(`/config/${key}`, { value, type, description, category });
    return response.data;
  },
  delete: async (key: string) => {
    const response = await api.delete(`/config/${key}`);
    return response.data;
  },
};

export default api;

