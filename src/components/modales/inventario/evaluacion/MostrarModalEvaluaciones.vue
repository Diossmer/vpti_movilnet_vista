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
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Evaluación del producto</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>estado fisico: </b>{{ paramsE.estado_fisico }}</p>
              </div>
              <div class="col-6">
                <p><b>escala: </b>{{ paramsE.escala }}</p>
              </div>
              <div class="col-6">
                <p><b>compatibilidad: </b>{{ paramsE.compatibilidad }}</p>
              </div>
              <div class="col-6">
                <p><b>reemplazo: </b>{{ paramsE.reemplazo }}</p>
              </div>
              <div class="col-6">
                <p><b>mantenimineto: </b>{{ paramsE.mantenimineto }}</p>
              </div>
              <div class="col-4">
                <p><b>estatus: </b>{{ paramsE.estatus?.nombre }}</p>
              </div>
              <div class="col-12">
                <p><b>observación: </b>{{ paramsE.notas }}</p>
              </div>
              <hr class="border-4 border-primary opacity-75">
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
