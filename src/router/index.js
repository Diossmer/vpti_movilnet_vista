import { createRouter, createWebHistory } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion'
import { storeToRefs } from 'pinia';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('@/views/errors/NotFoundView.vue')
    },
    {
      path: '/',
      name: 'home',component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
      params:{}
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('@/views/PerfilView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/salir',
      name: 'logout',
      meta: {
        requiresAuth: true,
        action: 'logout',
      }
    },
    {
      path: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        /* {
          path: '/sin-perifericos',
          name: 'dashboard.sin-perifericos',
          component: () => import('@/views/inventario/InventariosView.vue'),
          meta: { requiresAuth: true },
        }, */
        {
          path: '/despachos',
          name: 'dashboard.perifericos',
          component: () => import('@/views/inventario/PerifericosView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/evaluaciones',
          name: 'dashboard.evaluaciones',
          component: () => import('@/views/inventario/EvaluacionesView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/usuarios',
          name: 'dashboard.usuarios',
          component: () => import('@/views/administrativo/UsuariosView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/ubicaciones',
          name: 'dashboard.ubicaciones',
          component: () => import('@/views/inventario/UbicacionView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/asignaciones',
          name: 'dashboard.asignaciones',
          component: () => import('@/views/inventario/AsignacionView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path:'/estatus',
      meta: { requiresAuth: true },
      children:[
        //Administrativo
        {
          path: '',
          name: 'configuracion.estatus',
          component: () => import('@/components/config/EstatusConfig.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/roles',
          name: 'configuracion.roles',
          component: () => import('@/components/config/RolesConfig.vue'),
          meta: { requiresAuth: true },
        },
        //Inventario
        {
          path: '/productos',
          name: 'configuracion.productos',
          component: () => import('@/components/config/ProductosConfig.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/descripciones',
          name: 'configuracion.descripciones',
          component: () => import('@/components/config/DescripcionConfig.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
})

// Middleware de enrutamiento que se ejecuta antes de cada navegación
router.beforeEach(async(to, from, next) => {
  const store = useLoginStore();
  const { isAuthenticated, showExtensionDialog } = storeToRefs(store);
  const { salir } = store;

  if(showExtensionDialog.value){
    return false;
  }

  if(to.name === 'logout' && to.matched.some(record => record.meta.action)){
    try {
      // Llama a la acción de logout en el store
      await salir();
      // Redirige al usuario a la página de inicio de sesión
      await next({ name: 'home' });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      await next();
    }
  }else{
    // Si el usuario está autenticado y intenta acceder a la página de inicio de sesión
    if (to.name === 'home' && isAuthenticated.value) {
      await next({ name: 'dashboard' }); // Redirige al panel de control
    }
    // Si la ruta requiere autenticación y el usuario no está autenticado
    else if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated.value) {
      await next({ name: 'home' }); // Redirige a la página de inicio de sesión
    }
    // Si la ruta no existe, redirige a la página de error
    else if (!to.matched.length) {
      await next({ name: 'NotFound' });
    }
    // Permite el acceso a otras rutas
    else {
      await next();
    }
  }
});
export default router
