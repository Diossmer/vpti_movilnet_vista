<script setup>
import { ref, watch, computed } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
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
  isLoadingImport: {
    type: Boolean,
    default: false,
    required: true,
  },
  response: {
    type: [Object, null], 
    default: null,
  },
});

const { dataPerfil } = useLoginStore();
const avisos = ref(null);
const avisosAlert = ref(null);
const dispositivos = ref(['entrada', 'salida'])

// --- ESTADO INICIAL PARA EL REGISTRO DE PRODUCTO Y DESCRIPCION ---
const paramsA = ref({
  // PRODUCTOS Fields
  nombre: '',
  // DESCRIPCION Fields
  codigo: '',
  modelo: '',
  serial: '',
  marca: '',
  codigo_inv: '',
  observacion: '',
});

const resetParams = () => {
  paramsA.value = {
    nombre: '',
    codigo: '',
    modelo: '',
    serial: '',
    marca: '',
    codigo_inv: '',
    observacion: '',
  };
  avisos.value = null;
  avisosAlert.value = null;
};

// --- VALIDACIONES DE CAMPOS ---
// Validamos el nombre (requerido, sin números al inicio) y campos de texto/textarea del mismo orden del HTML
watch([
  () => paramsA.value?.nombre,
  () => paramsA.value?.serial,
  () => paramsA.value?.modelo,
  () => paramsA.value?.marca,
  () => paramsA.value?.codigo,
  () => paramsA.value?.codigo_inv,
  () => paramsA.value?.observacion,
],
  ([
  nombre, serial, modelo, marca, codigo, codigo_inv, observacion
  ]) => {
  const errors = [];
  const nombreError = validacionesUtils().nombreValid(nombre);
  if (nombreError) errors.push(nombreError);

  const serialError = validacionesUtils().serialValid(serial);
  if (serialError) errors.push(serialError);

  const modeloError = validacionesUtils().textValid(modelo);
  if (modeloError) errors.push(modeloError);

  const marcaError = validacionesUtils().textValid(marca);
  if (marcaError) errors.push(marcaError);

  const codigoError = validacionesUtils().formatValid(codigo);
  if (codigoError) errors.push(codigoError);

  const codigo_invError = validacionesUtils().skuValid(codigo_inv);
  if (codigo_invError) errors.push(codigo_invError);

  const observacionError = validacionesUtils().textareaValid(observacion);
  if (observacionError) errors.push(observacionError);
  
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((nombre==='' || nombre===undefined)
  && (serial==='' || serial===undefined)
  && (modelo==='' || modelo===undefined)
  && (marca==='' || marca===undefined)
  && (codigo==='' || codigo===undefined)
  && (codigo_inv==='' || codigo_inv===undefined)
  && (observacion==='' || observacion===undefined))
  avisosAlert.value = null;
});

// Se define una variable para deshabilitar el botón de registrar si faltan campos requeridos
const isFormInvalid = computed(() => {
  const isRequiredFieldMissing = !paramsA.value.nombre || 
                                 !paramsA.value.serial || 
                                 !paramsA.value.modelo || 
                                 !paramsA.value.marca
  return isRequiredFieldMissing;
});
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});
</script>

