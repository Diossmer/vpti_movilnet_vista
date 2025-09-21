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
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Usuario</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>nombre: </b>{{ paramsE.nombre }}</p>
              </div>
              <div class="col-6">
                <p><b>apellido: </b>{{ paramsE.apellido }}</p>
              </div>
              <div class="col-6">
                <p><b>cedula: </b>{{ paramsE.cedula }}</p>
              </div>
              <div class="col-6">
                <p><b>correo: </b>{{ paramsE.correo }}</p>
              </div>
              <div class="col-6">
                <p><b>usuario: </b>{{ paramsE.usuario }}</p>
              </div>
              <hr class="border-2 border-success opacity-75">
              <div class="col-6">
                <p><b>telefono_casa: </b>{{ paramsE.telefono_casa }}</p>
              </div>
              <div class="col-6">
                <p><b>telefono_celular: </b>{{ paramsE.telefono_celular }}</p>
              </div>
              <div class="col-6">
                <p><b>telefono_alternativo: </b>{{ paramsE.telefono_alternativo }}</p>
              </div>
              <hr class="border-2 border-success opacity-75">
              <div class="col-6">
                <p><b>ciudad: </b>{{ paramsE.ciudad }}</p>
              </div>
              <div class="col-6">
                <p><b>estado: </b>{{ paramsE.estado }}</p>
              </div>
              <div class="col-6">
                <p><b>codigo_postal: </b>{{ paramsE.codigo_postal }}</p>
              </div>
              <div class="col-12">
                <p><b>direccion: </b>{{ paramsE.direccion }}</p>
              </div>
            </div>
            <hr class="border-4 border-primary opacity-75">
            <div class="row">
              <div class="col-4">
                <p :title="paramsE.estatus?.descripcion"><b class="text-red fw-bolder">estatus: </b>{{ paramsE.estatus?.nombre }}</p>
              </div>
              <div class="col-4">
                <p :title="paramsE.rol?.descripcion"><b class="text-red fw-bolder">rol: </b>{{ paramsE.rol?.nombre }}</p>
              </div>
              <div class="col-4">
                <p :title="paramsE.productos?.map(p => p.descripcion).join(', ')"><b class="text-red fw-bolder">productos: </b>{{ paramsE.productos?.length }}</p>
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