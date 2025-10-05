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

const { dataPerfil } = storeToRefs(useLoginStore());
const modalEditar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);
const dispositivos = ref(['entrada', 'salida'])

watch(() => props.paramsE,() =>{},{ deep: true });
watch([
  () => props.paramsE?.codigo,
  () => props.paramsE?.dispositivo,
  () => props.paramsE?.marca,
  () => props.paramsE?.modelo,
  () => props.paramsE?.serial,
  () => props.paramsE?.codigo_inv,
  () => props.paramsE?.observacion,
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
  <div class="modal fade" id="staticEditar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalEditar">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Actualizar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('update', paramsE, paramsE.id)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-2">
                      <label for="" class="badge text-secondary">codigo</label>
                      <input type="text" maxlength="6" pattern="^\d+$" class="form-control" :class="{'is-invalid':paramsE.codigo && !/^\d+$/.test(paramsE.codigo),'is-valid':paramsE.codigo && /^\d+$/.test(paramsE.codigo)}" v-model="paramsE.codigo" placeholder="codigo" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">dispositivo<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.dispositivo }}</span>
                      <select class="form-select" v-model="paramsE.dispositivo" required>
                        <option v-for="(dispositivo, index) in dispositivos" :key="index" :value="dispositivo" v-if="relations.length > 0">{{ dispositivo }}</option>
                        <option selected v-else>Sin dispositivo</option>
                      </select>
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">marca<span class="text-danger">*</span></label>
                      <!-- Corrected pattern attribute with a valid regex -->
                      <input type="text" maxlength="15" pattern="^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$" class="form-control" :class="{'is-invalid':paramsE.marca && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsE.marca),'is-valid':paramsE.marca && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*]+$/.test(paramsE.marca)}" v-model="paramsE.marca" placeholder="marca" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">modelo<span class="text-danger">*</span></label>
                      <!-- Corrected pattern attribute with a valid regex -->
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*\d]+$" class="form-control" :class="{'is-invalid':paramsE.modelo && !/^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*\d]+$/.test(paramsE.modelo),'is-valid':paramsE.modelo && /^[A-Za-zÁ-Úá-úñÑ\s\-\(\)\*\d]+$/.test(paramsE.modelo)}" v-model="paramsE.modelo" placeholder="Modelo" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">serial<span class="text-danger">*</span></label>
                      <input type="text" maxlength="20" pattern="^[^<>/'`]{6,20}$" class="form-control" :class="{'is-invalid':paramsE.serial && !/^[^<>/'`]{6,20}$/.test(paramsE.serial),'is-valid':paramsE.serial && /^[^<>/'`]{6,20}$/.test(paramsE.serial)}" v-model="paramsE.serial" placeholder="XyZ_2025 - xyz-2025" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">codigo_inv</label>
                      <input type="text" maxlength="15" pattern="^[^<>/'`]{3,}-[A-Z0-9]{3,8}$" class="form-control" :class="{'is-invalid':paramsE.codigo_inv && !/^[^<>/'`]{3,}-[A-Z0-9]{3,8}$/.test(paramsE.codigo_inv),'is-valid':paramsE.codigo_inv && /^[^<>/'`]{3,}-[A-Z0-9]{3,8}$/.test(paramsE.codigo_inv)}" v-model="paramsE.codigo_inv" placeholder="PBA-A000123" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.producto?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.producto_id" required>
                        <option v-for="(producto, index) in relations[0]" :key="index" :value="producto.id">{{ producto.nombre }}</option>
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