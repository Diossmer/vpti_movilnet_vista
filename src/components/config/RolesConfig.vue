<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { dataTable } from '@/components/utils/dataTableUtils';
import RolesServicios from '@/components/services/administrativo/RolesServicios';
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import AgregarModalRoles from '../modales/administrativo/roles/AgregarModalRoles.vue';
import EditarModalRoles from '../modales/administrativo/roles/EditarModalRoles.vue';
import MostrarModalRoles from '../modales/administrativo/roles/MostrarModalRoles.vue';
import ImportarModalRoles from '../modales/administrativo/roles/ImportarModalRoles.vue';
import PdfModalRoles from '../modales/administrativo/roles/PdfModalRoles.vue';


const store = useLoginStore()
const { dataPerfil } = storeToRefs(store)

const router = useRouter();
const { columns, sortTable } = dataTable();
const rowData = ref([]);
const filteredData = ref([]);
const col = ref([]);
const searchQueries = ref([]);
const globalSearchQuery = ref('');
let currentPage = ref(1);
let rowsPerPage = ref(5);
let totalOfPage = ref(0);
const selectedRows = ref([]);
const selectedRowsAll = ref([]);
const paramsE = ref({})
const response = ref(null);
const isLoadingImport = ref(false);
const filteredAndPaginatedData = computed(() => {
  filteredData.value = rowData.value.filter(row => {
    if (globalSearchQuery.value) {
      return Object.values(row).some(cell =>
        cell?.toString().toLowerCase().includes(globalSearchQuery.value.toLowerCase())
      );
    }
    return Object.values(row).every((cell, index) => {
      const searchQuery = searchQueries.value[index];
      return searchQuery ? cell?.toString().toLowerCase().includes(searchQuery.toLowerCase()) : true;
    });
  });
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredData.value?.slice(start, start + rowsPerPage.value);
});
watch([globalSearchQuery, searchQueries, currentPage, rowsPerPage], () => {
  totalOfPage.value = Math.ceil(filteredData.value?.length / rowsPerPage.value);
});
const handleData = async (action = null, params = null, id = null) => {
  try {
    if (action === 'create' || action === 'update') {
      isLoadingImport.value = true
      response.value = action=== 'create'? await RolesServicios(action, id, params)
    : action === 'update'? await RolesServicios(action, id, params):undefined;
      await handleData('fetchAll');
    } else if (action === 'delete') {
      await RolesServicios(action, id);
      await handleData('fetchAll');
    } else if (action === 'fetch') {
      paramsE.value = await RolesServicios('fetch', id);
    }
    /* let timeoutId
    if(response?.error){
      avisos.value = response?.error;
      let modalInstance = Modal.getInstance(modalAgregar.value) || Modal.getInstance(modalEditar.value);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        avisos.value = null;
        modalInstance.hide();
      }, 3000);
    }else if(action === 'create' || action === 'update'){
      let modalInstance = Modal.getInstance(modalAgregar.value) || Modal.getInstance(modalEditar.value);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        avisos.value = null;
        modalInstance.hide();
      }, 1000);
    } */
  } catch (error) {
    console.error('Error al manejar los datos:', error);
  } finally {
    isLoadingImport.value = false
    const {mostrarT} = await RolesServicios('fetchAll');
    col.value = columns(mostrarT);
    rowData.value = mostrarT;
    totalOfPage.value = Math.ceil(rowData.value.length / rowsPerPage.value);
  }
};
const visiblePages = computed(() => {
  const total = Math.ceil(filteredData.value.value?.length / rowsPerPage.value) || Math.ceil(rowData.value?.length / rowsPerPage.value);
  const current = currentPage.value;
  const range = [];

  // Lógica para rangos de páginas visibles
  if(total <= 7) {
    return Array.from({length: total}, (_, i) => i + 1);
  }

  if(current <= 3) {
    return [1, 2, 3, 4, '...', total - 1, total];
  }

  if(current >= total - 2) {
    return [1, 2, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, 2, '...', current - 1, current, current + 1, '...', total - 1, total];
});


const fileData = async (fileEvent,format,nameFile) => {
  switch (format) {
    case 'pdf':
      await RolesServicios(format,fileEvent.id,nameFile);
        break;
    case 'export':
      await RolesServicios(format,fileEvent.id,nameFile);
        break;
    case 'exportAll':
      await RolesServicios(format,fileEvent.id,nameFile);
        break;
    case 'import':
      isLoadingImport.value = true
      const formData = new FormData();
      Array.from(fileEvent.target.elements?.file.files).map(async (file,index)=>{
        formData.append(`file[${index}]`,file);
      })
      try {
          response.value = await RolesServicios(format, '', formData);
          await handleData('fetchAll');
      } catch (error) {
          console.error('Error en importación:', error.response.data);
      }
        break;
    default:
      console.error('Formato no soportado');
  }
};
const manejadorEliminar=async(type)=>{
  try {
    if (type === 'individual' && selectedRows.value?.length > 0) {
      // Eliminación de seleccionados
      await Promise.all(selectedRows.value.map(row =>{
        if(row.id !==1){
          RolesServicios('delete', row.id)
        }
      }));
    } else if (type === 'all') {
      // Eliminación de todos los registros
      await Promise.all(selectedRowsAll.value.map(row =>{
        if(row.id !==1){
          RolesServicios('delete', row.id)
        }
      }));
    }
    await handleData('fetchAll');
    selectedRows.value = [];
    currentPage.value = 1;
  } catch (error) {
    console.error('Error en eliminación:', error);
  }
}
const filaIndividual=(row)=>{
  const index = selectedRows.value.findIndex(r => r.id === row.id);
  index === -1 ? selectedRows.value.push(row) : selectedRows.value.splice(index, 1);
}
const handleMasivoDelete=async(e)=>{
  selectedRowsAll.value = e.target.checked ? [...rowData.value] : [];
}
const goBack = () => {router.go(-1)}
onMounted(async()=>{await handleData()})
</script>
<template>
  <div>
    <button @click="goBack" class="btn btn-outline-red-m btn-lg"><i class="bi bi-arrow-left-circle"></i> Regresar</button>
    <span class="badge fs-1"><i class="bi bi-gear-wide-connected"></i> Roles</span>
    <hr class="border-5 border-red-m opacity-75">
    <div class="card w-100">
      <div class="card-body p-5">
        <div class="w-100 d-flex justify-content-end" v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3">
          <a type="button" class="btn btn-outline-secondary text-red" title="Agregar" data-bs-toggle="modal" data-bs-target="#staticAgregar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 15px; height: 20px;">
              <path fill="currentcolor" d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
            </svg>
            Agregar
          </a>
        </div>
            <div class="w-100 d-flex justify-content-between p-2">
              <div class="col-5">
                <input type="text" class="form-control" v-model="globalSearchQuery" placeholder="Buscar globalmente...">
              </div>
              <div class="row d-flex justify-content-between">
                <div class="col-6 btn-group" v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3">
                  <div class="dropdown">
                    <button class="btn btn-outline-secondary dropdown-toggle text-danger" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-trash"></i>
                      Eliminar
                    </button>
                    <ul class="dropdown-menu">
                      <li><button class="dropdown-item" type="button" @click="(e)=>manejadorEliminar('all')">Todo el registro ({{ selectedRowsAll.length }})</button></li>
                      <li><button class="dropdown-item" type="button" @click="(e)=>manejadorEliminar('individual')" :disabled="selectedRows.length === 0">Seleccionados ({{ selectedRows.length }})</button></li>
                    </ul>
                  </div>
                  <div class="dropdown">
                    <button class="btn btn-outline-secondary text-red dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">📁Archivos</button>
                    <ul class="dropdown-menu">
                      <li><button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#staticPDF"><i class="bi bi-file-pdf"></i> PDF</button></li>
                      <li><button class="dropdown-item" type="button" @click="fileData(rowData,'exportAll','roles')"><i class="bi bi-upload"></i> Exportar</button></li>
                      <li><button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#staticImportar"><i class="bi bi-download"></i> Importar</button></li>
                    </ul>
                  </div>
                </div>
                <div class="col-auto p-0">
                  <select class="form-select" v-model="rowsPerPage" @change="currentPage = 1">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                  </select>
                </div>
              </div>
            </div>
           <div class="table-responsive">
            <table class="table table-secondary table-striped table-hover" id="dataTable">
              <thead class="">
                <tr class="">
                  <div class="p-2 text-nowrap" v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3"><i class="bi bi-ui-checks"></i></div>
                    <div class="form-check form-switch d-flex justify-content-end px-3" style="height: 60px;" v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3">
                      <input class="form-check-input" :class="{ 'selected': selectedRowsAll.length }" type="checkbox" role="switch" id="flexSwitchCheckDefault" @change="(e)=>handleMasivoDelete(e)" :checked="selectedRowsAll.length === rowData.length">
                      <label class="form-check-label" for="flexSwitchCheckDefault"></label>
                    </div>
                  <th class="" v-for="(column, index) in col" :key="index" @click="sortTable(rowData, col, index)">
                    {{ column.title }}
                    <div v-if="column.title !== 'accion'">
                      <input class="form-control w-50" v-model="searchQueries[index]" :placeholder="`Buscar ${column.title}...`" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in filteredAndPaginatedData" :key="index">
                <div class="form-check form-switch d-flex justify-content-end" style="height: 60px;" v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3">
                      <label class="form-check-label" for="flexSwitchCheckDefault">
                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" :checked="selectedRows.includes(row)" @change="filaIndividual(row)" :class="{ 'selected': selectedRows.includes(row) }">
                      </label>
                    </div>
                  <td>{{ row.nombre }}</td>
                  <td>
                    <button class="btn btn-outline-secondary text-red dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">⚙️</button>
                    <ul class="dropdown-menu p-2 gap-3">
                      <li v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3"><button class="btn btn-outline-secondary text-red dropdown-item fs-5 p-0" title="PDF" type="button" data-bs-toggle="modal" data-bs-target="#staticPDF" @click="handleData('fetch', '', row.id)"><i class="bi bi-file-pdf"></i>PDF</button></li>
                      <li v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3"><button class="btn btn-outline-warning text-red dropdown-item fs-5 p-0" title="Exportar" type="button" @click="fileData(row,'export',(row.nombre) )"><i class="bi bi-upload"></i>Exportar</button></li>
                      <li v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3">
                        <button type="button" class="btn btn-outline-secondary text-red dropdown-item p-0" title="Editar" data-bs-toggle="modal" data-bs-target="#staticEditar" @click="handleData('fetch', '', row.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 20px; height: 20px;">
                            <path fill="currentcolor" d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z"/>
                          </svg>
                          <span class="fs-5">Editar</span>
                        </button>
                      </li>
                      <li>
                        <button type="button" class="btn btn-outline-warning text-red dropdown-item p-0" title="Mostrar" data-bs-toggle="modal" data-bs-target="#staticMostrar" @click="handleData('fetch', '', row.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 20px; height: 20px;">
                            <path fill="currentcolor" d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"/>
                          </svg>
                          <span class="fs-5">Mostrar</span>
                        </button>
                      </li>
                      <li v-if="dataPerfil.rol.id !== 2 && dataPerfil.rol.id !== 3">
                        <button type="button" class="btn btn-outline-secondary text-danger dropdown-item p-0" title="Eliminar" @click="handleData('delete', '', row.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 20px; height: 20px;">
                            <path fill="currentcolor" d="M177.7 32l92.5 0c5.5 0 10.6 2.8 13.6 7.5L299.1 64 148.9 64l15.3-24.5c2.9-4.7 8.1-7.5 13.6-7.5zM336.9 64L311 22.6C302.2 8.5 286.8 0 270.3 0L177.7 0C161.2 0 145.8 8.5 137 22.6L111.1 64 64.1 64 32 64 16 64C7.2 64 0 71.2 0 80s7.2 16 16 16l18.3 0L59.8 452.6C62.1 486.1 90 512 123.6 512l200.8 0c33.6 0 61.4-25.9 63.8-59.4L413.7 96 432 96c8.8 0 16-7.2 16-16s-7.2-16-16-16l-16 0-32.1 0-47.1 0zm44.8 32L356.3 450.3C355.1 467 341.2 480 324.4 480l-200.8 0c-16.8 0-30.7-13-31.9-29.7L66.4 96l315.3 0z"/>
                          </svg>
                          <span class="fs-5">Eliminar</span>
                        </button>
                      </li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
            <div id="pagination">
              <nav aria-label="Page navigation">
                <ul class="pagination">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="currentPage--">Previous</button>
                  </li>

                  <li v-for="(page, index) in visiblePages" :key="index" class="page-item"
                      :class="{ active: currentPage === page, disabled: page === '...' }">
                    <button
                      v-if="typeof page === 'number'"
                      class="page-link"
                      @click="currentPage = page">
                      {{ page }}
                    </button>
                    <span v-else class="page-link">...</span>
                  </li>

                  <li class="page-item" :class="{ disabled: currentPage === totalOfPage }">
                    <button class="page-link" @click="currentPage++">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
      </div>
    </div>

    <AgregarModalRoles :handleData="handleData" :isLoadingImport="isLoadingImport" :response="response" />

    <EditarModalRoles :handleData="handleData" :paramsE="paramsE" :isLoadingImport="isLoadingImport" :response="response" />

    <MostrarModalRoles :paramsE="paramsE" />

    <ImportarModalRoles :isLoadingImport="isLoadingImport" :fileData="fileData" :response="response" />
    
    <PdfModalRoles :fileData="fileData" :paramsE="paramsE" />

</template>
<style scoped>
.selected {
  background-color: #000 !important;
  color: #ccc;
}
.dropdown-menu{
  min-width: 0 !important;
}
.btn-outline-red-m {
  border-color: var(--institucional-m-gris-claro);
  color: var(--institucional-m-gris-claro);
}

.btn-outline-red-m:hover {
  background-color: var(--institucional-m-gris-claro);
  color: var(--institucional-m-cerezo);
}
</style>
