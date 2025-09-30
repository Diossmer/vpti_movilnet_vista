<script setup>
import { ref, defineProps } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';

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
  isLoadingImport: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const { dataPerfil } = storeToRefs(useLoginStore());
const avisos = ref(null);
const avisosAlert = ref(null);

</script>

<template>
  <div class="modal fade" id="staticEliminar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="staticEliminar">
      <div class="modal-dialog modal-md modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Eliminar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <Suspense>
            <template #default>
          <!-- Eliminar -->
          <form @submit.prevent="handleData('delete', '', paramsE.id)">
            <div class="modal-body">
              <div class="row">
                <div class="col-12 text-center">
                  <p class="text-dark badge fs-6">
                    ¿Estas seguro <span class="text-secondary">{{dataPerfil.usuario}}</span> que quieres eliminar <span class="text-red">{{paramsE.modelo}}</span>?
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Cancelar</button>
              <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">
                <span v-if="!isLoadingImport">Eliminar</span>
                  <span v-else>
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                    Procesando...
                  </span>
              </button>
            </div>
          </form>
          <!-- Eliminar -->
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