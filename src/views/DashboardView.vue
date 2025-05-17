<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion'
import { storeToRefs } from 'pinia'

// Servicios
import EstatusServicios from '@/components/services/administrativo/EstatusServicios';
import RolesServicios from '@/components/services/administrativo/RolesServicios';
import UsuariosServicios from '@/components/services/administrativo/UsuariosServicios';
import DescripcionServicios from '@/components/services/inventario/DescripcionServicios';
import ProductosServicios from '@/components/services/inventario/ProductosServicios';
import EvaluacionesServicios from '@/components/services/inventario/EvaluacionesServicios';
import InventariosServicios from '@/components/services/inventario/InventariosServicios';
import PerifericosServicios from '@/components/services/inventario/PerifericosServicios';
import UbicacionServicios from '@/components/services/inventario/UbicacionServicios';
import AsignacionServicios from '@/components/services/inventario/AsignacionServicios';

const router = useRouter();
const store = useLoginStore()
const { dataPerfil } = storeToRefs(store);

// Datos iniciales
const Inventario = ref({
  Productos: [],
  Descripciones: [],
  Ubicaciones: [],
  Asignaciones: [],
});

// Carga de datos
const loadData = async () => {
  try {
    Inventario.value.Productos = await ProductosServicios('fetchAll').then(res => res.mostrarT);
    Inventario.value.Descripciones = await DescripcionServicios('fetchAll').then(res => res.mostrarT);
    Inventario.value.Ubicaciones = await UbicacionServicios('fetchAll').then(res => res.mostrarT);
    Inventario.value.Asignaciones = await AsignacionServicios('fetchAll').then(res => res.mostrarT);
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

// Búsqueda
const searchQuery = ref('');
const filteredProductos = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  
  return Inventario.value.Productos.filter(producto => {
    const descripcion = Inventario.value.Descripciones.find(d => d.id === producto.id);
    const descripcionText = (typeof descripcion === 'object') 
      ? descripcion?.texto?.toLowerCase() || '' 
      : descripcion?.toLowerCase() || '';

    return (
      producto.id.toString().includes(query) ||  // Búsqueda numérica
      producto.nombre.toLowerCase().includes(query) ||  // Búsqueda textual
      descripcionText.includes(query)  // Búsqueda en descripción
    );
  });
});

// Helpers
const getUbicacion = (productoId) => Inventario.value.Ubicaciones.find(u => u.id === productoId) || 'sin ubicación';

const getAsignacion = (productoId) => Inventario.value.Asignaciones.find(a => a.id === productoId) || 'sin asignación';

// Navegación
const goBack = () => router.go(-1);

onMounted(async() => {
  await loadData();
});
</script>

