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
watch([() => props.paramsE?.estado_fisico,
() => props.paramsE?.notas,
() => props.paramsE?.escala,
() => props.paramsE?.compatibilidad,
() => props.paramsE?.reemplazo,
() => props.paramsE?.mantenimineto], ([
  estado_fisico,
  notas,
  escala,
  compatibilidad,
  reemplazo,
  mantenimineto]) => {
  const errors = [];
  const EstadoFisicoError = validacionesUtils().textValid(estado_fisico);
  if (EstadoFisicoError) errors.push(EstadoFisicoError);
  const CompatibilidadError = validacionesUtils().textValid(compatibilidad);
  if (CompatibilidadError) errors.push(CompatibilidadError);
  const ReemplazoError = validacionesUtils().textValid(reemplazo);
  if (ReemplazoError) errors.push(ReemplazoError);
  const ManteniminetoError = validacionesUtils().textValid(mantenimineto);
  if (ManteniminetoError) errors.push(ManteniminetoError);
  const notaError = validacionesUtils().textareaValid(notas);
  if (notaError) errors.push(notaError);
  const escalaError = validacionesUtils().sizeValid(escala);
  if (escalaError) errors.push(escalaError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((estado_fisico==='' || estado_fisico===undefined)
  && (notas==='' || notas===undefined)
  && (compatibilidad==='' || compatibilidad===undefined)
  && (reemplazo==='' || reemplazo===undefined)
  && (mantenimineto==='' || mantenimineto===undefined)
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
                        <option v-for="(descripcion, index) in relations[1]" :key="index" :value="descripcion.id">{{ descripcion?.producto?.nombre }} || {{ descripcion?.dispositivo }} || {{ descripcion?.modelo }} || {{ descripcion?.marca }} || {{ descripcion?.serial }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.estatus?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">escala</label>
                      <input type="text" maxlength="10" inputmode="numeric" pattern="^\d+\s*[a-zA-Z]+(?:\s+\d+\s*[a-zA-Z]+)*$" class="form-control" :class="{'is-invalid': paramsE.escala && !/^\d+\s*[a-zA-Z]+(?:\s+\d+\s*[a-zA-Z]+)*$/.test(paramsE.escala),'is-valid': paramsE.escala && /^\d+\s*[a-zA-Z]+(?:\s+\d+\s*[a-zA-Z]+)*$/.test(paramsE.escala)}" v-model="paramsE.escala" placeholder="Escala"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">compatibilidad</label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': paramsE.compatibilidad && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.compatibilidad),'is-valid': paramsE.compatibilidad && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.compatibilidad)}" v-model="paramsE.compatibilidad" placeholder="Compatibilidad"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">reemplazo</label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': paramsE.reemplazo && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.reemplazo),'is-valid': paramsE.reemplazo && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.reemplazo)}" v-model="paramsE.reemplazo" placeholder="Reemplazo"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">mantenimiento</label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': paramsE.mantenimiento && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.mantenimiento),'is-valid': paramsE.mantenimiento && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsE.mantenimiento)}" v-model="paramsE.mantenimiento" placeholder="Mantenimineto"  />
                    </div>
                    <div class="col-8">
                      <label for="" class="badge text-secondary">Observación</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsE.notas && !/^[^<>{}\[\]]+$/.test(paramsE.notas), 'is-valid':paramsE.notas && /^[^<>{}\[\]]+$/.test(paramsE.notas) }" placeholder="Observación" v-model="paramsE.notas"></textarea>
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
