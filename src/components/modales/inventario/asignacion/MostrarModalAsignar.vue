<script setup>
import { defineProps } from 'vue';

defineProps({
  paramsE: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  relations: {
    type: Array,
    default: () => [[], []],
  }
});
</script>

<template>
  <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Categoría</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-4">
                <p><b>fecha_asignar: </b>{{ paramsE?.fecha_asignar }}</p>
              </div>
              <div class="col-4">
                <p><b>fecha_devolucion: </b>{{ paramsE?.fecha_devolucion }}</p>
              </div>
              <div class="col-4">
                <p><b>destino: </b>{{ paramsE?.destino }}</p>
              </div>
              <div class="col-4">
                <p><b>usuario: </b>{{ paramsE?.usuario?.usuario }}</p>
              </div>
              <div class="col-12">
                <p><b>comentario: </b>{{ paramsE?.comentario }}</p>
              </div>
            </div>
            <hr class="border-2 border-success opacity-75">
            <div class="row">
              <div class="col-6">
                <p><b class="text-red fw-bolder">estatus: </b>{{ paramsE.estatus?.nombre }}</p>
              </div>
              <div class="col-6">
                <p><b class="text-red fw-bolder">modelo: </b>{{ paramsE.descripcion?.modelo }}</p>
              </div>
              <div class="col-6">
                <p><b class="text-red fw-bolder">codigo: </b>{{ paramsE.descripcion?.codigo }}</p>
              </div>
              <div class="col-6">
                <p><b class="text-red fw-bolder">cantidad de productos: </b>{{ paramsE.productos?.length}}</p>
                <div class="row">
                  <div class="col-6" v-for="(producto) in paramsE.productos" :key="producto.id">{{ producto.nombre }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Regresar</button>
          </div>
        </div>
      </div>
    </div>
</template>