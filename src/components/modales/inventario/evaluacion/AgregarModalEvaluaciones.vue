<script setup>
import { ref, watch, defineProps } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';

defineProps({
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
});

const loginStore = useLoginStore();
const { dataPerfil } = storeToRefs(loginStore);
const modalAgregar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);
const paramsA = ref({});

watch([() => paramsA.value?.estado_fisico,
() => paramsA.value?.notas,
() => paramsA.value?.escala,
() => paramsA.value?.compatibilidad,
() => paramsA.value?.reemplazo,
() => paramsA.value?.mantenimineto], ([
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
  avisosAlert.value="";
});
</script>

<template>
  <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Agregar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('create')">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estado_fisico</label>
                      <input type="text" maxlength="25" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid':paramsA.estado_fisico && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.estado_fisico),'is-valid':paramsA.estado_fisico && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.estado_fisico)}" v-model="paramsA.estado_fisico" placeholder="Estado Fisico" required />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">escala</label>
                      <input type="text" maxlength="10" inputmode="numeric" pattern="^\d+\s*[a-zA-Z]+(?:\s+\d+\s*[a-zA-Z]+)*$" class="form-control" :class="{'is-invalid': paramsA.escala && !/^\d+\s*[a-zA-Z]+(?:\s+\d+\s*[a-zA-Z]+)*$/.test(paramsA.escala),'is-valid': paramsA.escala && /^\d+\s*[a-zA-Z]+(?:\s+\d+\s*[a-zA-Z]+)*$/.test(paramsA.escala)}" v-model="paramsA.escala" placeholder="Escala"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">compatibilidad</label>
                      <input type="text" maxlength="25" pattern="[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid': paramsA.compatibilidad && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.compatibilidad),'is-valid': paramsA.compatibilidad && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.compatibilidad)}" v-model="paramsA.compatibilidad" placeholder="Compatibilidad"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">reemplazo</label>
                      <input type="text" maxlength="25" pattern="[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid': paramsA.reemplazo && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.reemplazo),'is-valid': paramsA.reemplazo && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.reemplazo)}" v-model="paramsA.reemplazo" placeholder="Reemplazo"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">mantenimineto</label>
                      <input type="text" maxlength="25" pattern="[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid': paramsA.mantenimineto && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.mantenimineto),'is-valid': paramsA.mantenimineto && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.mantenimineto)}" v-model="paramsA.mantenimineto" placeholder="Mantenimineto"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.producto_id" required>
                        <option v-for="(producto, index) in relations[0]" :key="index" :value="producto.id">{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.estatus_id" required>
                        <option v-for="(estatus, index) in relations[1]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">descripcion del producto<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.descripcion_id" required>
                        <option v-for="(descripcion, index) in relations[2]" :key="index" :value="descripcion.id">Modelo:{{ descripcion.modelo }} | Codigo: {{ descripcion.codigo }}</option>
                      </select>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">Observación</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.notas && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.notas), 'is-valid':paramsA.notas && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.notas) }" placeholder="Observación" v-model="paramsA.notas"></textarea>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="paramsA = {}, avisos = null, avisosAlert = null">Cancelar</button>
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