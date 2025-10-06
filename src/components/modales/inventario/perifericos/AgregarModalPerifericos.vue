<script setup>
import { ref, watch, computed } from 'vue';
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
const INITIAL_PARAMS = {
  producto_id: [],
  descripcion_id: [],
  seleccion: null,
};
const paramsA = ref({ ...INITIAL_PARAMS });
const resetParams = () => {
  // Reinicia a una COPIA del objeto inicial, no a null
  paramsA.value = { ...INITIAL_PARAMS }; 
  avisos.value = null;
  avisosAlert.value = null;
};

watch([/* () => paramsA.value?.cantidad_existente, */
() => paramsA.value?.entrada,
() => paramsA.value?.salida,
() => paramsA.value?.observacion], ([/* cantidad_existente, */ entrada, salida, observacion]) => {
  const errors = [];
  /* const cantidad_existenteError = validacionesUtils().numberValid(cantidad_existente);
  if (cantidad_existenteError) errors.push(cantidad_existenteError); */
  const entradaError = validacionesUtils().numberValid(entrada);
  if (entradaError) errors.push(entradaError);
  const salidaError = validacionesUtils().numberValid(salida);
  if (salidaError) errors.push(salidaError);
  const observacionError = validacionesUtils().textareaValid(observacion);
  if (observacionError) errors.push(observacionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if (//(cantidad_existente==='' || cantidad_existente===undefined)
  (entrada==='' || entrada===undefined)
  && (salida==='' || salida===undefined)
  && (observacion==='' || observacion===undefined))
  avisosAlert.value = null;
});
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});

const filtereddescripcion = computed(() => {
  // 1. You correctly made this line safe. alldescripcion is now guaranteed to be an array.
  const alldescripcion = Array.isArray(props.relations[1]) ? props.relations[1] : []; 
  
  const restricteddescripcionNames = ['salida'];
  
  if (dataPerfil.value?.descripcion?.id !== 1) {
    // 2. The fix: Remove the optional chaining (?.), as alldescripcion is an Array.
    return alldescripcion?.filter(descripcion =>
      !restricteddescripcionNames.includes(descripcion?.dispositivo)
    );
  }
  
  return alldescripcion;
});
</script>

<template>
  <div class="modal fade" id="staticAgregar1" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
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
                    <span class="text-red">cantidad seleccionada: <b>{{ paramsA?.descripcion_id?.length }}</b></span>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">Descripción del productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.descripcion_id" multiple required>
                        <option v-for="(descripcion, index) in filtereddescripcion" :key="index" :value="descripcion.id" selected v-if="relations.length > 0">{{ descripcion?.producto?.nombre }} || {{ descripcion?.dispositivo }} || {{ descripcion?.modelo }} || {{ descripcion?.marca }} || {{ descripcion?.serial }}</option>
                        <option selected v-else>Sin descripcion del producto</option>
                      </select>
                    </div>
                    <!-- <div class="col-3">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.producto_id" multiple required>
                        <option v-for="(producto, index) in relations[1]" :key="index" :value="producto.id" selected>{{ producto.nombre }}</option>
                      </select>
                    </div> -->
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <!-- <div class="col-2">
                      <label for="" class="badge text-secondary">Cantidad Existente<span class="text-danger">*</span></label>
                      <input type="text" inputmode="numeric" maxlength="10"  pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsA.cantidad_existente && !/^\d+(^\.\d+)?$/.test(paramsA.cantidad_existente),'is-valid': paramsA.cantidad_existente && /^\d+(^\.\d+)?$/.test(paramsA.cantidad_existente)}" v-model="paramsA.cantidad_existente" placeholder="Cantidad Existente" required />
                    </div> -->
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Entrada</label>
                      <input type="text" inputmode="numeric" maxlength="10" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsA.entrada && !/^\d+(^\.\d+)?$/.test(paramsA.entrada),'is-valid': paramsA.entrada && /^\d+(^\.\d+)?$/.test(paramsA.entrada)}" v-model="paramsA.entrada" placeholder="Entrada"/>
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Salida</label>
                      <input type="text" inputmode="numeric" maxlength="10" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsA.salida && !/^\d+(^\.\d+)?$/.test(paramsA.salida),'is-valid': paramsA.salida && /^\d+(^\.\d+)?$/.test(paramsA.salida)}" v-model="paramsA.salida" placeholder="Salida"/>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">observación</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.observacion && !/^[^<>{}\[\]]+$/.test(paramsA.observacion), 'is-valid':paramsA.observacion && /^[^<>{}\[\]]+$/.test(paramsA.observacion)}" placeholder="Descripción" v-model="paramsA.observacion"></textarea>
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