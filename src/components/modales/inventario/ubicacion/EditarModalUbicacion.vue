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

watch(() => props.paramsE,() =>{},{ deep: true });
watch([
  () => props.paramsE?.origen,
  () => props.paramsE?.destino,
  () => props.paramsE?.piso,
  () => props.paramsE?.region,
  () => props.paramsE?.estado,
  () => props.paramsE?.capital,
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
                    <div class="col-8">
                      <label for="" class="badge text-secondary">Descripción del productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsE.descripcion_id" multiple required>
                        <option v-for="(descripcion, index) in relations[0]" :key="index" :value="descripcion.id">{{ descripcion?.producto?.nombre }} || {{ descripcion?.dispositivo }} || {{ descripcion?.modelo }} || {{ descripcion?.marca }} || {{ descripcion?.serial }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">origen</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsE.origen && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.origen),'is-valid':paramsE.origen && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.origen)}" v-model="paramsE.origen" placeholder="Origen" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">destino<span class="text-danger">*</span></label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsE.destino && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.destino),'is-valid':paramsE.destino && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.destino)}" v-model="paramsE.destino" placeholder="Destino" required />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">piso</label>
                      <input type="text" inputmode="numeric" maxlength="2" pattern="^(PB|pb|\d+|S[0-9]|s[0-9])$" class="form-control" :class="{'is-invalid':paramsE.piso && !/^(PB|pb|\d+|S[0-9]|s[0-9])$/.test(paramsE.piso),'is-valid':paramsE.piso && /^(PB|pb|\d+|S[0-9]|s[0-9])$/.test(paramsE.piso)}" v-model="paramsE.piso" placeholder="Piso" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Región</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsE.region && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.region),'is-valid':paramsE.region && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.region)}" v-model="paramsE.region" placeholder="region"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Estado</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsE.estado && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.estado),'is-valid':paramsE.estado && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.estado)}" v-model="paramsE.estado" placeholder="estado"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">capítal</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsE.capital && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.capital),'is-valid':paramsE.capital && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.capital)}" v-model="paramsE.capital" placeholder="capital"  />
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