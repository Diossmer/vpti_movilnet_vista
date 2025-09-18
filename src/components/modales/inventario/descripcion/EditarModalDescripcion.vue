<script setup>
import { ref, watch, defineProps } from 'vue';
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
  paramsE: {
    type: Object,
    default: () => ({}),
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

const modalEditar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);

watch(() => props.paramsE,() =>{},{ deep: true });
watch([
  () => props.paramsE?.codigo,
  () => props.paramsE?.dispositivo,
  () => props.paramsE?.tamaño,
  () => props.paramsE?.marca,
  () => props.paramsE?.nucleo,
  () => props.paramsE?.modelo,
  () => props.paramsE?.serial,
  () => props.paramsE?.codigo_inv,
  () => props.paramsE?.observacion,
],
  ([
  codigo, dispositivo, tamaño,
  marca, nucleo, modelo,
  serial, codigo_inv, observacion
  ]) => {
  const errors = [];
  const codigoError = validacionesUtils().formatValid(codigo);
  if (codigoError) errors.push(codigoError);
  const dispositivoError = validacionesUtils().textValid(dispositivo);
  if (dispositivoError) errors.push(dispositivoError);
  const marcaError = validacionesUtils().textValid(marca);
  if (marcaError) errors.push(marcaError);
  const tamañoError = validacionesUtils().sizeValid(tamaño);
  if (tamañoError) errors.push(tamañoError);
  const nucleoError = validacionesUtils().textValid(nucleo);
  if (nucleoError) errors.push(nucleoError);
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
  && (tamaño==='' || tamaño===undefined)
  && (nucleo==='' || nucleo===undefined)
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
  <div class="modal fade" id="staticEditar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalEditar" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Actualizar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('update', paramsE, paramsE.id)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-2">
                      <label for="" class="badge text-secondary">codigo</label>
                      <input type="text" maxlength="6" pattern="^(\d+|X{0,2}[SLM]|X{3}L?)*$" class="form-control" :class="{'is-invalid':paramsE.codigo && !/^(\d+|X{0,2}[SLM]|X{3}L?)*$/.test(paramsE.codigo),'is-valid':paramsE.codigo && /^(\d+|X{0,2}[SLM]|X{3}L?)*$/.test(paramsE.codigo)}" v-model="paramsE.codigo" placeholder="codigo" />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">dispositivo</label>
                      <!-- Corrected pattern attribute with a valid regex -->
                      <input type="text" maxlength="10" pattern="^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$" class="form-control" :class="{'is-invalid':paramsE.dispositivo && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsE.dispositivo),'is-valid':paramsE.dispositivo && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsE.dispositivo)}" v-model="paramsE.dispositivo" placeholder="dispositivo" />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">marca</label>
                      <!-- Corrected pattern attribute with a valid regex -->
                      <input type="text" maxlength="15" pattern="^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$" class="form-control" :class="{'is-invalid':paramsE.marca && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsE.marca),'is-valid':paramsE.marca && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsE.marca)}" v-model="paramsE.marca" placeholder="marca" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">modelo</label>
                      <!-- Corrected pattern attribute with a valid regex -->
                      <input type="text" maxlength="10" pattern="^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$" class="form-control" :class="{'is-invalid':paramsE.modelo && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsE.modelo),'is-valid':paramsE.modelo && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsE.modelo)}" v-model="paramsE.modelo" placeholder="Modelo" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">serial</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-z0-9\-_]{6,20}$" class="form-control" :class="{'is-invalid':paramsE.serial && !/^[A-Za-z0-9\-_]{6,20}$/.test(paramsE.serial),'is-valid':paramsE.serial && /^[A-Za-z0-9\-_]{6,20}$/.test(paramsE.serial)}" v-model="paramsE.serial" placeholder="XyZ_2025 - xyz-2025 - xyz2025" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">codigo_inv</label>
                      <input type="text" maxlength="15" pattern="^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$" class="form-control" :class="{'is-invalid':paramsE.codigo_inv && !/^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$/.test(paramsE.codigo_inv),'is-valid':paramsE.codigo_inv && /^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$/.test(paramsE.codigo_inv)}" v-model="paramsE.codigo_inv" placeholder="codigo_inv-ABC123" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.producto?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.producto_id" required>
                        <option v-for="(producto, index) in relations" :key="index" :value="producto.id">{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-8">
                      <label for="" class="badge text-secondary">observación</label>
                      <!-- Corrected pattern in textarea's class binding -->
                      <textarea class="form-control" :class="{ 'is-invalid': paramsE.observacion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-]+$/.test(paramsE.observacion), 'is-valid':paramsE.observacion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-]+$/.test(paramsE.observacion) }" placeholder="Observación" v-model="paramsE.observacion"></textarea>
                    </div>

                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Cancelar</button>
                  <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport">
                    <span v-if="!isLoadingImport">Actualizar</span>
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