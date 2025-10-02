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
  descripcion_id: [],
});

const resetParams = () => {
  paramsA.value = {
    descripcion_id: [],
  };
  avisos.value = null;
  avisosAlert.value = null;
};

watch([
() => paramsA.value?.escala,
() => paramsA.value?.compatibilidad,
() => paramsA.value?.reemplazo,
() => paramsA.value?.mantenimiento], ([
  escala,
  compatibilidad,
  reemplazo,
  mantenimiento]) => {
  const errors = [];
  const CompatibilidadError = validacionesUtils().textValid(compatibilidad);
  if (CompatibilidadError) errors.push(CompatibilidadError);
  const ReemplazoError = validacionesUtils().textValid(reemplazo);
  if (ReemplazoError) errors.push(ReemplazoError);
  const mantenimientoError = validacionesUtils().textValid(mantenimiento);
  if (mantenimientoError) errors.push(mantenimientoError);
  const escalaError = validacionesUtils().sizeValid(escala);
  if (escalaError) errors.push(escalaError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((compatibilidad==='' || compatibilidad===undefined)
  && (reemplazo==='' || reemplazo===undefined)
  && (mantenimiento==='' || mantenimiento===undefined)
  && (escala==='' || escala===undefined))
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
                    <div class="col-8">
                      <label for="" class="badge text-secondary">Descripción del productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.descripcion_id" multiple required>
                        <option v-for="(descripcion, index) in relations[1]" :key="index" :value="descripcion.id" selected v-if="relations.length > 0">{{ descripcion?.producto?.nombre }} || {{ descripcion?.dispositivo }} || {{ descripcion?.modelo }} || {{ descripcion?.marca }} || {{ descripcion?.serial }}</option>
                        <option selected v-else>Sin descripcion del producto</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">escala</label>
                      <input type="text" maxlength="20" pattern="^(critico|alto|medio|bajo|regular|resuelto)$" class="form-control" :class="{'is-invalid': paramsA.escala && !/^(critico|alto|medio|bajo|regular|resuelto)$/.test(paramsA.escala),'is-valid': paramsA.escala && /^(critico|alto|medio|bajo|regular|resuelto)$/.test(paramsA.escala)}" v-model="paramsA.escala" placeholder="Escala"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">compatibilidad</label>
                      <!-- Regex corrected to escape special characters -->
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': paramsA.compatibilidad && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.compatibilidad),'is-valid': paramsA.compatibilidad && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.compatibilidad)}" v-model="paramsA.compatibilidad" placeholder="Compatibilidad"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">reemplazo</label>
                      <!-- Regex corrected to escape special characters -->
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': paramsA.reemplazo && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.reemplazo),'is-valid': paramsA.reemplazo && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.reemplazo)}" v-model="paramsA.reemplazo" placeholder="Reemplazo"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">mantenimiento</label>
                      <!-- Regex corrected to escape special characters -->
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': paramsA.mantenimiento && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.mantenimiento),'is-valid': paramsA.mantenimiento && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.mantenimiento)}" v-model="paramsA.mantenimiento" placeholder="Mantenimiento"  />
                    </div>
                    
                    <div class="col-8">
                      <label for="" class="badge text-secondary">Observación</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.notas && !/^[^<>{}\[\]]+$/.test(paramsA.notas), 'is-valid':paramsA.notas && /^[^<>{}\[\]]+$/.test(paramsA.notas) }" placeholder="Observación" v-model="paramsA.notas"></textarea>
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
