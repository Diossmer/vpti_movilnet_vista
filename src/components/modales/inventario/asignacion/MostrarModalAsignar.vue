<script setup>
import { ref, computed, defineProps } from 'vue';

const props = defineProps({
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
const searchDescription = ref('');

const filteredDescripcion = computed(() => {
  if (!searchDescription.value) {
    return props.paramsE.descripciones;
  }
  return props.paramsE.descripciones.filter(descripcion =>
    descripcion.marca.toLowerCase().includes(searchDescription.value.toLowerCase()) ||
    (descripcion.dispositivo && descripcion.dispositivo.toLowerCase().includes(searchDescription.value.toLowerCase())) ||
    (descripcion.modelo && descripcion.modelo.toLowerCase().includes(searchDescription.value.toLowerCase())) ||
    (descripcion.serial && descripcion.serial.toLowerCase().includes(searchDescription.value.toLowerCase())) ||
    (descripcion.producto?.nombre && descripcion.producto.nombre.toLowerCase().includes(searchDescription.value.toLowerCase()))
  );
});
</script>

<template>
  <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Asignación</h1>
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
              <div class="col-4">
                <p><b>estatus: </b>{{ paramsE.estatus?.nombre?? "sin estatus" }}</p>
              </div>
              <div class="col-12">
                <p><b>comentario: </b>{{ paramsE?.comentario }}</p>
              </div>
            </div>
            <hr class="border-2 border-success opacity-75">
            <div class="row">
              <div class="col-4">
                <p><b class="text-red fw-bolder">cantidad de descripciones: </b>{{ filteredDescripcion?.length }}</p>
              </div>
              <div class="col-8">
                <p><b class="text-red fw-bolder">Descripcion del producto: </b></p>
                <input type="text" v-model="searchDescription" class="form-control mb-2" placeholder="Buscar descripción...">
                <div class="product-list-container" style="max-height: 200px; overflow-y: auto;">
                  <ul v-if="filteredDescripcion && filteredDescripcion.length">
                    <li v-for="descripcion in filteredDescripcion" :key="descripcion.id">
                      {{ descripcion?.producto?.nombre }} || {{ descripcion?.dispositivo }} || {{ descripcion?.modelo }} || {{ descripcion?.marca }} || {{ descripcion?.serial }}
                    </li>
                  </ul>
                  <p v-else class="text-muted">No se encontraron Descripcion del producto.</p>
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