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

const searchQuery = ref('');

const filteredProductos = computed(() => {
  if (!searchQuery.value) {
    return props.paramsE.productos;
  }
  return props.paramsE.productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<template>
  <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Inventarios</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>cantidad_existente: </b>{{ paramsE.cantidad_existente }}</p>
              </div>
              <div class="col-6">
                <p><b>entrada: </b>{{ paramsE.entrada }}</p>
              </div>
              <div class="col-6">
                <p><b>salida: </b>{{ paramsE.salida }}</p>
              </div>
              <div class="col-12">
                <p><b>descripción: </b>{{ paramsE?.descripcion }}</p>
              </div>
              <hr class="border-2 border-success opacity-75">
              <div class="col-6">
                <p><b>estatus: </b>{{ paramsE.estatus?.nombre?? "sin estatus" }}</p>
              </div>
              <div class="col-6">
                <p><b>descripcion: </b>{{ paramsE.estatus?.descripcion?? "sin descripcion" }}</p>
              </div>
              <div class="col-3">
                <p><b class="text-red fw-bolder">cantidad de productos: </b>{{ filteredProductos?.length }}</p>
              </div>
              <div class="col-9">
                <p><b class="text-red fw-bolder">productos: </b></p>
                <input type="text" v-model="searchQuery" class="form-control mb-2" placeholder="Buscar producto...">
                <div class="product-list-container" style="max-height: 200px; overflow-y: auto;">
                  <ul v-if="filteredProductos && filteredProductos.length">
                    <li v-for="producto in filteredProductos" :key="producto.id">
                      {{ producto.nombre }}
                    </li>
                  </ul>
                  <p v-else class="text-muted">No se encontraron productos.</p>
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