<template>
  <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <!-- Título actualizado para reflejar el registro de Producto y Descripción -->
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Registrar Nuevo Producto y Descripción</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetParams()"></button>
          </div>
          <Suspense>
            <template #default>
              <!-- La función handleData('createall', paramsA) debe manejar la lógica de crear ambas entidades. -->
              <form @submit.prevent="handleData('create', paramsA)">
                <div class="modal-body">
                  <div class="row justify-content-center">
                    
                    <!-- PRODUCTOS FIELDS (SECCIÓN REQUERIDA) -->
                    <h5 class="fw-bold mb-3 mt-0 text-red-600">Datos del Producto <span class="text-danger">(Requeridos)</span></h5>
                    
                    <div class="col-6 mb-3">
                      <label for="nombreProducto" class="badge text-secondary">Nombre del Producto<span class="text-danger">*</span></label>
                      <input 
                        id="nombreProducto"
                        type="text" 
                        class="form-control" 
                        pattern="^[A-Za-zÁ-Úá-úñÑ\s\d]+$"
                        :class="{'is-invalid':paramsA.nombre && !/^[A-Za-zÁ-Úá-úñÑ\s\d]+$/.test(paramsA.nombre),'is-valid':paramsA.nombre && /^[A-Za-zÁ-Úá-úñÑ\s\d]+$/.test(paramsA.nombre)}" 
                        v-model="paramsA.nombre" 
                        placeholder="Nombre único del producto" 
                        required 
                      />
                    </div>
                    
                    <!-- DESCRIPCION FIELDS (SECCIÓN OPCIONAL/DETALLE) -->
                    <h5 class="fw-bold mb-3 mt-3 text-red-600">Detalles y Especificaciones (Descripción)</h5>

                    <div class="col-4 mb-3">
                      <label for="serialDesc" class="badge text-secondary">Serial<span class="text-danger">*</span></label>
                      <input 
                        id="serialDesc"
                        type="text" 
                        class="form-control" 
                        :class="{ 'is-invalid': paramsA.serial && !/^[^<>/'`]{6,20}$/.test(paramsA.serial), 'is-valid':paramsA.serial && paramsA.serial.length > 0 && /^[^<>/'`]{6,20}$/.test(paramsA.serial)}"
                        v-model="paramsA.serial" 
                        placeholder="Número de serie"
                        required
                      />
                    </div>
                    
                    <div class="col-4 mb-3">
                      <label for="modeloDesc" class="badge text-secondary">Modelo<span class="text-danger">*</span></label>
                      <input 
                        id="modeloDesc"
                        type="text" 
                        class="form-control"
                        :class="{'is-invalid':paramsA.modelo && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*\d]+$/.test(paramsA.modelo),'is-valid':paramsA.modelo && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*\d]+$/.test(paramsA.modelo)}"
                        v-model="paramsA.modelo" 
                        placeholder="Modelo del dispositivo"
                        required
                      />
                    </div>

                    <div class="col-4 mb-3">
                      <label for="marcaDesc" class="badge text-secondary">Marca<span class="text-danger">*</span></label>
                      <input 
                        id="marcaDesc"
                        type="text" 
                        class="form-control"
                        :class="{'is-invalid':paramsA.marca && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsA.marca),'is-valid':paramsA.marca && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsA.marca)}"
                        v-model="paramsA.marca" 
                        placeholder="Marca del dispositivo"
                        required
                      />
                    </div>

                    <div class="col-4 mb-3">
                      <label for="codigoDesc" class="badge text-secondary">Código</label>
                      <input 
                        id="codigoDesc"
                        type="text" 
                        class="form-control"
                        :class="{'is-invalid':paramsA.codigo && !/^\d+$/.test(paramsA.codigo),'is-valid':paramsA.codigo && /^\d+$/.test(paramsA.codigo)}"
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
                        :class="{'is-invalid':paramsA.codigo_inv && !/^[^<>/'`]{3,}[A-Z0-9]{3,8}$/.test(paramsA.codigo_inv),'is-valid':paramsA.codigo_inv && /^[^<>/'`]{3,}[A-Z0-9]{3,8}$/.test(paramsA.codigo_inv)}"
                        v-model="paramsA.codigo_inv" 
                        placeholder="Código de inventario interno" 
                      />
                    </div>

                    <div class="col-4">
                      <label for="" class="badge text-secondary">Dispositivo<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsA.dispositivo }}</span>
                      <select class="form-select" v-model="paramsA.dispositivo" required>
                        <option v-for="(dispositivo, index) in dispositivos" :key="index" :value="dispositivo" v-if="dispositivos?.length > 0">{{ dispositivo }}</option>
                        <option selected v-else>Sin dispositivo</option>
                      </select>
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
                    :disabled="isFormInvalid">
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
