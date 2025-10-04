<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion'
import { storeToRefs } from 'pinia'

// Servicios
import DescripcionServicios from '@/components/services/inventario/DescripcionServicios';
import ProductosServicios from '@/components/services/inventario/ProductosServicios';
import UbicacionServicios from '@/components/services/inventario/UbicacionServicios';
import AsignacionServicios from '@/components/services/inventario/AsignacionServicios';
import InventariosServicios from '@/components/services/inventario/InventariosServicios';
import PerifericosServicios from '@/components/services/inventario/PerifericosServicios';
import PrincipalModal from '@/components/modales/PrincipalModal.vue';

const router = useRouter();
const store = useLoginStore()
const { dataPerfil } = storeToRefs(store);

// --- State ---
const Inventario = ref({
  Productos: [],
  Descripciones: [],
  Ubicaciones: [],
  Asignaciones: [],
  Inventarios: [],
  Perifericos: [],
});

const searchQuery = ref('');
const isLoading = ref(true);

// --- Data Loading and Initialization ---
const loadData = async () => {
  isLoading.value = true;
  try {
    // Cargar todos los datos
    const [
      productosRes,
      descripcionesRes,
      ubicacionesRes,
      asignacionesRes,
      inventariosRes,
      perifericosRes
    ] = await Promise.all([
      ProductosServicios('fetchAll'),
      DescripcionServicios('fetchAll'),
      UbicacionServicios('fetchAll'),
      AsignacionServicios('fetchAll'),
      InventariosServicios('fetchAll'),
      PerifericosServicios('fetchAll')
    ]);

    Inventario.value.Productos = productosRes?.mostrarT || [];
    Inventario.value.Descripciones = descripcionesRes?.mostrarT || [];
    Inventario.value.Ubicaciones = ubicacionesRes?.mostrarT || [];
    Inventario.value.Asignaciones = asignacionesRes?.mostrarT || [];
    Inventario.value.Inventarios = inventariosRes?.mostrarT || [];
    Inventario.value.Perifericos = perifericosRes?.mostrarT || [];

  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    isLoading.value = false;
  }
};

// --- Computed Data Maps for Fast Lookup (Optimización de Duplicados) ---

const descripcionMap = computed(() => {
  // Asume que la descripción se relaciona con el producto por un campo como 'producto_id'
  // Si el helper original asume que d.id === producto.id, lo mantendremos para evitar errores de relación
  return new Map(Inventario.value.Descripciones.map(d => [d.id, d]));
});

const ubicacionMap = computed(() => {
  return new Map(Inventario.value.Ubicaciones.map(u => [u.id, u]));
});

const asignacionMap = computed(() => {
  return new Map(Inventario.value.Asignaciones.map(a => [a.id, a]));
});

const perifericoMap = computed(() => {
  return new Map(Inventario.value.Perifericos.map(p => [p.id, p]));
});

const inventarioMap = computed(() => {
  return new Map(Inventario.value.Inventarios.map(i => [i.id, i]));
});

// --- Complex Search Logic ---

const filteredProductos = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) {
    // Si no hay búsqueda, no mostrar nada para forzar el uso del buscador
    return [];
  }

  return Inventario.value.Productos.filter(producto => {
    // 1. OBTENER DATOS RELACIONADOS
    const descripcion = descripcionMap.value.get(producto?.id);
    const ubicacion = ubicacionMap.value.get(producto?.id);
    const asignacion = asignacionMap.value.get(producto?.id);

    // 2. CRITERIO: BUSQUEDA POR ID
    const idMatch = producto.id.toString() === query;

    // 3. CRITERIO: BUSQUEDA POR NOMBRE DEL PRODUCTO
    const nombreMatch = producto.nombre?.toLowerCase().includes(query);

    // 4. CRITERIO: BUSQUEDA POR SERIAL (clave)
    // El serial está en la descripción
    const serialMatch = descripcion?.serial?.toLowerCase().includes(query);

    // 5. CRITERIO: BUSQUEDA POR UBICACIÓN
    const ubicacionMatch = ubicacion && (
      ubicacion?.origen?.toLowerCase().includes(query) ||
      ubicacion?.destino?.toLowerCase().includes(query) ||
      ubicacion?.piso?.toLowerCase().includes(query) ||
      ubicacion?.region?.toLowerCase().includes(query) ||
      ubicacion?.estado?.toLowerCase().includes(query) ||
      ubicacion?.capital?.toLowerCase().includes(query)
    );
    
    // 6. CRITERIO: BUSQUEDA POR ASIGNACIÓN (usuario, destino)
    const asignacionMatch = asignacion && (
      asignacion?.destino?.toLowerCase().includes(query) ||
      asignacion?.usuario?.nombre?.toLowerCase().includes(query) ||
      asignacion?.usuario?.apellido?.toLowerCase().includes(query) ||
      asignacion?.usuario?.cedula?.toLowerCase().includes(query)
    );
    
    // El producto se incluye si coincide con CUALQUIERA de los criterios
    return idMatch || nombreMatch || serialMatch || ubicacionMatch || asignacionMatch;
  });
});

