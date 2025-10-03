<script setup>
import { ref, watch } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import { validacionesUtils } from '@/components/utils/validacionesUtils'; 
import AlertComponents from '@/components/AlertComponents.vue';

const props = defineProps({
  handleData: {
    type: Function,
    default: null,
    required: true,
  },
  relations: {
    type: Array,
    default: () => [[], []],
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

const { dataPerfil } = storeToRefs(useLoginStore());
const modalAgregar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);
const paramsA = ref({
  producto_id: [],
});

const resetParams = () => {
  paramsA.value = {
    descripcion_id: [],
  };
  avisos.value = null;
  avisosAlert.value = null;
};

watch([
  () => paramsA.value?.codigo,
  () => paramsA.value?.dispositivo,
  () => paramsA.value?.marca,
  () => paramsA.value?.modelo,
  () => paramsA.value?.serial,
  () => paramsA.value?.codigo_inv,
  () => paramsA.value?.observacion,
],
  ([
  codigo, dispositivo,
  marca, modelo,
  serial, codigo_inv, observacion
  ]) => {
  const errors = [];
  const codigoError = validacionesUtils().formatValid(codigo);
  if (codigoError) errors.push(codigoError);
  const dispositivoError = validacionesUtils().textValid(dispositivo);
  if (dispositivoError) errors.push(dispositivoError);
  const marcaError = validacionesUtils().textValid(marca);
  if (marcaError) errors.push(marcaError);
  const modeloError = validacionesUtils().textValid(modelo);
  if (modeloError) errors.push(modeloError);
  const serialError = validacionesUtils().serialValid(serial);
  if (serialError) errors.push(serialError);
  const codigo_invError = validacionesUtils().skuValid(codigo_inv);
  if (codigo_invError) errors.push(codigo_invError);
  const observacionError = validacionesUtils().textareaValid(observacion);
  if (observacionError) errors.push(observacionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((codigo==='' || codigo===undefined)
  && (dispositivo==='' || dispositivo===undefined)
  && (marca==='' || marca===undefined)
  && (modelo==='' || modelo===undefined)
  && (serial==='' || serial===undefined)
  && (codigo_inv==='' || codigo_inv===undefined)
  && (observacion==='' || observacion===undefined))
  avisosAlert.value = null;
});
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});
</script>

<template>
  <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Agregar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetParams()"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('create', paramsA)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-2">
                      <label for="" class="badge text-secondary">codigo</label>
                      <input type="text" maxlength="6" pattern="^\d+$" class="form-control" :class="{'is-invalid':paramsA.codigo && !/^\d+$/.test(paramsA.codigo),'is-valid':paramsA.codigo && /^\d+$/.test(paramsA.codigo)}" v-model="paramsA.codigo" placeholder="codigo" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">dispositivo</label>
                      <!-- Corrected pattern attribute with a valid regex -->
                      <input type="text" pattern="^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$" class="form-control" :class="{'is-invalid':paramsA.dispositivo && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsA.dispositivo),'is-valid':paramsA.dispositivo && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsA.dispositivo)}" v-model="paramsA.dispositivo" placeholder="dispositivo" />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">marca<span class="text-danger">*</span></label>
                      <!-- Corrected pattern attribute with a valid regex -->
                      <input type="text" maxlength="15" pattern="^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$" class="form-control" :class="{'is-invalid':paramsA.marca && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsA.marca),'is-valid':paramsA.marca && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsA.marca)}" v-model="paramsA.marca" placeholder="marca" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">modelo<span class="text-danger">*</span></label>
                      <!-- Corrected pattern attribute with a valid regex -->
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$" class="form-control" :class="{'is-invalid':paramsA.modelo && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsA.modelo),'is-valid':paramsA.modelo && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsA.modelo)}" v-model="paramsA.modelo" placeholder="Modelo" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">serial<span class="text-danger">*</span></label>
                      <input type="text" maxlength="20" pattern="^[^<>/'`]{6,20}$" class="form-control" :class="{'is-invalid':paramsA.serial && !/^[^<>/'`]{6,20}$/.test(paramsA.serial),'is-valid':paramsA.serial && /^[^<>/'`]{6,20}$/.test(paramsA.serial)}" v-model="paramsA.serial" placeholder="XyZ_2025 - xyz-2025" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">codigo inventario</label>
                      <input type="text" maxlength="15" pattern="^[^<>/'`]{3,}-[A-Z0-9]{3,8}$" class="form-control" :class="{'is-invalid':paramsA.codigo_inv && !/^[^<>/'`]{3,}-[A-Z0-9]{3,8}$/.test(paramsA.codigo_inv),'is-valid':paramsA.codigo_inv && /^[^<>/'`]{3,}-[A-Z0-9]{3,8}$/.test(paramsA.codigo_inv)}" v-model="paramsA.codigo_inv" placeholder="PBA-A000123" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsA.producto?.nombre }}</span>
                      <select class="form-select" v-model="paramsA.producto_id" required>
                        <option v-for="(producto, index) in relations" :key="index" :value="producto.id" v-if="relations.length > 0">{{ producto.nombre }}</option>
                        <option selected v-else>Sin productos</option>
                      </select>
                    </div>
                    <div class="col-8">
                      <label for="" class="badge text-secondary">observación</label>
                      <!-- Corrected pattern in textarea's class binding -->
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.observacion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-]+$/.test(paramsA.observacion), 'is-valid':paramsA.observacion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-]+$/.test(paramsA.observacion) }" placeholder="Observación" v-model="paramsA.observacion"></textarea>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="resetParams()">Cancelar</button>
                  <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport">
                    <span v-if="!isLoadingImport">Agregar</span>
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
                <p class="mt-2 text-muted">Procesando archivo...</p>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>
</template>