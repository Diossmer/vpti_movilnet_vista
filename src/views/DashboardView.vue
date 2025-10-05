<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion'
import { storeToRefs } from 'pinia'
import BuscadorServices from '@/components/services/BuscadorServices';
import PrincipalModal from '@/components/modales/PrincipalModal.vue';

// Servicios
const router = useRouter();
const store = useLoginStore()
const { dataPerfil } = storeToRefs(store);

const Inventario = ref({
  Productos: [],
});

const searchQuery = ref('');
const isLoading = ref(true);
const isLoadingImport = ref(false);
const response = ref(null);

const handleData = async (action = null, params = null) => {
  try {
    isLoading.value = true;
    if (action === 'create') {
      isLoadingImport.value = true
      response.value = await BuscadorServices(action, null, params)
    }
    
    // Traer todos los productos y asignarlos
    const { mostrarT } = await BuscadorServices('fetchAll');
    Inventario.value.Productos = mostrarT || [];
  } catch (error) {
    console.error('Error al manejar los datos:', error);
    Inventario.value.Productos = [];
  } finally {
    isLoadingImport.value = false;
    isLoading.value = false;
  }
};

const filteredProductos = computed(() => {
  if (isLoading.value) {
    return []; 
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) {
    // Si no hay búsqueda, mostramos todos los productos con todas sus descripciones
    return Inventario.value.Productos; 
  }

  const results = [];

  Inventario.value.Productos.forEach(producto => {
    // 1. Verificar si hay coincidencia con las propiedades del PRODUCTO (ID, nombre, estatus)
    const matchByProduct = 
      producto.id.toString().includes(query) || 
      producto.nombre.toLowerCase().includes(query) ||
      producto?.usuario?.nombre?.toLowerCase().includes(query) ||
      producto?.usuario?.apellido?.toLowerCase().includes(query) ||
      producto?.usuario?.cedula?.toLowerCase().includes(query) ||
      producto?.usuario?.correo?.toLowerCase().includes(query);

    if (matchByProduct) {
      // Si coincide con el producto, lo añadimos con TODAS sus descripciones.
      // Usamos el spread (...) para crear una COPIA inmutable del producto.
      results.push({ ...producto });
      return; 
    }

    // 2. Si no coincide por producto, verificamos si coincide por DESCRIPCIÓN ANIDADA
    const matchedDescripciones = [];
    
    // Iteramos sobre las descripciones del producto
    producto.descripciones?.map(descripcion => {
      // Coincidencia en campos de Descripción
      const matchByDescripcion = 
        descripcion.serial?.toLowerCase().includes(query) ||
        descripcion.codigo?.toLowerCase().includes(query) ||
        descripcion.dispositivo?.toLowerCase().includes(query) ||
        descripcion.modelo?.toLowerCase().includes(query) ||
        descripcion.marca?.toLowerCase().includes(query) ||
        // Añadimos búsqueda en Ubicación (asumiendo que solo te interesa la primera)
        descripcion.ubicaciones?.[0]?.origen?.toLowerCase().includes(query) ||
        descripcion.ubicaciones?.[0]?.destino?.toLowerCase().includes(query) ||
        // Añadimos búsqueda en Asignación (asumiendo que solo te interesa la primera)
        descripcion.asignaciones?.[0]?.usuario?.cedula?.toLowerCase().includes(query) ||
        descripcion.asignaciones?.[0]?.usuario?.nombre?.toLowerCase().includes(query);

      if (matchByDescripcion) {
        // Si coincide con un campo de descripción, la guardamos
        matchedDescripciones.push(descripcion);
      }
    });

    // 3. Si se encontró al menos una descripción coincidente, creamos una COPIA del producto
    // y solo incluimos las descripciones que coincidieron.
    if (matchedDescripciones.length > 0) {
      results.push({ 
        ...producto, 
        descripciones: matchedDescripciones // Sustituimos el arreglo de descripciones por el filtrado
      });
    }

  });
  
  return results;
});


