<script setup>
import { defineProps } from 'vue';

defineProps({
  paramsE: {
    type: Object,
    default: () => ({}),
    required: true,
  },
});
</script>

<template>
  <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">roles</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>Rol: </b>{{ paramsE?.nombre }}</p>
              </div>
              <div class="col-6">
                <p><b>descripción: </b>{{ paramsE?.descripcion }}</p>
              </div>
            </div>
            <hr class="border-2 border-success opacity-75">
            <p><b class="text-red fw-bolder">permisos asignados: </b>{{ paramsE.permisos?.length }}</p>
            <hr class="border-2 border-success opacity-75">
            <p><b class="text-red fw-bolder">usuarios asignados: </b>{{ paramsE.usuarios?.length }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Regresar</button>
          </div>
        </div>
      </div>
    </div>
</template>