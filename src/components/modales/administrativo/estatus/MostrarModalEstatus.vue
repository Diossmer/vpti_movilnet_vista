<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  paramsE: {
    type: Object,
    default: () => ({}),
    required: true,
  },
});
</script>

<template>
  <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Estatus</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <p><b>estado: </b>{{ paramsE.nombre }}</p>
            <p><b>descripción: </b>{{ paramsE.descripcion }}</p>
            <hr class="border-2 border-success opacity-75">
            <p><b class="text-red fw-bolder">cantidad de usuarios: </b>{{ paramsE?.usuarios?.length }}</p>
            <hr class="border-2 border-success opacity-75">
            <p><b class="text-red fw-bolder">cantidad de gestión de usuarios: </b>{{ paramsE?.gestion_usuarios?.length
              }}</p>
            <hr class="border-2 border-success opacity-75">
            <p><b class="text-red fw-bolder">cantidad de productos: </b>{{ paramsE?.productos?.length }}</p>
            <hr class="border-2 border-success opacity-75">
            <p><b class="text-red fw-bolder">cantidad de proveedores: </b>{{ paramsE?.proveedores?.length }}</p>
            <hr class="border-2 border-success opacity-75">
            <p><b class="text-red fw-bolder">cantidad de asistencias: </b>{{ paramsE?.asistencias?.length }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Regresar</button>
          </div>
        </div>
      </div>
    </div>
</template>