<template>
  <div>
    <button @click="goBack" class="btn btn-outline-red-m btn-lg"><i class="bi bi-arrow-left-circle"></i> Regresar</button>
    <span class="badge fs-1"><i class="bi bi-search mr-3"></i> Buscador De Inventario</span>
    <hr class="border-5 border-red-m opacity-75">
    <div class="card w-100">
      <div class="card-body p-5">
        <div class="min-h-screen bg-gray-100 p-6">
         
          <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded shadow-lg p-6 mb-8">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar productos por nombre o numero de búsqueda..."
                  class="form-control pe-5"
                  style="padding-right: 2.5rem; border-radius: 0.5rem;"
                >
                <i class="bi bi-search ubicacion"></i>
              </div>
            </div>
          </div>

            <div class="space-y-4">
              <div v-for="producto in filteredProductos" :key="producto.id" class="bg-white shadow-md p-6 hover:shadow-lg transition-shadow">
                <div class="flex justify-between items-start mb-4">
                  <h2 class="text-xl font-semibold text-gray-800">{{ producto.nombre }}</h2>
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Número de Búsqueda: <b>{{ producto.id }}</b>
                  </span>
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Estatus: <b>{{ producto.estatus?.nombre }}</b>
                  </span>
                </div>

                <div class="row">
                  <div class="col-6">
                    <p class="fw-bolder">Descripción:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <div class="mt-1 row" v-for="(d, i) in Inventario.Descripciones" :key="i">
                      <p class="col-6">id <strong class="text-red-600">{{ d.id || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">talla <strong class="text-red-600">{{ d.talla || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">modelo <strong class="text-red-600">{{ d.modelo || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">color <strong class="text-red-600">{{ d.color || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">tamaño <strong class="text-red-600">{{ d.tamaño || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">textura <strong class="text-red-600">{{ d.textura || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">sku <strong class="text-red-600">{{ d.sku || 'Sin descripción' }}</strong></p>
                      <p class="col-12">observacion <strong class="text-red-600">{{ d.observacion || 'Sin descripción' }}</strong></p> 
                    </div>
                  </div>

                  <div class="col-6">
                    <p class="fw-bolder">Ubicación:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row">
                      <p class="col-6">id <strong class="text-red-600">{{ getUbicacion(producto.id).id || 'sin ubicación' }}</strong></p>
                      <p class="col-6">origen <strong class="text-red-600">{{ getUbicacion(producto.id).origen || 'sin ubicación' }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getUbicacion(producto.id).destino || 'sin ubicación' }}</strong></p>
                      <p class="col-6">piso <strong class="text-red-600">{{ getUbicacion(producto.id).piso || 'sin ubicación' }}</strong></p>
                      <p class="col-6">region <strong class="text-red-600">{{ getUbicacion(producto.id).region || 'sin ubicación' }}</strong></p>
                      <p class="col-6">estado <strong class="text-red-600">{{ getUbicacion(producto.id).estado || 'sin ubicación' }}</strong></p>
                      <p class="col-6">capital <strong class="text-red-600">{{ getUbicacion(producto.id).capital || 'sin ubicación' }}</strong></p>
                      <p class="col-6">escuela <strong class="text-red-600">{{ getUbicacion(producto.id).escuela || 'sin ubicación' }}</strong></p>
                    </p>
                  </div>
                  <div class="col-6">
                    <p class="fw-bolder">Asignación:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row">
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).id || 'sin asignación' }}</strong></p>
                      <p class="col-6">fecha asignar <strong class="text-red-600">{{ getAsignacion(producto.id).fecha_asignar || 'sin asignación' }}</strong></p>
                      <p class="col-6">fecha_devolucion <strong class="text-red-600">{{ getAsignacion(producto.id).fecha_devolucion || "Sin devolución" || 'sin asignación' }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getAsignacion(producto.id).destino || 'sin asignación' }}</strong></p>
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).comentario || 'sin asignación' }}</strong></p>
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).usuario?.nombre || 'sin asignación' }}</strong></p>
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).usuario?.apellido || 'sin asignación' }}</strong></p>
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).usuario?.cedula || 'sin asignación'}}</strong></p>
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).usuario?.usuario || 'sin asignación' }}</strong></p>
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).usuario?.correo || 'sin asignación' }}</strong></p>
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).usuario?.telefono_celular || 'sin asignación' }}</strong></p>
                      <p class="col-6">id <strong class="text-red-600">{{ getAsignacion(producto.id).usuario?.telefono_alternativo || 'sin asignación' }}</strong></p>
                    </p>
                  </div>
                </div>
              </div>

              <div 
                v-if="filteredProductos.length === 0 && searchQuery"
                class="text-center py-12 bg-white rounded-lg"
              >
                <i class="bi bi-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <p class="text-gray-600">No se encontraron resultados para "{{ searchQuery }}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
.btn-outline-red-m {
  border-color: var(--institucional-m-gris-claro);
  color: var(--institucional-m-gris-claro);
}

.btn-outline-red-m:hover {
  background-color: var(--institucional-m-gris-claro);
  color: var(--institucional-m-cerezo);
}
.border-red-500 {
  border-color: var(--institucional-m-cerezo);
}

.text-red-600 {
  color: var(--institucional-m-cerezo);
}

.hover\:text-red-800:hover {
  color: var(--institucional-m-cerezo-oscuro);
}

.ubicacion{
  position: absolute;
  top: 66px;
  font-size: x-large;
  right: 60px;
  transform: translateY(-50%);
  color: var(--institucional-m-blanco);
}

.rounded{
  border-radius: 15% !important;
}
</style>