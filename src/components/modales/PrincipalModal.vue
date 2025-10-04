<script setup>
import { ref, watch, computed } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
// Se importa validacionesUtils para manejar la validación de los campos.
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';

// Definición de las propiedades del componente
const props = defineProps({
  // Función que maneja el envío de los datos (debe orquestar la creación del Producto y la Descripción).
  handleData: {
    type: Function,
    default: null,
    required: true,
  },
  // Se asume que relations[2] contiene la lista de Estatus (roles ya no es necesario).
  relations: {
    type: Array,
    default: () => [[], [], []], // Usaremos relations[2] para Estatus
  },
  isLoadingImport: {
    type: Boolean,
    default: false,
    required: true,
  },
  response: {
    type: Object,
    default: null,
    required: false,
  },
});

const { dataPerfil } = useLoginStore(); // No se usa storeToRefs ya que no se necesita reactividad en dataPerfil aquí.
const modalAgregar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);

// --- ESTADO INICIAL PARA EL REGISTRO DE PRODUCTO Y DESCRIPCION ---
const paramsA = ref({
  // PRODUCTOS Fields
  nombre: '',
  estatus_id: null,
  // DESCRIPCION Fields
  codigo: '',
  modelo: '',
  dispositivo: '',
  serial: '',
  marca: '',
  codigo_inv: '',
  observacion: '',
  // Nota: El usuario_id de productos y el producto_id de descripcion 
  // deben ser añadidos en la función handleData del componente padre.
});

const resetParams = () => {
  paramsA.value = {
    nombre: '',
    estatus_id: null,
    codigo: '',
    modelo: '',
    dispositivo: '',
    serial: '',
    marca: '',
    codigo_inv: '',
    observacion: '',
  };
  avisos.value = null;
  avisosAlert.value = null;
};

// --- VALIDACIONES DE CAMPOS ---
// Validamos el nombre (requerido, sin números al inicio) y campos de texto/textarea
watch(
  [
    () => paramsA.value?.nombre, 
    () => paramsA.value?.serial, 
    () => paramsA.value?.observacion
  ], 
  ([nombre, serial, observacion]) => {
  const errors = [];
  
  // 1. Validar Nombre (patrón: no debe empezar con números o contener caracteres especiales)
  const nombrePattern = /^[^0-9][A-Za-zÁ-Úá-úñÑ\s\-\{\}\(\)\+\*]+$/;
  if (nombre && !nombrePattern.test(nombre)) {
      errors.push("El nombre es inválido (no debe empezar con números o contener caracteres especiales).");
  }

  // 2. Validar Serial y Observación (evitar caracteres peligrosos como <, >, etc.)
  const safeTextPattern = /^[^<>{}\[\]]+$/;

  if (serial && !safeTextPattern.test(serial)) {
      errors.push("El serial contiene caracteres especiales no permitidos (<, >, {, }, [, ]).");
  }
  
  if (observacion && !safeTextPattern.test(observacion)) {
      errors.push("La observación contiene caracteres especiales no permitidos (<, >, {, }, [, ]).");
  }
  
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  // Si los campos están vacíos, no mostramos alerta.
  if ((!nombre && !serial && !observacion)) avisosAlert.value = null;
});

watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});

// Se elimina la función filteredUsuario ya que no es relevante para el registro de productos.

// Se define una variable para deshabilitar el botón de envío si faltan campos requeridos
const isFormInvalid = computed(() => {
  const isRequiredFieldMissing = !paramsA.value.nombre || !paramsA.value.estatus_id;
  return isRequiredFieldMissing || props.isLoadingImport || !!avisosAlert.value;
});
</script>

