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
    default: () => ({
      producto_id: [],
    }),
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
const modalEditar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);

watch(() => props.paramsE, (newVal) => {
  if (newVal && !Array.isArray(newVal.producto_id)) {
    newVal.producto_id = [];
  }
}, { immediate: true });
watch([() => props.paramsE?.comentario], ([comentario]) => {
  const errors = [];
  const comentarioError = validacionesUtils().textareaValid(comentario);
  if (comentarioError) errors.push(comentarioError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((comentario==='' || comentario===undefined)) avisosAlert.value = null;
});

watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});
</script>

<template>
  <div class="modal fade" id="staticEditar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Agregar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('update', paramsE, paramsE.id)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-4">
                      <label for="" class="badge text-secondary">fecha asignar<span class="text-danger">*</span></label>
                      <input type="date" pattern="^\d{4}-\d{2}-\d{2}$" class="form-control" :class="{'is-invalid':paramsE.fecha_asignar && !/^\d{4}-\d{2}-\d{2}$/.test(paramsE.fecha_asignar),'is-valid':paramsE.fecha_asignar && /^\d{4}-\d{2}-\d{2}$/.test(paramsE.fecha_asignar)}" v-model="paramsE.fecha_asignar" placeholder="fecha asignar" required />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">fecha devolucion</label>
                      <input type="date" pattern="^\d{4}-\d{2}-\d{2}$" class="form-control" :class="{'is-invalid':paramsE.fecha_devolucion && !/^\d{4}-\d{2}-\d{2}$/.test(paramsE.fecha_devolucion),'is-valid':paramsE.fecha_devolucion && /^\d{4}-\d{2}-\d{2}$/.test(paramsE.fecha_devolucion)}" v-model="paramsE.fecha_devolucion" placeholder="fecha devolucion"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Destinos<span class="text-danger">*</span></label>
                      <input type="text" class="form-control" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s\-\{\}\(\)\+\*]+$" :class="{'is-invalid':paramsE.destino && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsE.destino),'is-valid':paramsE.destino && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsE.destino)}" v-model="paramsE.destino" placeholder="Destino" required />
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">comentario</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsE.comentario && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.comentario), 'is-valid':paramsE.comentario && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.comentario)}" placeholder="Descripción" v-model="paramsE.comentario"></textarea>
                    </div>

                    <div class="col-4">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.producto?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.producto_id" multiple required>
                        <option v-for="(producto, index) in relations[0]" :key="index" :value="producto.id">{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-5">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.estatus?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.estatus_id" required>
                        <option v-for="(estatus, index) in relations[2]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
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