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

watch([() => paramsA.value?.comentario], ([comentario]) => {
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
const filteredUsuario = computed(() => {
  const allUsuario = props.relations[1];
  const restrictedUsuarioNames = ['admin', 'administrador', 'activo'];
  const esAdministrador = dataPerfil.value?.rol?.nombre?.toLowerCase() === 'superusuario';
  if (!esAdministrador) {
    return allUsuario?.filter(usuario =>
      !restrictedUsuarioNames?.includes(usuario.usuario)
    );
  } else {
    return allUsuario;
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
                    <div class="col-3">
                      <label for="" class="badge text-secondary">fecha asignar<span class="text-danger">*</span></label>
                      <input type="date" pattern="^\d{4}-\d{2}-\d{2}$" class="form-control" :class="{'is-invalid':paramsA.fecha_asignar && !/^\d{4}-\d{2}-\d{2}$/.test(paramsA.fecha_asignar),'is-valid':paramsA.fecha_asignar && /^\d{4}-\d{2}-\d{2}$/.test(paramsA.fecha_asignar)}" v-model="paramsA.fecha_asignar" placeholder="fecha asignar" required />
                    </div>
                    <div class="col-3">
                      <label for="" class="badge text-secondary">fecha devolucion</label>
                      <input type="date" pattern="^\d{4}-\d{2}-\d{2}$" class="form-control" :class="{'is-invalid':paramsA.fecha_devolucion && !/^\d{4}-\d{2}-\d{2}$/.test(paramsA.fecha_devolucion),'is-valid':paramsA.fecha_devolucion && /^\d{4}-\d{2}-\d{2}$/.test(paramsA.fecha_devolucion)}" v-model="paramsA.fecha_devolucion" placeholder="fecha devolucion"/>
                    </div>
                    <div class="col-3">
                      <label for="" class="badge text-secondary">Destinos<span class="text-danger">*</span></label>
                      <input type="text" class="form-control" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s\-\{\}\(\)\+\*]+$" :class="{'is-invalid':paramsA.destino && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s\-\{\}\(\)\+\*]+$/.test(paramsA.destino),'is-valid':paramsA.destino && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s\-\{\}\(\)\+\*]+$/.test(paramsA.destino)}" v-model="paramsA.destino" placeholder="Destino" required />
                    </div>
                    <div class="col-3">
                      <label for="" class="badge text-secondary">usuarios<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.usuario_id" required>
                        <option v-for="(usuario, index) in filteredUsuario" :key="index" :value="usuario.id">{{ usuario.usuario }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.estatus_id" required>
                        <option v-for="(estatus, index) in relations[2]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-8">
                      <label for="" class="badge text-secondary">Descripción del productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.descripcion_id" multiple required>
                        <option v-for="(descripcion, index) in relations[0]" :key="index" :value="descripcion?.id" selected v-if="relations.length > 0">{{ descripcion?.producto?.nombre }} || {{ descripcion?.dispositivo }} || {{ descripcion?.modelo }} || {{ descripcion?.marca }} || {{ descripcion?.serial }}</option>
                        <option selected v-else>Sin descripcion del producto</option>
                      </select>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">comentario</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.comentario && !/^[^<>{}\[\]]+$/.test(paramsA.comentario), 'is-valid':paramsA.comentario && /^[^<>{}\[\]]+$/.test(paramsA.comentario)}" placeholder="Comentario" v-model="paramsA.comentario"></textarea>
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