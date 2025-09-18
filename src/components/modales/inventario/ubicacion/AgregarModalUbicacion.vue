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

const loginStore = useLoginStore();
const { dataPerfil } = storeToRefs(loginStore);
const modalAgregar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);
const paramsA = ref({});

watch([
  () => paramsA.value?.origen,
  () => paramsA.value?.destino,
  () => paramsA.value?.piso,
  () => paramsA.value?.region,
  () => paramsA.value?.estado,
  () => paramsA.value?.capital,
], ([origen, destino, piso, region, estado, capital]) => {
  const errors = [];
  const origenError = validacionesUtils().textValid(origen);
  if (origenError) errors.push(origenError);
  const destinoError = validacionesUtils().textValid(destino);
  if (destinoError) errors.push(destinoError);
  const pisoError = validacionesUtils().pisoValid(piso);
  if (pisoError) errors.push(pisoError);
  const regionError = validacionesUtils().textValid(region);
  if (regionError) errors.push(regionError);
  const estadoError = validacionesUtils().textValid(estado);
  if (estadoError) errors.push(estadoError);
  const capitalError = validacionesUtils().textValid(capital);
  if (capitalError) errors.push(capitalError);

  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((origen==='' || origen===undefined)
  && (destino === '' || destino===undefined)
  && (piso === '' || piso===undefined)
  && (region === '' || region===undefined)
  && (estado === '' || estado===undefined)
  && (capital === '' || capital===undefined)
)avisosAlert.value = null;
});
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});
const resetForm = () => {
  paramsA.value = {};
  avisos.value = null;
  avisosAlert.value = null;
};
</script>

<template>
  <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Agregar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetForm"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('create', paramsA)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-4">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.producto_id" multiple required>
                        <option v-for="(producto, index) in relations[0]" :key="index" :value="producto.id" selected>{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">descripcion del producto<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.descripcion_id" required>
                        <option v-for="(descripcion, index) in relations[1]" :key="index" :value="descripcion.id">Modelo:{{ descripcion.modelo }} | Codigo: {{ descripcion.codigo }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">origen</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsA.origen && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.origen),'is-valid':paramsA.origen && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.origen)}" v-model="paramsA.origen" placeholder="Origen" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">destino<span class="text-danger">*</span></label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsA.destino && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.destino),'is-valid':paramsA.destino && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.destino)}" v-model="paramsA.destino" placeholder="Destino" required />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">piso</label>
                      <input type="text" inputmode="numeric" maxlength="2" pattern="^(PB|pb|\d+|S[0-9]|s[0-9])$" class="form-control" :class="{'is-invalid':paramsA.piso && !/^(PB|pb|\d+|S[0-9]|s[0-9])$/.test(paramsA.piso),'is-valid':paramsA.piso && /^(PB|pb|\d+|S[0-9]|s[0-9])$/.test(paramsA.piso)}" v-model="paramsA.piso" placeholder="Piso" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Región</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsA.region && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.region),'is-valid':paramsA.region && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.region)}" v-model="paramsA.region" placeholder="Region"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Estado</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsA.estado && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.estado),'is-valid':paramsA.estado && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.estado)}" v-model="paramsA.estado" placeholder="Estado"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">capítal</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsA.capital && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.capital),'is-valid':paramsA.capital && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.capital)}" v-model="paramsA.capital" placeholder="Capital"  />
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="resetForm">Cancelar</button>
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