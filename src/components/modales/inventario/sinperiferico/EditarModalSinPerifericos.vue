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
});

const loginStore = useLoginStore();
const { dataPerfil } = storeToRefs(loginStore);
const modalEditar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);

watch(() => props.paramsE,() =>{},{ deep: true });
watch([() => props.paramsE?.cantidad_existente,
() => props.paramsE?.entrada,
() => props.paramsE?.salida,
() => props.paramsE?.descripcion], ([cantidad_existente, entrada, salida, descripcion]) => {
  const errors = [];
  const cantidad_existenteError = validacionesUtils().numberValid(cantidad_existente);
  if (cantidad_existenteError) errors.push(cantidad_existenteError);
  const entradaError = validacionesUtils().numberValid(entrada);
  if (entradaError) errors.push(entradaError);
  const salidaError = validacionesUtils().numberValid(salida);
  if (salidaError) errors.push(salidaError);
  const descripcionError = validacionesUtils().textareaValid(descripcion);
  if (descripcionError) errors.push(descripcionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((cantidad_existente==='' || cantidad_existente===undefined)
  && (entrada==='' || entrada===undefined)
  && (salida==='' || salida===undefined)
  && (descripcion==='' || descripcion===undefined))
  avisosAlert.value="";
});
</script>

<template>
  <div class="modal fade" id="staticEditar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalEditar" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Actualizar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('update', paramsE.id)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-3">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.producto?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.producto_id" multiple required>
                        <option v-for="(producto, index) in relations[1]" :key="index" :value="producto.id">{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-3">
                      <label for="" class="badge text-secondary">estatus actual<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.estatus?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Cantidad Existente<span class="text-danger">*</span></label>
                      <input type="text" inputmode="numeric" maxlength="10"  pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsE.cantidad_existente && !/^\d+(^\.\d+)?$/.test(paramsE.cantidad_existente),'is-valid': paramsE.cantidad_existente && /^\d+(^\.\d+)?$/.test(paramsE.cantidad_existente)}" v-model="paramsE.cantidad_existente" placeholder="Cantidad Existente" required />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Entrada</label>
                      <input type="text" inputmode="numeric" maxlength="10" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsE.entrada && !/^\d+(^\.\d+)?$/.test(paramsE.entrada),'is-valid': paramsE.entrada && /^\d+(^\.\d+)?$/.test(paramsE.entrada)}" v-model="paramsE.entrada" placeholder="Entrada"/>
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Salida</label>
                      <input type="text" inputmode="numeric" maxlength="10" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsE.salida && !/^\d+(^\.\d+)?$/.test(paramsE.salida),'is-valid': paramsE.salida && /^\d+(^\.\d+)?$/.test(paramsE.salida)}" v-model="paramsE.salida" placeholder="Salida"/>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">descripción</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsE.descripcion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.descripcion), 'is-valid':paramsE.descripcion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.descripcion)}" placeholder="Descripción" v-model="paramsE.descripcion"></textarea>
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