const total = computed(() => {
  // 1. Extraer las longitudes de las descripciones en un nuevo array (Ej: [4, 1])
  const longitudes = Inventario.value.Productos.map((producto) => {
    return producto.descripciones?.length || 0;
  });
  // 2. Sumar todos los números del array de longitudes usando 'reduce()'
  const sumaTotal = longitudes.reduce((acumulador, valorActual) => {
    return acumulador + valorActual;
  }, 0); // El '0' es el valor inicial del acumulador.

  // Devolvemos la suma total de las descripciones encontradas.
  return sumaTotal; 
});

// --- Navigation ---
const goBack = () => router.go(-1);

onMounted(() => {
  handleData();
});
</script>

<template>
  <div>
    <button @click="goBack" class="btn btn-outline-red-m btn-lg"><i class="bi bi-arrow-left-circle"></i> Regresar</button>
    <span class="badge fs-1"><i class="bi bi-search mr-3"></i> Buscador De Inventario</span>
    <button class="btn btn-outline-red-m btn-lg" data-bs-toggle="modal" data-bs-target="#staticAgregar"><i class="bi bi-circle"></i> Registrar</button>
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
                  placeholder="Buscar por ID, nombre del producto, serial, ubicación o asignación..."
                  class="form-control pe-5"
                  style="padding-right: 2.5rem; border-radius: 0.5rem;"
                >
                <i class="bi bi-search ubicacion"></i>
              </div>
            </div>
          </div>
          <span class="text-red">Cantidad de productos: <b>{{ total }}</b></span>
            <div v-if="searchQuery" class="space-y-4 rounded-3">
              <div v-for="producto in filteredProductos" 
                :key="producto?.id" 
                class="bg-white shadow-md p-6 hover:shadow-lg transition-shadow border rounded-3 border-danger">
                <div class="flex justify-between items-start mb-4">
                  <h2 class="text-xl font-semibold text-gray-800 px-2">{{ producto?.nombre }}</h2>
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Número de Búsqueda: <b>{{ producto?.id }}</b>
                  </span>
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Cantidad de productos: <b>{{ producto?.descripciones?.length }}</b>
                  </span>
                </div>
                <div class="row ps-3 mb-4 pt-2">
                    <p class="col-6">nombre <strong class="text-red-600">{{ producto?.usuario?.nombre || 'Sin nombre' }}</strong></p> 
                    <p class="col-6">apellido <strong class="text-red-600">{{ producto?.usuario.apellido || 'Sin apellido' }}</strong></p> 
                    <p class="col-6 ">cedula <strong class="text-red-600">{{ producto?.usuario.cedula || 'Sin cedula' }}</strong></p>
                    <p class="col-6 ">correo <strong class="text-red-600">{{ producto?.usuario.correo || 'Sin cedula' }}</strong></p>
                </div>

                <div v-for="(descripcion, descIndex) in producto?.descripciones" 
                  :key="`desc-${producto?.id}-${descIndex}`"
                  class="border-start border-5 border-danger ps-3 mb-4 pt-2">
                  <p class="fw-bolder">Descripción del producto {{ descIndex + 1 }}:</p>
                  <hr class="border-2 border-red-m opacity-75 mt-0 mb-3">
                  <div class="row">
                      <p class="col-6">codigo <strong class="text-red-600">{{ descripcion?.codigo || 'Sin dato' }}</strong></p> 
                      <p class="col-6">modelo <strong class="text-red-600">{{ descripcion?.modelo || 'Sin dato' }}</strong></p> 
                      <p class="col-6">dispositivo <strong class="text-red-600">{{ descripcion?.dispositivo || 'Sin dato' }}</strong></p> 
                      <p class="col-6">serial <strong class="text-red-600">{{ descripcion?.serial || 'Sin dato' }}</strong></p> 
                      <p class="col-6">marca <strong class="text-red-600">{{ descripcion?.marca || 'Sin dato' }}</strong></p> 
                      <p class="col-6">codigo_inv <strong class="text-red-600">{{ descripcion?.codigo_inv || 'Sin dato' }}</strong></p>
                      <p class="col-12">observacion <strong class="text-red-600">{{ descripcion?.observacion || 'Sin dato' }}</strong></p> 
                  </div>

                  <div class="mt-4 row">
                    <div class="col-6">
                      <p class="fw-bolder">Asignaciones (Descripción {{ descIndex + 1 }}):</p>
                      <hr class="border-2 border-red-m opacity-75 mt-0 mb-3">
                      <div class="row ps-3" v-if="descripcion?.asignaciones && descripcion.asignaciones?.length > 0">
                          <div v-for="(asignacion, asigIndex) in descripcion?.asignaciones" 
                              :key="`asig-${producto?.id}-${descIndex}-${asigIndex}`" 
                              class="col-6 border-bottom border-secondary-subtle py-2">
                              <p class="fw-bold">Asignación #{{ asigIndex + 1 }}</p>
                              <p class="col-6">fecha asignar <strong class="text-red-600">{{ asignacion?.fecha_asignar || 'sin asignación' }}</strong></p>
                              <p class="col-6">fecha_devolucion <strong class="text-red-600">{{ asignacion?.fecha_devolucion || "Sin devolución" }}</strong></p>
                              <p class="col-6">destino <strong class="text-red-600">{{ asignacion?.destino || 'sin destino' }}</strong></p>
                              <p class="col-6">Estado <strong class="text-red-600">{{ asignacion.estatus?.nombre || 'sin estado' }}</strong></p>
                              <p class="fw-bold text-red-600 mt-2">Usuario Asignado:</p>
                              <p class="col-6">nombre <strong class="text-red-600">{{ asignacion.usuario?.nombre || 'sin nombre' }}</strong></p>
                              <p class="col-6">apellido <strong class="text-red-600">{{ asignacion.usuario?.apellido || 'sin apellido' }}</strong></p>
                              <p class="col-6">cedula <strong class="text-red-600">{{ asignacion.usuario?.cedula || 'sin cedula'}}</strong></p>
                              <p class="col-6">usuario <strong class="text-red-600">{{ asignacion.usuario?.usuario || 'sin usuario' }}</strong></p>
                              <p class="col-6">correo <strong class="text-red-600">{{ asignacion.usuario?.correo || 'sin correo' }}</strong></p>
                              <p class="col-6">teléfono celular <strong class="text-red-600">{{ asignacion.usuario?.telefono_celular || 'sin asignación' }}</strong></p>
                              <p class="col-6">teléfono alternativo <strong class="text-red-600">{{ asignacion.usuario?.telefono_alternativo || 'sin asignación' }}</strong></p>
                          </div>
                      </div>
                      <p class="col-12 mt-1" v-else><strong class="text-red-600">No hay datos de Asignación.</strong></p>
                    </div>
                    <div class="col-6">
                      <p class="fw-bolder">Ubicaciones (Descripción {{ descIndex + 1 }}):</p>
                      <hr class="border-2 border-red-m opacity-75 mt-0 mb-3">
                      <div class="row ps-3" v-if="descripcion?.ubicaciones && descripcion.ubicaciones?.length > 0">
                          <div v-for="(ubicacion, ubiIndex) in descripcion.ubicaciones" 
                              :key="`ubi-${producto?.id}-${descIndex}-${ubiIndex}`" 
                              class="col-6 border-bottom border-secondary-subtle py-2">
                            <p class="col-6">origen <strong class="text-red-600">{{ ubicacion?.origen || 'sin ubicación' }}</strong></p>
                            <p class="col-6">destino <strong class="text-red-600">{{ ubicacion?.destino || 'sin ubicación' }}</strong></p>
                            <p class="col-6">piso <strong class="text-red-600">{{ ubicacion?.piso || 'sin ubicación' }}</strong></p>
                            <p class="col-6">region <strong class="text-red-600">{{ ubicacion?.region || 'sin ubicación' }}</strong></p>
                            <p class="col-6">estado <strong class="text-red-600">{{ ubicacion?.estado || 'sin ubicación' }}</strong></p>
                            <p class="col-6">capital <strong class="text-red-600">{{ ubicacion?.capital || 'sin ubicación' }}</strong></p>
                          </div>
                      </div>
                      <p class="col-12 mt-1" v-else><strong class="text-red-600">No hay datos de Ubicación.</strong></p>
                    </div>
                  </div>

                  <div class="mt-4 row">
                      <div class="col-6">
                          <p class="fw-bolder">Periféricos (Desc. {{ descIndex + 1 }}):</p>
                          <hr class="border-2 border-red-m opacity-75 mt-0 mb-3">
                          <div class="row ps-3" v-if="descripcion?.perifericos && descripcion.perifericos?.length > 0">
                              <div v-for="(periferico, periIndex) in descripcion.perifericos" 
                                  :key="`peri-${producto?.id}-${descIndex}-${periIndex}`" 
                                  class="col-12 border-bottom border-secondary-subtle py-2">
                                  <p class="col-6">Entrada <strong class="text-red-600">{{ periferico?.entrada || "Sin entrada" }}</strong></p>
                                  <p class="col-6">Salida <strong class="text-red-600">{{ periferico?.salida || 'sin salida' }}</strong></p>
                                  <p class="col-12">Estado <strong class="text-red-600">{{ periferico.estatus?.nombre || 'sin estado' }}</strong></p>
                              </div>
                          </div>
                          <p class="col-12 mt-1" v-else><strong class="text-red-600">No hay datos de Inventarios.</strong></p>
                      </div>

                      <div class="col-6">
                          <p class="fw-bolder">Evaluaciones: (Desc. {{ descIndex + 1 }}):</p>
                          <hr class="border-2 border-red-m opacity-75 mt-0 mb-3">
                          <div class="row ps-3" v-if="descripcion?.evaluaciones && descripcion.evaluaciones?.length > 0">
                              <div v-for="(evaluacion, invIndex) in descripcion.evaluaciones" 
                                  :key="`inv-${producto?.id}-${descIndex}-${invIndex}`" 
                                  class="col-12 border-bottom border-secondary-subtle py-2">
                                  <p class="col-6">Escala <strong class="text-red-600">{{ evaluacion?.escala || "Sin escala" }}</strong></p>
                                  <p class="col-12">Sistema operativo(compatibilidad) <strong class="text-red-600">{{ evaluacion?.compatibilidad || "Sin compatibilidad" }}</strong></p>
                                  <p class="col-6">Reemplazo <strong class="text-red-600">{{ evaluacion?.reemplazo || 'sin reemplazo' }}</strong></p>
                                  <p class="col-12">Mantenimiento <strong class="text-red-600">{{ evaluacion?.mantenimiento || 'sin mantenimiento' }}</strong></p>
                              </div>
                          </div>
                          <p class="col-12 mt-1" v-else><strong class="text-red-600">No hay datos de Evaluaciones.</strong></p>
                      </div>
                  </div>
                </div>

                <div v-if="!producto?.descripciones || producto?.descripciones?.length === 0" class="col-12 mt-3">
                    <p><strong class="text-red-600">No hay descripciones asociadas a este producto.</strong></p>
                </div>
              </div>
              <div 
                v-if="filteredProductos?.length === 0 && searchQuery"
                class="text-center py-12 bg-white rounded-lg"
              >
                <i class="bi bi-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <p class="text-gray-600">No se encontraron resultados para "{{ searchQuery }}"</p>
              </div>
            </div>
          </div>
          <PrincipalModal :handleData="handleData" :isLoadingImport="isLoadingImport" :response="response" />
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
