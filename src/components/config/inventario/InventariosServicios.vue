<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { dataTable } from '@/components/utils/dataTableUtils';
import { Modal } from 'bootstrap/dist/js/bootstrap.min';
import InventariosServicios from '@/components/services/inventario/InventariosServicios';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
const store = useLoginStore()
const { isAuthenticated, dataPerfil } = storeToRefs(store)
console.log(dataPerfil.value);

const router = useRouter();
const { columns, sortTable } = dataTable();
const rowData = ref([]);
const filteredData = ref([]);
const col = ref([]);
const relations = ref([]);
const searchQueries = ref([]);
const globalSearchQuery = ref('');
let currentPage = ref(1);
let rowsPerPage = ref(5);
let totalOfPage = ref(0);
const selectedRows = ref([]);
const selectedRowsAll = ref([]);
const paramsA = ref({})
const paramsE = ref({})
const avisos = ref(null);
const avisosAlert = ref(null);
const isLoadingImport = ref(false);
const modalAgregar = ref(null);
const modalEditar = ref(null);
const filteredAndPaginatedData = computed(() => {
  filteredData.value = rowData.value.filter(row => {
    if (globalSearchQuery.value) {
      return Object.values(row).some(cell =>
        cell?.toString().toLowerCase().includes(globalSearchQuery.value.toLowerCase())
      );
    }
    return Object.values(row).every((cell, index) => {
      const searchQuery = searchQueries.value[index];
      if(row?.estatus?.nombre?.toLowerCase()===(searchQuery?.toLowerCase() || row?.estatus !== null)){
        const searchRelation = Object.values(row?.estatus).some((celda) => {
          return searchQuery ? celda?.toString().toLowerCase().includes(searchQuery?.toLowerCase()) : true;
        });
        return searchQuery ? cell?.toString().includes(searchQuery.toLowerCase()) || searchRelation : true ;
      }
      return searchQuery ? cell?.toString().toLowerCase().includes(searchQuery.toLowerCase()) : true;
    });
  });
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredData.value?.slice(start, start + rowsPerPage.value);
});
watch([globalSearchQuery, searchQueries, currentPage, rowsPerPage], () => {
  totalOfPage.value = Math.ceil(filteredData.value?.length / rowsPerPage.value);
});
const handleData = async (action, data = null) => {
  try {
    let response;
    if (action === 'create' || action === 'update') {
      isLoadingImport.value = true
      response = action=== 'create'? await InventariosServicios(action, data, paramsA.value)
    : action === 'update'? await InventariosServicios(action, data, paramsE.value):undefined;
      await handleData('fetchAll');
      paramsA.value = {};
      paramsE.value = {};
    } else if (action === 'delete') {
      await InventariosServicios(action, data);
      await handleData('fetchAll');
    } else if (action === 'fetch') {
      paramsE.value = await InventariosServicios('fetch', data);
    }
    avisos.value=response
    let timeoutId
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
    }
  } catch (error) {
    console.error('Error al manejar los datos:', error);
  } finally {
    isLoadingImport.value = false
    const {mostrarT,estatus,productos} = await InventariosServicios('fetchAll');
    col.value = columns(mostrarT);
    relations.value = [estatus,productos]
    rowData.value = mostrarT;
    totalOfPage.value = Math.ceil(rowData.value.length / rowsPerPage.value);
  }
};
const visiblePages = computed(() => {
  const total = Math.ceil(filteredData.value?.length / rowsPerPage.value) || Math.ceil(rowData.value?.length / rowsPerPage.value);
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
watch([() => paramsA.value?.cantidad_existente,
() => paramsA.value?.entrada,
() => paramsA.value?.salida,
() => paramsA.value?.descripcion], ([cantidad_existente, entrada, salida, descripcion]) => {
  const errors = [];
  const cantidad_existenteError = validacionesUtils().numberValid(cantidad_existente);
  if (cantidad_existenteError) errors.push(cantidad_existenteError);
  const entradaError = validacionesUtils().numberValid(entrada);
  if (entradaError) errors.push(entradaError);
  const salidaError = validacionesUtils().numberValid(salida);
  if (salidaError) errors.push(salidaError);
  const descripcionError = validacionesUtils().textareaValid(descripcion);
  if (descripcionError) errors.push(descripcionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((cantidad_existente==='' || cantidad_existente===undefined)
  && (entrada==='' || entrada===undefined)
  && (salida==='' || salida===undefined)
  && (descripcion==='' || descripcion===undefined))
  avisosAlert.value="";
});
watch([() => paramsE.value?.cantidad_existente,
() => paramsE.value?.entrada,
() => paramsE.value?.salida,
() => paramsE.value?.descripcion], ([cantidad_existente, entrada, salida, descripcion]) => {
  const errors = [];
  const cantidad_existenteError = validacionesUtils().numberValid(cantidad_existente);
  if (cantidad_existenteError) errors.push(cantidad_existenteError);
  const entradaError = validacionesUtils().numberValid(entrada);
  if (entradaError) errors.push(entradaError);
  const salidaError = validacionesUtils().numberValid(salida);
  if (salidaError) errors.push(salidaError);
  const descripcionError = validacionesUtils().textareaValid(descripcion);
  if (descripcionError) errors.push(descripcionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((cantidad_existente==='' || cantidad_existente===undefined)
  && (entrada==='' || entrada===undefined)
  && (salida==='' || salida===undefined)
  && (descripcion==='' || descripcion===undefined))
  avisosAlert.value="";
});
const fileData = async (fileEvent,format,nameFile) => {
  switch (format) {
    case 'pdf':
      await InventariosServicios(format,fileEvent.id,nameFile);
        break;
    case 'export':
      await InventariosServicios(format,fileEvent.id,nameFile);
        break;
    case 'exportAll':
      await InventariosServicios(format,fileEvent.id,nameFile);
        break;
    case 'import':
      isLoadingImport.value = true
      const formData = new FormData();
      Array.from(fileEvent.target.elements?.file.files).map(async (file,index)=>{
        formData.append(`file[${index}]`,file);
      })
      try {
          const response = await InventariosServicios(format, '', formData);
          await handleData('fetchAll');
          avisos.value=response;
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
          InventariosServicios('delete', row.id)
        }
      }));
    } else if (type === 'all') {
      // Eliminación de todos los registros
      await Promise.all(selectedRowsAll.value.map(row =>{
        if(row.id !==1){
          InventariosServicios('delete', row.id)
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
    <span class="badge fs-1"><i class="bi bi-box2"></i> Inventarios</span>
    <hr class="border-5 border-red-m opacity-75">
    <div class="card w-100">
      <div class="card-body p-5">
        <h5 class="text-dark fs-6 badge"><i class="bi bi-box2"></i> Inventarios</h5>
        <hr class="border-2 border-red-m opacity-75">
        <div class="w-100 d-flex justify-content-end" v-if="dataPerfil.rol.id !== 2">
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
                <div class="col-6 btn-group">
                  <div class="dropdown" v-if="dataPerfil.rol.id === 1 || dataPerfil.rol.id === 3">
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
                      <li><button class="dropdown-item" type="button" @click="fileData(rowData,'exportAll','inventarios')"><i class="bi bi-upload"></i> Exportar</button></li>
                      <li v-if="dataPerfil.rol.id !== 2"><button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#staticImportar"><i class="bi bi-download"></i> Importar</button></li>
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
                  <div class="p-2 text-nowrap"><i class="bi bi-ui-checks"></i>todos</div>
                    <div class="form-check form-switch d-flex justify-content-end px-3" style="height: 60px;">
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
                  <div class="form-check form-switch d-flex justify-content-end" style="height: 60px;">
                      <label class="form-check-label" for="flexSwitchCheckDefault">
                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" :checked="selectedRows.includes(row)" @change="filaIndividual(row)" :class="{ 'selected': selectedRows.includes(row) }">
                      </label>
                    </div>
                  <td>{{ row.id }}</td>
                  <td>{{ row.cantidad_existente }}</td>
                  <td>{{ row.entrada }}</td>
                  <td>{{ row.salida }}</td>
                  <td>{{ row.estatus?.nombre }}</td>
                  <td>
                    <button class="btn btn-outline-secondary text-red dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">⚙️</button>
                    <ul class="dropdown-menu p-2 gap-3">
                      <li><button class="btn btn-outline-secondary text-red dropdown-item fs-5 p-0" title="PDF" type="button" data-bs-toggle="modal" data-bs-target="#staticPDF" @click="handleData('fetch', row.id)"><i class="bi bi-file-pdf"></i>PDF</button></li>
                      <li><button class="btn btn-outline-warning text-red dropdown-item fs-5 p-0" title="Exportar" type="button" @click="fileData(row,'export','inventario' )"><i class="bi bi-upload"></i>Exportar</button></li>
                      <li v-if="dataPerfil.rol.id !==2">
                        <button type="button" class="btn btn-outline-secondary text-red dropdown-item p-0" title="Editar" data-bs-toggle="modal" data-bs-target="#staticEditar" @click="handleData('fetch', row.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 20px; height: 20px;">
                            <path fill="currentcolor" d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z"/>
                          </svg>
                          <span class="fs-5">Editar</span>
                        </button>
                      </li>
                      <li>
                        <button type="button" class="btn btn-outline-warning text-red dropdown-item p-0" title="Mostrar" data-bs-toggle="modal" data-bs-target="#staticMostrar" @click="handleData('fetch', row.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 20px; height: 20px;">
                            <path fill="currentcolor" d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"/>
                          </svg>
                          <span class="fs-5">Mostrar</span>
                        </button>
                      </li>
                      <li v-if="dataPerfil.rol.id === 1 || dataPerfil.rol.id === 3">
                        <button type="button" class="btn btn-outline-secondary text-danger dropdown-item p-0" title="Eliminar" @click="handleData('delete', row.id)">
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
    <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Agregar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="paramsE = {}, avisos = null, avisosAlert =''"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('create')">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-3">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.producto_id" multiple required>
                        <option v-for="(producto, index) in relations[1]" :key="index" :value="producto.id" selected>{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-3">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Cantidad Existente<span class="text-danger">*</span></label>
                      <input type="text" inputmode="numeric" maxlength="10"  pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsA.cantidad_existente && !/^\d+(^\.\d+)?$/.test(paramsA.cantidad_existente),'is-valid': paramsA.cantidad_existente && /^\d+(^\.\d+)?$/.test(paramsA.cantidad_existente)}" v-model="paramsA.cantidad_existente" placeholder="Cantidad Existente" required />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Entrada</label>
                      <input type="text" inputmode="numeric" maxlength="10" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsA.entrada && !/^\d+(^\.\d+)?$/.test(paramsA.entrada),'is-valid': paramsA.entrada && /^\d+(^\.\d+)?$/.test(paramsA.entrada)}" v-model="paramsA.entrada" placeholder="Entrada"/>
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Salida</label>
                      <input type="text" inputmode="numeric" maxlength="10" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsA.salida && !/^\d+(^\.\d+)?$/.test(paramsA.salida),'is-valid': paramsA.salida && /^\d+(^\.\d+)?$/.test(paramsA.salida)}" v-model="paramsA.salida" placeholder="Salida"/>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">descripción</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.descripcion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.descripcion), 'is-valid':paramsA.descripcion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.descripcion)}" placeholder="Descripción" v-model="paramsA.descripcion"></textarea>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="paramsA = {}, avisos = null, avisosAlert =''">Cancelar</button>
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
    <div class="modal fade" id="staticEditar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalEditar" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Actualizar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="paramsE = {}, avisos = null, avisosAlert =''"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('update', paramsE.id)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-3">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.producto?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.producto_id" multiple required>
                        <option v-for="(producto, index) in relations[1]" :key="index" :value="producto.id">{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-3">
                      <label for="" class="badge text-secondary">estatus actual<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.estatus?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Cantidad Existente<span class="text-danger">*</span></label>
                      <input type="text" inputmode="numeric" maxlength="10"  pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsE.cantidad_existente && !/^\d+(^\.\d+)?$/.test(paramsE.cantidad_existente),'is-valid': paramsE.cantidad_existente && /^\d+(^\.\d+)?$/.test(paramsE.cantidad_existente)}" v-model="paramsE.cantidad_existente" placeholder="Cantidad Existente" required />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Entrada</label>
                      <input type="text" inputmode="numeric" maxlength="10" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsE.entrada && !/^\d+(^\.\d+)?$/.test(paramsE.entrada),'is-valid': paramsE.entrada && /^\d+(^\.\d+)?$/.test(paramsE.entrada)}" v-model="paramsE.entrada" placeholder="Entrada"/>
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">Salida</label>
                      <input type="text" inputmode="numeric" maxlength="10" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsE.salida && !/^\d+(^\.\d+)?$/.test(paramsE.salida),'is-valid': paramsE.salida && /^\d+(^\.\d+)?$/.test(paramsE.salida)}" v-model="paramsE.salida" placeholder="Salida"/>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">descripción</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsE.descripcion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.descripcion), 'is-valid':paramsE.descripcion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.descripcion)}" placeholder="Descripción" v-model="paramsE.descripcion"></textarea>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="paramsE = {}, avisos = null, avisosAlert =''">Cancelar</button>
                  <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport">
                    <span v-if="!isLoadingImport">Actualizar</span>
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
    <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Inventarios</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="paramsE = {}, avisos = null, avisosAlert =''"></button>
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
              <div class="col-6">
                <p><b>descripción: </b>{{ paramsE?.descripcion }}</p>
              </div>
              <hr class="border-2 border-success opacity-75">
              <div class="col-6">
                <p><b>estatus: </b>{{ paramsE.estatus?.nombre?? "sin estatus" }}</p>
              </div>
              <div class="col-6">
                <p><b>descripcion: </b>{{ paramsE.estatus?.descripcion?? "sin descripcion" }}</p>
              </div>
            </div>
            <p><b class="text-red fw-bolder">cantidad de productos: </b>{{ paramsE.productos?.length }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="paramsE = {}, avisos = null, avisosAlert =''">Regresar</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="staticImportar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Importar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert =''"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="(e)=>fileData(e,'import')">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-12">
                      <div class="border-3 border">
                        <input class="form-control form-control-sm" type="file" name="file" id="formFileMultiple" multiple>
                      </div>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" aria-hidden="true" @click="avisos = null, avisosAlert =''">Cancelar</button>
                  <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport"><span v-if="!isLoadingImport">Aceptar</span>
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
    <div class="modal fade" id="staticPDF" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">PDF</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="paramsE = {}, avisos = null, avisosAlert =''"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-12">
                <div class="row" v-if="paramsE.id">
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary wrap">pedidos</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData(paramsE,'pdf','pedidos')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary wrap">nota de entrega</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData(paramsE,'pdf','notaEntrega')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                </div>
                <div class="row" v-else>
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary wrap">modelos</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData('','pdf','modelos')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary wrap">formatos</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData('','pdf','formatos')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" aria-hidden="true" @click="paramsE = {}, avisos = null, avisosAlert =''">Regresar</button>
          </div>
        </div>
      </div>
    </div>
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
