<script setup>
import { RouterLink, RouterView } from 'vue-router'
import usuarioPng from './assets/img/usuario.png';
import { onMounted, ref, computed } from 'vue';
import TemplateView from './views/template/TemplateView.vue';
import LoadingHelper from '@/components/LoadingComponents.vue';
import SessionAlertComponents from './components/SessionAlertComponents.vue';
import imglogo from './assets/img/logo.png';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
const store = useLoginStore()
const { isAuthenticated, dataPerfil } = storeToRefs(store)

onMounted(async()=>{
  isAuthenticated.value = localStorage.getItem('ingresar') === 'true'
})
const includedModulesAdmin = ref(['usuarios']);
const includedModulesInven = ref(['sin-perifericos', 'perifericos', 'evaluaciones', 'asignaciones', 'ubicaciones']);
const includedModulesConfi = ref(['estatus', 'roles', 'productos', 'descripciones']);
</script>
<template>
  <TemplateView v-if="isAuthenticated">
    <template #navbar>
      <div class="logo w-50">
        <routerLink to='dashboard' class="badge fs-4"><img :src="imglogo" alt="Movilnet" class="imglogo" :srcset="imglogo"></routerLink >
      </div>
      <nav class="menu_nav" aria-label="Navegación principal">
        <a class="btn coloresDefault" type="button" data-bs-toggle="dropdown" data-bs-target="#navbarNavDarkDropdown" aria-expanded="false" aria-label="Toggle navigation">
          Menu
        </a>
        <div class="">
          <ul class="menu_ul">
            <li class="dropdown-center">
              <ul class="dropdown-menu">
                <li class="menu_li">
                  <RouterLink to="perfil" class="">perfil👤</RouterLink>
                </li>
                <!-- <li class="menu_li">
                  <RouterLink to="organigrama" class="">organigrama📊</RouterLink>
                </li> -->
                <!-- <li class="menu_li">
                  <RouterLink to="archivos" class="">archivos📁</RouterLink>
                </li> -->
                <!-- <li class="menu_li">
                  <RouterLink to="ayuda" class="">Ayuda❗</RouterLink>
                </li> -->
                <li class="menu_li">
                  <RouterLink to="salir" class="">salir🚪</RouterLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </template>
    <template #sidebar>
      <div class="sidebar" v-show="true">
        <div class="panel-user">
          <img :src="usuarioPng" alt="usuario imagen perfil" aria-placeholder="usuario" class="img">
          <span class="badge fs-6">{{ dataPerfil?.nombre }} {{ dataPerfil?.apellido }}</span>
          <span class="badge fs-6">rol: {{ dataPerfil?.rol?.nombre }}</span>
        </div>
        <div class="administrativo">
          <ul class="panelnav_ul" >
            <li class="panelnav_li">
              <RouterLink to="dashboard" class="btn p-0"><span class="fs-5"><i class="bi bi-pc-display-horizontal"></i> Panel de control</span></RouterLink>
            </li>
            <li class="panelnav_li" :hidden="includedModulesAdmin?.length<=0" v-if="dataPerfil?.rol.id !== 2 && dataPerfil?.rol.id !== 4">
              <span class="fs-5"><i class="bi bi-person-workspace"></i> Administrativo</span>
              <ul class="panel_nav_ul">
                <li class="panel_nav_li" v-for="(modulo,index) in includedModulesAdmin" :key="index">
                  <RouterLink :to="modulo" class="">
                    <i class="bi bi-people" v-if="modulo === 'usuarios'"></i>
                    {{ modulo }}</RouterLink>
                </li>
              </ul>
            </li>
            <li class="panelnav_li" :hidden="includedModulesInven?.length<=0">
              <span class="fs-5"><i class="bi bi-calendar2-event"></i> Inventario</span>
              <ul class="panel_nav_ul">
                <li class="panel_nav_li" v-for="(modulo,index) in includedModulesInven" :key="index">
                  <RouterLink :to="modulo" class=""
                    v-if="!(modulo ==='evaluaciones' && dataPerfil?.rol.id === 3)">
                    <i class="bi bi-box-seam" v-if="modulo ==='perifericos'"></i>
                    <i class="bi bi-box2" v-if="modulo ==='sin-perifericos'"></i>
                    <i class="bi bi-geo-fill" v-if="modulo ==='ubicaciones'"></i>
                    <i class="bi bi-hand-thumbs-up" v-if="modulo ==='evaluaciones'"></i>
                    <i class="bi bi-person-badge-fill" v-if="modulo ==='asignaciones'"></i>
                    {{ modulo }}</RouterLink>
                </li>
              </ul>
            </li>
            <li class="panelnav_li" :hidden="configuración?.length <= 0" v-if="dataPerfil?.rol.id !== 2">

              <span class="fs-5"><i class="bi bi-nut"></i> Configuración</span>

              <ul class="panel_nav_ul">
                <li class="panel_nav_li" v-for="(modulo,index) in includedModulesConfi" :key="modulo.id">
                  <RouterLink :to="modulo" class=""
                    v-if="!(modulo ==='estatus' && (dataPerfil?.rol.id === 3 || dataPerfil?.rol.id === 4)) && !(modulo ==='roles' && (dataPerfil?.rol.id === 3 || dataPerfil?.rol.id === 4))">
                    <i class="bi bi-person-arms-up" v-if="modulo === 'estatus'"></i>
                    <i class="bi bi-gear-wide-connected" v-if="modulo === 'roles'"></i>
                    <i class="bi bi-journal-check" v-if="modulo ==='productos'"></i>
                    <i class="bi bi-person-raised-hand" v-if="modulo ==='descripciones'"></i>
                    {{ modulo }}
                  </RouterLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </template>
    <template #aside>
    </template>
      <template #default>
        <SessionAlertComponents />
        <RouterView v-slot="{ Component }">
          <Suspense>
            <component :is="Component" />
            <template #fallback>
              <LoadingHelper />
            </template>
          </Suspense>
        </RouterView>
      </template>
    <template #footer>
      <span>Caracas venezuela 2025 ©Todos los derechos reservados</span>
    </template>
  </TemplateView>
  <RouterView v-else />
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>