// --- Simplified Helpers (Usando los Maps) ---

const getDescripcion = (productoId) => descripcionMap.value.get(productoId);
const getUbicacion = (productoId) => ubicacionMap.value.get(productoId);
const getAsignacion = (productoId) => asignacionMap.value.get(productoId);
const getPeriferico = (productoId) => perifericoMap.value.get(productoId);
const getInventario = (productoId) => inventarioMap.value.get(productoId);


// --- Navigation ---
const goBack = () => router.go(-1);

onMounted(() => {
  loadData();
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

            <div class="space-y-4">
              <div v-for="producto in filteredProductos" :key="producto?.id" class="bg-white shadow-md p-6 hover:shadow-lg transition-shadow">
                <div class="flex justify-between items-start mb-4">
                  <h2 class="text-xl font-semibold text-gray-800">{{ producto?.nombre }}</h2>
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Número de Búsqueda: <b>{{ producto?.id }}</b>
                  </span>
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Estatus: <b>{{ producto.estatus?.nombre }}</b>
                  </span>
                </div>

                <div class="row">
                  <div class="col-6">
                    <p class="fw-bolder">Descripción:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    
                    <div class="mt-1 row" v-if="getDescripcion(producto?.id)">
                      <p class="col-6">codigo <strong class="text-red-600">{{ getDescripcion(producto?.id).codigo || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">dispositivo <strong class="text-red-600">{{ getDescripcion(producto?.id).dispositivo || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">modelo <strong class="text-red-600">{{ getDescripcion(producto?.id).modelo || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">serial <strong class="text-red-600">{{ getDescripcion(producto?.id).serial || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">codigo_inv <strong class="text-red-600">{{ getDescripcion(producto?.id).codigo_inv || 'Sin descripción' }}</strong></p>
                      <p class="col-12">observacion <strong class="text-red-600">{{ getDescripcion(producto?.id).observacion || 'Sin descripción' }}</strong></p> 
                    </div>
                    <div class="mt-1 row" v-else>
                        <p class="col-12"><strong class="text-red-600">No hay descripción disponible.</strong></p>
                    </div>
                  </div>

                  <div class="col-6">
                    <p class="fw-bolder">Ubicación:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row" v-if="getUbicacion(producto?.id)">
                      <p class="col-6">origen <strong class="text-red-600">{{ getUbicacion(producto?.id).origen || 'sin ubicación' }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getUbicacion(producto?.id).destino || 'sin ubicación' }}</strong></p>
                      <p class="col-6">piso <strong class="text-red-600">{{ getUbicacion(producto?.id).piso || 'sin ubicación' }}</strong></p>
                      <p class="col-6">region <strong class="text-red-600">{{ getUbicacion(producto?.id).region || 'sin ubicación' }}</strong></p>
                      <p class="col-6">estado <strong class="text-red-600">{{ getUbicacion(producto?.id).estado || 'sin ubicación' }}</strong></p>
                      <p class="col-6">capital <strong class="text-red-600">{{ getUbicacion(producto?.id).capital || 'sin ubicación' }}</strong></p>
                    </p>
                     <p class="mt-1 row" v-else>
                        <p class="col-12"><strong class="text-red-600">No hay datos de Ubicación.</strong></p>
                    </p>
                  </div>

                  <div class="col-6">
                    <p class="fw-bolder">Asignación:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row" v-if="getAsignacion(producto?.id)">
                      <p class="col-6">fecha asignar <strong class="text-red-600">{{ getAsignacion(producto?.id).fecha_asignar || 'sin asignación' }}</strong></p>
                      <p class="col-6">fecha_devolucion <strong class="text-red-600">{{ getAsignacion(producto?.id).fecha_devolucion || "Sin devolución" || 'sin asignación' }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getAsignacion(producto?.id).destino || 'sin asignación' }}</strong></p>
                      <p class="col-6">nombre <strong class="text-red-600">{{ getAsignacion(producto?.id).usuario?.nombre || 'sin asignación' }}</strong></p>
                      <p class="col-6">apellido <strong class="text-red-600">{{ getAsignacion(producto?.id).usuario?.apellido || 'sin asignación' }}</strong></p>
                      <p class="col-6">cedula <strong class="text-red-600">{{ getAsignacion(producto?.id).usuario?.cedula || 'sin asignación'}}</strong></p>
                      <p class="col-6">usuario <strong class="text-red-600">{{ getAsignacion(producto?.id).usuario?.usuario || 'sin asignación' }}</strong></p>
                      <p class="col-6">correo <strong class="text-red-600">{{ getAsignacion(producto?.id).usuario?.correo || 'sin asignación' }}</strong></p>
                      <p class="col-6">telefono_celular <strong class="text-red-600">{{ getAsignacion(producto?.id).usuario?.telefono_celular || 'sin asignación' }}</strong></p>
                      <p class="col-6">telefono_alternativo <strong class="text-red-600">{{ getAsignacion(producto?.id).usuario?.telefono_alternativo || 'sin asignación' }}</strong></p>
                    </p>
                    <p class="mt-1 row" v-else>
                        <p class="col-12"><strong class="text-red-600">No hay datos de Asignación.</strong></p>
                    </p>
                  </div>

                  <div class="col-6">
                    <p class="fw-bolder">Periféricos:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row" v-if="getPeriferico(producto?.id)">
                      <p class="col-6">Cantidad existente <strong class="text-red-600">{{ getPeriferico(producto?.id).cantidad_existente || "Sin estock" }}</strong></p>
                      <p class="col-6">Entrada <strong class="text-red-600">{{ getPeriferico(producto?.id).entrada || "Sin entrada" }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getPeriferico(producto?.id).salida || 'sin salida' }}</strong></p>
                      <p class="col-6">estado que se encuentra <strong class="text-red-600">{{ getPeriferico(producto?.id).estatus?.nombre || 'sin asignación' }}</strong></p>
                    </p>
                    <p class="mt-1 row" v-else>
                         <p class="col-12"><strong class="text-red-600">No hay datos de Periféricos.</strong></p>
                    </p>
                    
                    <p class="fw-bolder">Sin Periféricos:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row" v-if="getInventario(producto?.id)">
                      <p class="col-6">Cantidad existente <strong class="text-red-600">{{ getInventario(producto?.id).cantidad_existente || "Sin estock" }}</strong></p>
                      <p class="col-6">Entrada <strong class="text-red-600">{{ getInventario(producto?.id).entrada || "Sin entrada" }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getInventario(producto?.id).salida || 'sin salida' }}</strong></p>
                      <p class="col-6">estado que se encuentra <strong class="text-red-600">{{ getInventario(producto?.id).estatus?.nombre || 'sin asignación' }}</strong></p>
                    </p>
                     <p class="mt-1 row" v-else>
                         <p class="col-12"><strong class="text-red-600">No hay datos de Inventario General.</strong></p>
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
          <PrincipalModal />
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

<!-- <script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion'
import { storeToRefs } from 'pinia'
import { Modal } from 'bootstrap'

// Servicios
import DescripcionServicios from '@/components/services/inventario/DescripcionServicios';
import ProductosServicios from '@/components/services/inventario/ProductosServicios';
import UbicacionServicios from '@/components/services/inventario/UbicacionServicios';
import AsignacionServicios from '@/components/services/inventario/AsignacionServicios';
import InventariosServicios from '@/components/services/inventario/InventariosServicios';
import PerifericosServicios from '@/components/services/inventario/PerifericosServicios';
// Servicio necesario para el dropdown de Estatus en el modal de registro
import EstatusServicios from '@/components/services/inventario/EstatusServicios';

// Componentes
import PrincipalModal from '@/components/modales/PrincipalModal.vue';

const router = useRouter();
const store = useLoginStore()
const { dataPerfil } = storeToRefs(store);

// --- State de Datos y Búsqueda ---
const Inventario = ref({
  Productos: [],
  Descripciones: [],
  Ubicaciones: [],
  Asignaciones: [],
  Inventarios: [],
  Perifericos: [],
  Estatus: [], // Nuevo estado para Estatus
});

const searchQuery = ref('');
const isLoading = ref(true);

// --- State del Modal de Registro ---
const isLoadingImport = ref(false); // Para el estado "Procesando..." del modal
const response = ref(null); // Para mostrar mensajes de éxito/error en el modal

// Propiedad computada para pasar las relaciones necesarias al modal
const modalRelations = computed(() => {
    // El modal de registro solo necesita la lista de Estatus (relations[2])
    return [[], [], Inventario.value.Estatus]; 
});


// --- Data Loading and Initialization ---
const loadData = async () => {
  isLoading.value = true;
  try {
    // Cargar todos los datos + Estatus
    const [
      productosRes,
      descripcionesRes,
      ubicacionesRes,
      asignacionesRes,
      inventariosRes,
      perifericosRes,
      estatusRes // Nuevo servicio cargado
    ] = await Promise.all([
      ProductosServicios('fetchAll'),
      DescripcionServicios('fetchAll'),
      UbicacionServicios('fetchAll'),
      AsignacionServicios('fetchAll'),
      InventariosServicios('fetchAll'),
      PerifericosServicios('fetchAll'),
      EstatusServicios('fetchAll')
    ]);

    Inventario.value.Productos = productosRes?.mostrarT || [];
    Inventario.value.Descripciones = descripcionesRes?.mostrarT || [];
    Inventario.value.Ubicaciones = ubicacionesRes?.mostrarT || [];
    Inventario.value.Asignaciones = asignacionesRes?.mostrarT || [];
    Inventario.value.Inventarios = inventariosRes?.mostrarT || [];
    Inventario.value.Perifericos = perifericosRes?.mostrarT || [];
    Inventario.value.Estatus = estatusRes?.mostrarT || []; // Guardar Estatus

  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    isLoading.value = false;
  }
};


// --- Handler de Creación de Producto y Descripción ---

const handleData = async (action, params) => {
    if (action !== 'create') return;

    isLoadingImport.value = true;
    response.value = null; // Limpiar mensajes anteriores

    try {
        // 1. Preparar datos del Producto
        const productData = {
            nombre: params.nombre,
            estatus_id: params.estatus_id,
            // Asignar el ID del usuario logeado
            usuario_id: dataPerfil.value?.id, 
        };

        // 2. Crear el Producto
        const newProductRes = await ProductosServicios('create', productData);

        if (newProductRes.success) {
            const newProductId = newProductRes.id; // Asume que el servicio devuelve el ID del producto creado
            
            // 3. Preparar datos de la Descripción
            const descriptionData = {
                // Copiar todos los campos de descripción
                codigo: params.codigo || null,
                modelo: params.modelo || null,
                dispositivo: params.dispositivo || null,
                serial: params.serial || null,
                marca: params.marca || null,
                observacion: params.observacion || null,
                codigo_inv: params.codigo_inv || null,
                // Vincular con el producto recién creado
                producto_id: newProductId, 
            };
            
            // 4. Crear la Descripción
            const newDescriptionRes = await DescripcionServicios('create', descriptionData);

            if (newDescriptionRes.success) {
                response.value = { success: 'Producto y Descripción registrados exitosamente.' };
                await loadData(); // Recargar todos los datos para que aparezca el nuevo producto en la búsqueda

                // Cerrar el modal después de un registro exitoso
                const modalElement = document.getElementById('staticAgregar');
                const modalInstance = Modal.getInstance(modalElement);
                if (modalInstance) {
                    setTimeout(() => {
                        modalInstance.hide();
                    }, 1500); // Dar tiempo para ver el mensaje de éxito
                }
            } else {
                // Si la descripción falla, idealmente se debería revertir la creación del producto
                // Pero aquí solo mostramos el error de descripción.
                response.value = { error: newDescriptionRes.message || 'Error al registrar la descripción.' };
            }
        } else {
            response.value = { error: newProductRes.message || 'Error al registrar el producto. Asegúrese de que el nombre sea único.' };
        }

    } catch (error) {
        console.error('Error en handleData (create):', error);
        response.value = { error: 'Ocurrió un error inesperado al procesar la solicitud.' };
    } finally {
        isLoadingImport.value = false;
        // La limpieza del formulario se manejará con la función resetParams en el modal
    }
};


// --- Computed Data Maps (Sin cambios) ---

const descripcionMap = computed(() => {
  return new Map(Inventario.value.Descripciones.map(d => [d.id, d]));
});

const ubicacionMap = computed(() => {
  return new Map(Inventario.value.Ubicaciones.map(u => [u.id, u]));
});

const asignacionMap = computed(() => {
  return new Map(Inventario.value.Asignaciones.map(a => [a.id, a]));
});

const perifericoMap = computed(() => {
  return new Map(Inventario.value.Perifericos.map(p => [p.id, p]));
});

const inventarioMap = computed(() => {
  return new Map(Inventario.value.Inventarios.map(i => [i.id, i]));
});

// --- Complex Search Logic (Sin cambios) ---

const filteredProductos = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) {
    return [];
  }

  return Inventario.value.Productos.filter(producto => {
    // 1. OBTENER DATOS RELACIONADOS
    const descripcion = descripcionMap.value.get(producto?.id);
    const ubicacion = ubicacionMap.value.get(producto?.id);
    const asignacion = asignacionMap.value.get(producto?.id);

    // 2. CRITERIO: BUSQUEDA POR ID
    const idMatch = producto.id.toString() === query;

    // 3. CRITERIO: BUSQUEDA POR NOMBRE DEL PRODUCTO
    const nombreMatch = producto.nombre?.toLowerCase().includes(query);

    // 4. CRITERIO: BUSQUEDA POR SERIAL Y DESCRIPCIÓN (clave)
    // El serial, modelo, marca, dispositivo, etc., están en la descripción
    const descripcionContent = [
        descripcion?.serial,
        descripcion?.modelo,
        descripcion?.marca,
        descripcion?.dispositivo,
        descripcion?.observacion,
        descripcion?.codigo_inv,
        descripcion?.codigo
    ].filter(Boolean).join(' ').toLowerCase();

    const serialDescripcionMatch = descripcionContent.includes(query);

    // 5. CRITERIO: BUSQUEDA POR UBICACIÓN
    const ubicacionMatch = ubicacion && (
      ubicacion?.origen?.toLowerCase().includes(query) ||
      ubicacion?.destino?.toLowerCase().includes(query) ||
      ubicacion?.piso?.toLowerCase().includes(query) ||
      ubicacion?.region?.toLowerCase().includes(query) ||
      ubicacion?.estado?.toLowerCase().includes(query) ||
      ubicacion?.capital?.toLowerCase().includes(query)
    );
    
    // 6. CRITERIO: BUSQUEDA POR ASIGNACIÓN (usuario, destino)
    const asignacionMatch = asignacion && (
      asignacion?.destino?.toLowerCase().includes(query) ||
      asignacion?.usuario?.nombre?.toLowerCase().includes(query) ||
      asignacion?.usuario?.apellido?.toLowerCase().includes(query) ||
      asignacion?.usuario?.cedula?.toLowerCase().includes(query)
    );
    
    // El producto se incluye si coincide con CUALQUIERA de los criterios
    return idMatch || nombreMatch || serialDescripcionMatch || ubicacionMatch || asignacionMatch;
  });
});