<template>
  <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <!-- Título actualizado para reflejar el registro de Producto y Descripción -->
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Registrar Nuevo Producto y Descripción</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetParams()"></button>
          </div>
          <Suspense>
            <template #default>
              <!-- La función handleData('create', paramsA) debe manejar la lógica de crear ambas entidades. -->
              <form @submit.prevent="handleData('create', paramsA)">
                <div class="modal-body">
                  <div class="row">
                    
                    <!-- PRODUCTOS FIELDS (SECCIÓN REQUERIDA) -->
                    <h5 class="fw-bold mb-3 mt-0 text-red-600">Datos del Producto <span class="text-danger">(Requeridos)</span></h5>
                    
                    <div class="col-6 mb-3">
                      <label for="nombreProducto" class="badge text-secondary">Nombre del Producto<span class="text-danger">*</span></label>
                      <input 
                        id="nombreProducto"
                        type="text" 
                        class="form-control" 
                        pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s\-\{\}\(\)\+\*]+$"
                        :class="{'is-invalid':paramsA.nombre && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s\-\{\}\(\)\+\*]+$/.test(paramsA.nombre),'is-valid':paramsA.nombre && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s\-\{\}\(\)\+\*]+$/.test(paramsA.nombre)}" 
                        v-model="paramsA.nombre" 
                        placeholder="Nombre único del producto (e.g., Laptop HP Pavilion)" 
                        required 
                      />
                      <div class="form-text text-muted">Ej: Laptop, Monitor, Mouse. Debe ser único.</div>
                    </div>
                    
                    <div class="col-6 mb-3">
                      <label for="estatusProducto" class="badge text-secondary">Estatus<span class="text-danger">*</span></label>
                      <select id="estatusProducto" class="form-select" v-model="paramsA.estatus_id" required>
                        <option :value="null" disabled>Seleccione un estatus</option>
                        <!-- Asumiendo que relations[2] contiene la lista de Estatus -->
                        <option v-for="(estatus, index) in relations[2]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>

                    <!-- DESCRIPCION FIELDS (SECCIÓN OPCIONAL/DETALLE) -->
                    <h5 class="fw-bold mb-3 mt-3 text-red-600">Detalles y Especificaciones (Descripción)</h5>

                    <div class="col-4 mb-3">
                      <label for="serialDesc" class="badge text-secondary">Serial</label>
                      <input 
                        id="serialDesc"
                        type="text" 
                        class="form-control" 
                        :class="{ 'is-invalid': paramsA.serial && !/^[^<>{}\[\]]+$/.test(paramsA.serial), 'is-valid':paramsA.serial && paramsA.serial.length > 0 && /^[^<>{}\[\]]+$/.test(paramsA.serial)}"
                        v-model="paramsA.serial" 
                        placeholder="Número de serie" 
                      />
                    </div>
                    
                    <div class="col-4 mb-3">
                      <label for="modeloDesc" class="badge text-secondary">Modelo</label>
                      <input 
                        id="modeloDesc"
                        type="text" 
                        class="form-control" 
                        v-model="paramsA.modelo" 
                        placeholder="Modelo del dispositivo" 
                      />
                    </div>

                    <div class="col-4 mb-3">
                      <label for="marcaDesc" class="badge text-secondary">Marca</label>
                      <input 
                        id="marcaDesc"
                        type="text" 
                        class="form-control" 
                        v-model="paramsA.marca" 
                        placeholder="Marca del dispositivo" 
                      />
                    </div>

                    <div class="col-4 mb-3">
                      <label for="codigoDesc" class="badge text-secondary">Código</label>
                      <input 
                        id="codigoDesc"
                        type="text" 
                        class="form-control" 
                        v-model="paramsA.codigo" 
                        placeholder="Código interno o de fabricante" 
                      />
                    </div>

                    <div class="col-4 mb-3">
                      <label for="codigoInvDesc" class="badge text-secondary">Código Inventario</label>
                      <input 
                        id="codigoInvDesc"
                        type="text" 
                        class="form-control" 
                        v-model="paramsA.codigo_inv" 
                        placeholder="Código de inventario interno" 
                      />
                    </div>

                    <div class="col-4 mb-3">
                      <label for="dispositivoDesc" class="badge text-secondary">Dispositivo</label>
                      <input 
                        id="dispositivoDesc"
                        type="text" 
                        class="form-control" 
                        v-model="paramsA.dispositivo" 
                        placeholder="Tipo de dispositivo" 
                      />
                    </div>

                    <div class="col-12 mb-3">
                      <label for="observacionDesc" class="badge text-secondary">Observación</label>
                      <textarea 
                        id="observacionDesc"
                        class="form-control" 
                        :class="{ 'is-invalid': paramsA.observacion && !/^[^<>{}\[\]]+$/.test(paramsA.observacion), 'is-valid':paramsA.observacion && paramsA.observacion.length > 0 && /^[^<>{}\[\]]+$/.test(paramsA.observacion)}"
                        placeholder="Observaciones y detalles adicionales" 
                        v-model="paramsA.observacion"
                      ></textarea>
                    </div>

                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="resetParams()">Cancelar</button>
                  <button 
                    class="btn btn-outline-secondary text-red" 
                    type="submit" 
                    :disabled="isFormInvalid"
                  >
                    <span v-if="!isLoadingImport">Registrar</span>
                    <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                      Procesando...
                    </span>
                  </button>
                </div>
              </form>
            </template>
            <template #fallback>
              <div class="modal-body text-center py-5">
                <div class="spinner-border text-red" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 text-muted">Cargando formulario...</p>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>
</template>

<style scoped>
.text-red-600 {
  color: var(--institucional-m-cerezo);
}
.text-red {
    color: var(--institucional-m-cerezo) !important;
    border-color: var(--institucional-m-cerezo);
}
.btn-outline-secondary.text-red:hover {
    background-color: var(--institucional-m-cerezo);
    color: white !important;
}
</style>