// --- Simplified Helpers (Usando los Maps) ---

const getDescripcion = (productoId) => Inventario.value.Descripciones.find(d => d.producto_id === productoId);
const getUbicacion = (productoId) => Inventario.value.Ubicaciones.find(u => u.producto_id === productoId);
const getAsignacion = (productoId) => Inventario.value.Asignaciones.find(a => a.producto_id === productoId);
const getPeriferico = (productoId) => Inventario.value.Perifericos.find(p => p.producto_id === productoId);
const getInventario = (productoId) => Inventario.value.Inventarios.find(i => i.producto_id === productoId);


// --- Navigation ---
const goBack = () => router.go(-1);

onMounted(() => {
  loadData();
});
</script>

<template>
  <div>
    <button @click="goBack" class="btn btn-outline-red-m btn-lg"><i class="bi bi-arrow-left-circle"></i> Regresar</button>
    <span class="badge fs-1"><i class="bi bi-search mr-3"></i> Buscador De Inventario</span>
    <!-- Botón que abre el modal 
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
                  placeholder="Buscar por ID, nombre del producto, serial, descripción, ubicación o asignación..."
                  class="form-control pe-5"
                  style="padding-right: 2.5rem; border-radius: 0.5rem;"
                >
                <i class="bi bi-search ubicacion"></i>
              </div>
            </div>
          </div>

            <div class="space-y-4">
              <div v-if="isLoading" class="text-center py-5">
                  <div class="spinner-border text-red-600" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <p class="mt-2 text-muted">Cargando inventario...</p>
              </div>

              <div v-else v-for="producto in filteredProductos" :key="producto?.id" class="bg-white shadow-md p-6 hover:shadow-lg transition-shadow">
                <div class="flex justify-between items-start mb-4">
                  <h2 class="text-xl font-semibold text-gray-800">{{ producto?.nombre }}</h2>
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Número de Búsqueda: <b>{{ producto?.id }}</b>
                  </span>
                  <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Estatus: <b>{{ producto.estatus?.nombre }}</b>
                  </span>
                </div>

                <div class="row">
                  <div class="col-6">
                    <p class="fw-bolder">Descripción:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    
                    <div class="mt-1 row" v-if="getDescripcion(producto?.id)">
                      <p class="col-6">codigo <strong class="text-red-600">{{ getDescripcion(producto?.id)?.codigo || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">dispositivo <strong class="text-red-600">{{ getDescripcion(producto?.id)?.dispositivo || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">modelo <strong class="text-red-600">{{ getDescripcion(producto?.id)?.modelo || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">serial <strong class="text-red-600">{{ getDescripcion(producto?.id)?.serial || 'Sin descripción' }}</strong></p> 
                      <p class="col-6">codigo_inv <strong class="text-red-600">{{ getDescripcion(producto?.id)?.codigo_inv || 'Sin descripción' }}</strong></p>
                      <p class="col-12">observacion <strong class="text-red-600">{{ getDescripcion(producto?.id)?.observacion || 'Sin descripción' }}</strong></p> 
                    </div>
                    <div class="mt-1 row" v-else>
                        <p class="col-12"><strong class="text-red-600">No hay descripción disponible.</strong></p>
                    </div>
                  </div>

                  <div class="col-6">
                    <p class="fw-bolder">Ubicación:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row" v-if="getUbicacion(producto?.id)">
                      <p class="col-6">origen <strong class="text-red-600">{{ getUbicacion(producto?.id)?.origen || 'sin ubicación' }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getUbicacion(producto?.id)?.destino || 'sin ubicación' }}</strong></p>
                      <p class="col-6">piso <strong class="text-red-600">{{ getUbicacion(producto?.id)?.piso || 'sin ubicación' }}</strong></p>
                      <p class="col-6">region <strong class="text-red-600">{{ getUbicacion(producto?.id)?.region || 'sin ubicación' }}</strong></p>
                      <p class="col-6">estado <strong class="text-red-600">{{ getUbicacion(producto?.id)?.estado || 'sin ubicación' }}</strong></p>
                      <p class="col-6">capital <strong class="text-red-600">{{ getUbicacion(producto?.id)?.capital || 'sin ubicación' }}</strong></p>
                    </p>
                     <p class="mt-1 row" v-else>
                        <p class="col-12"><strong class="text-red-600">No hay datos de Ubicación.</strong></p>
                    </p>
                  </div>

                  <div class="col-6">
                    <p class="fw-bolder">Asignación:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row" v-if="getAsignacion(producto?.id)">
                      <p class="col-6">fecha asignar <strong class="text-red-600">{{ getAsignacion(producto?.id)?.fecha_asignar || 'sin asignación' }}</strong></p>
                      <p class="col-6">fecha_devolucion <strong class="text-red-600">{{ getAsignacion(producto?.id)?.fecha_devolucion || "Sin devolución" || 'sin asignación' }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getAsignacion(producto?.id)?.destino || 'sin asignación' }}</strong></p>
                      <p class="col-6">nombre <strong class="text-red-600">{{ getAsignacion(producto?.id)?.usuario?.nombre || 'sin asignación' }}</strong></p>
                      <p class="col-6">apellido <strong class="text-red-600">{{ getAsignacion(producto?.id)?.usuario?.apellido || 'sin asignación' }}</strong></p>
                      <p class="col-6">cedula <strong class="text-red-600">{{ getAsignacion(producto?.id)?.usuario?.cedula || 'sin asignación'}}</strong></p>
                      <p class="col-6">usuario <strong class="text-red-600">{{ getAsignacion(producto?.id)?.usuario?.usuario || 'sin asignación' }}</strong></p>
                      <p class="col-6">correo <strong class="text-red-600">{{ getAsignacion(producto?.id)?.usuario?.correo || 'sin asignación' }}</strong></p>
                      <p class="col-6">telefono_celular <strong class="text-red-600">{{ getAsignacion(producto?.id)?.usuario?.telefono_celular || 'sin asignación' }}</strong></p>
                      <p class="col-6">telefono_alternativo <strong class="text-red-600">{{ getAsignacion(producto?.id)?.usuario?.telefono_alternativo || 'sin asignación' }}</strong></p>
                    </p>
                    <p class="mt-1 row" v-else>
                        <p class="col-12"><strong class="text-red-600">No hay datos de Asignación.</strong></p>
                    </p>
                  </div>

                  <div class="col-6">
                    <p class="fw-bolder">Periféricos:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row" v-if="getPeriferico(producto?.id)">
                      <p class="col-6">Cantidad existente <strong class="text-red-600">{{ getPeriferico(producto?.id)?.cantidad_existente || "Sin estock" }}</strong></p>
                      <p class="col-6">Entrada <strong class="text-red-600">{{ getPeriferico(producto?.id)?.entrada || "Sin entrada" }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getPeriferico(producto?.id)?.salida || 'sin salida' }}</strong></p>
                      <p class="col-6">estado que se encuentra <strong class="text-red-600">{{ getPeriferico(producto?.id)?.estatus?.nombre || 'sin asignación' }}</strong></p>
                    </p>
                    <p class="mt-1 row" v-else>
                         <p class="col-12"><strong class="text-red-600">No hay datos de Periféricos.</strong></p>
                    </p>
                    
                    <p class="fw-bolder">Sin Periféricos:</p>
                    <hr class="border-2 border-red-m opacity-75">
                    <p class="mt-1 row" v-if="getInventario(producto?.id)">
                      <p class="col-6">Cantidad existente <strong class="text-red-600">{{ getInventario(producto?.id)?.cantidad_existente || "Sin estock" }}</strong></p>
                      <p class="col-6">Entrada <strong class="text-red-600">{{ getInventario(producto?.id)?.entrada || "Sin entrada" }}</strong></p>
                      <p class="col-6">destino <strong class="text-red-600">{{ getInventario(producto?.id)?.salida || 'sin salida' }}</strong></p>
                      <p class="col-6">estado que se encuentra <strong class="text-red-600">{{ getInventario(producto?.id)?.estatus?.nombre || 'sin asignación' }}</strong></p>
                    </p>
                     <p class="mt-1 row" v-else>
                         <p class="col-12"><strong class="text-red-600">No hay datos de Inventario General.</strong></p>
                    </p>
                  </div>

                </div>
              </div>
              <div 
                v-if="filteredProductos.length === 0 && searchQuery && !isLoading"
                class="text-center py-12 bg-white rounded-lg"
              >
                <i class="bi bi-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <p class="text-gray-600">No se encontraron resultados para "{{ searchQuery }}"</p>
              </div>
            </div>
          </div>
          
          <!-- MODAL: Se pasan las props necesarias para la funcionalidad de registro 
          <PrincipalModal 
              :handleData="handleData"
              :relations="modalRelations"
              :isLoadingImport="isLoadingImport"
              :response="response"
          />
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
</style> -->