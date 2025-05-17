<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { dataTable } from '@/components/utils/dataTableUtils';
import { Modal } from 'bootstrap/dist/js/bootstrap.min';
import DescripcionServicios from '@/components/services/inventario/DescripcionServicios';
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
      return searchQuery ? cell?.toString().toLowerCase().includes(searchQuery.toLowerCase()) : true;
    });
  });
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredData.value?.slice(start, start + rowsPerPage.value);
});
watch([globalSearchQuery, searchQueries, currentPage, rowsPerPage], () => {
  totalOfPage.value = Math.ceil(filteredData.value.length / rowsPerPage.value);
});
const handleData = async (action, data = null) => {
  try {
    let response;
    if (action === 'create' || action === 'update') {
      isLoadingImport.value = true
      response = action=== 'create'? await DescripcionServicios(action, data, paramsA.value)
    : action === 'update'? await DescripcionServicios(action, data, paramsE.value):undefined;
      await handleData('fetchAll');
      paramsA.value = {};
      paramsE.value = {};
    } else if (action === 'delete') {
      await DescripcionServicios(action, data);
      await handleData('fetchAll');
    } else if (action === 'fetch') {
      paramsE.value = await DescripcionServicios('fetch', data);
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
    const {mostrarT,productos} = await DescripcionServicios('fetchAll');
    col.value = columns(mostrarT);
    rowData.value = mostrarT;
    relations.value = productos;
    totalOfPage.value = Math.ceil(rowData.value.length / rowsPerPage.value);
  }
};
const visiblePages = computed(() => {
  const total = Math.ceil(filteredData.value.length / rowsPerPage.value) || Math.ceil(rowData.value.length / rowsPerPage.value);
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
watch([
  () => paramsA.value?.codigo,
  () => paramsA.value?.dispositivo,
  () => paramsA.value?.tamaño,
  () => paramsA.value?.marca,
  () => paramsA.value?.nucleo,
  () => paramsA.value?.modelo,
  () => paramsA.value?.serial,
  () => paramsA.value?.codigo_inv,
  () => paramsA.value?.observacion,
],
  ([
  codigo, dispositivo, tamaño,
  marca, nucleo, modelo,
  serial, codigo_inv, observacion
  ]) => {
  const errors = [];
  const codigoError = validacionesUtils().formatValid(codigo);
  if (codigoError) errors.push(codigoError);
  const dispositivoError = validacionesUtils().textValid(dispositivo);
  if (dispositivoError) errors.push(dispositivoError);
  const marcaError = validacionesUtils().textValid(marca);
  if (marcaError) errors.push(marcaError);
  const tamañoError = validacionesUtils().sizeValid(tamaño);
  if (tamañoError) errors.push(tamañoError);
  const nucleoError = validacionesUtils().textValid(nucleo);
  if (nucleoError) errors.push(nucleoError);
  const modeloError = validacionesUtils().textValid(modelo);
  if (modeloError) errors.push(modeloError);
  const serialError = validacionesUtils().serialValid(serial);
  if (serialError) errors.push(serialError);
  const codigo_invError = validacionesUtils().codigo_invValid(codigo_inv);
  if (codigo_invError) errors.push(codigo_invError);
  const observacionError = validacionesUtils().textareaValid(observacion);
  if (observacionError) errors.push(observacionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((codigo==='' || codigo===undefined)
  && (dispositivo==='' || dispositivo===undefined)
  && (marca==='' || marca===undefined)
  && (tamaño==='' || tamaño===undefined)
  && (nucleo==='' || nucleo===undefined)
  && (modelo==='' || modelo===undefined)
  && (serial==='' || serial===undefined)
  && (codigo_inv==='' || codigo_inv===undefined)
  && (observacion==='' || observacion===undefined))
  avisosAlert.value="";
});
watch([
  () => paramsE.value?.codigo,
  () => paramsE.value?.dispositivo,
  () => paramsE.value?.tamaño,
  () => paramsE.value?.marca,
  () => paramsE.value?.nucleo,
  () => paramsE.value?.modelo,
  () => paramsE.value?.serial,
  () => paramsE.value?.codigo_inv,
  () => paramsE.value?.observacion,
],
  ([
  codigo, dispositivo, tamaño,
  marca, nucleo, modelo,
  serial, codigo_inv, observacion
  ]) => {
  const errors = [];
  const codigoError = validacionesUtils().formatValid(codigo);
  if (codigoError) errors.push(codigoError);
  const dispositivoError = validacionesUtils().textValid(dispositivo);
  if (dispositivoError) errors.push(dispositivoError);
  const marcaError = validacionesUtils().textValid(marca);
  if (marcaError) errors.push(marcaError);
  const tamañoError = validacionesUtils().sizeValid(tamaño);
  if (tamañoError) errors.push(tamañoError);
  const nucleoError = validacionesUtils().textValid(nucleo);
  if (nucleoError) errors.push(nucleoError);
  const modeloError = validacionesUtils().textValid(modelo);
  if (modeloError) errors.push(modeloError);
  const serialError = validacionesUtils().serialValid(serial);
  if (serialError) errors.push(serialError);
  const codigo_invError = validacionesUtils().codigo_invValid(codigo_inv);
  if (codigo_invError) errors.push(codigo_invError);
  const observacionError = validacionesUtils().textareaValid(observacion);
  if (observacionError) errors.push(observacionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((codigo==='' || codigo===undefined)
  && (dispositivo==='' || dispositivo===undefined)
  && (marca==='' || marca===undefined)
  && (tamaño==='' || tamaño===undefined)
  && (nucleo==='' || nucleo===undefined)
  && (modelo==='' || modelo===undefined)
  && (serial==='' || serial===undefined)
  && (codigo_inv==='' || codigo_inv===undefined)
  && (observacion==='' || observacion===undefined))
  avisosAlert.value="";
});
const fileData = async (fileEvent,format,nameFile) => {
  switch (format) {
    case 'pdf':
      await DescripcionServicios(format,fileEvent.id,nameFile);
        break;
    case 'export':
      await DescripcionServicios(format,fileEvent.id,nameFile);
        break;
    case 'exportAll':
      await DescripcionServicios(format,fileEvent.id,nameFile);
        break;
    case 'import':
      isLoadingImport.value = true
      const formData = new FormData();
      Array.from(fileEvent.target.elements?.file.files).map(async (file,index)=>{
        formData.append(`file[${index}]`,file);
      })
      try {
          const response = await DescripcionServicios(format, '', formData);
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
          DescripcionServicios('delete', row.id)
        }
      }));
    } else if (type === 'all') {
      // Eliminación de todos los registros
      await Promise.all(selectedRowsAll.value.map(row =>{
        if(row.id !==1){
          DescripcionServicios('delete', row.id)
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
    <span class="badge fs-1"><i class="bi bi-person-raised-hand"></i> Descripciones</span>
    <hr class="border-5 border-red-m opacity-75">
    <div class="card w-100">
      <div class="card-body p-5">
        <h5 class="text-dark fs-6 badge"><i class="bi bi-person-raised-hand"></i> Descripciones</h5>
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
                      <li><button class="dropdown-item" type="button" @click="fileData(rowData,'exportAll','descripcion')"><i class="bi bi-upload"></i> Exportar</button></li>
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
                  <td>{{ row.codigo }}</td>
                  <td>{{ row.modelo }}</td>
                  <td>{{ row.dispositivo }}</td>
                  <td>{{ row.serial }}</td>
                  <td>{{ row.marca }}</td>
                  <td>{{ row.codigo_inv }}</td>
                  <td>{{ row.producto?.nombre }}</td>
                  <td>
                    <button class="btn btn-outline-secondary text-red dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">⚙️</button>
                    <ul class="dropdown-menu p-2 gap-3">
                      <li><button class="btn btn-outline-secondary text-red dropdown-item fs-5 p-0" title="PDF" type="button" data-bs-toggle="modal" data-bs-target="#staticPDF" @click="handleData('fetch', row.id)"><i class="bi bi-file-pdf"></i>PDF</button></li>
                      <li><button class="btn btn-outline-warning text-red dropdown-item fs-5 p-0" title="Exportar" type="button" @click="fileData(row,'export',(row.producto?.nombre) )"><i class="bi bi-upload"></i>Exportar</button></li>
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
      <div class="modal-dialog modal-lg modal-dialog-centered">
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
                    <div class="col-2">
                      <label for="" class="badge text-secondary">codigo</label>
                      <input type="text" maxlength="6" pattern="^(\d+|X{0,2}[SLM]|X{3}L?)(\d+|X{0,2}[SLM]|X{3}L?)*$" class="form-control" :class="{'is-invalid':paramsA.codigo && !/^(\d+|X{0,2}[SLM]|X{3}L?)(\d+|X{0,2}[SLM]|X{3}L?)*$/.test(paramsA.codigo),'is-valid':paramsA.codigo && /^(\d+|X{0,2}[SLM]|X{3}L?)(\d+|X{0,2}[SLM]|X{3}L?)*$/.test(paramsA.codigo)}" v-model="paramsA.codigo" placeholder="codigo" />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">dispositivo</label>
                      <input type="text" maxlength="10" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid':paramsA.dispositivo && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.dispositivo),'is-valid':paramsA.dispositivo && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.dispositivo)}" v-model="paramsA.dispositivo" placeholder="dispositivo" />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">marca</label>
                      <input type="text" maxlength="15" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid':paramsA.marca && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.marca),'is-valid':paramsA.marca && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.marca)}" v-model="paramsA.marca" placeholder="marca" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">modelo</label>
                      <input type="text" maxlength="10" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid':paramsA.modelo && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.modelo),'is-valid':paramsA.modelo && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsA.modelo)}" v-model="paramsA.modelo" placeholder="Modelo" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">serial</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-z0-9\-_]{6,20}$" class="form-control" :class="{'is-invalid':paramsA.serial && !/^[A-Za-z0-9\-_]{6,20}$/.test(paramsA.serial),'is-valid':paramsA.serial && /^[A-Za-z0-9\-_]{6,20}$/.test(paramsA.serial)}" v-model="paramsA.serial" placeholder="XyZ_2025 - xyz-2025 - xyz2025" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">codigo_inv</label>
                      <input type="text" maxlength="15" pattern="^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$" class="form-control" :class="{'is-invalid':paramsA.codigo_inv && !/^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$/.test(paramsA.codigo_inv),'is-valid':paramsA.codigo_inv && /^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$/.test(paramsA.codigo_inv)}" v-model="paramsA.codigo_inv" placeholder="codigo_inv-ABC123" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsA.producto?.nombre }}</span>
                      <select class="form-select" v-model="paramsA.producto_id" required>
                        <option v-for="(producto, index) in relations" :key="index" :value="producto.id">{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-8">
                      <label for="" class="badge text-secondary">observación</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.observacion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.observacion), 'is-valid':paramsA.observacion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.observacion) }" placeholder="Observación" v-model="paramsA.observacion"></textarea>
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
      <div class="modal-dialog modal-lg modal-dialog-centered">
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
                    <div class="col-2">
                      <label for="" class="badge text-secondary">codigo</label>
                      <input type="text" maxlength="6" pattern="^(?:\d+|X{0,2}[SLM]|X{3}L?)(?:[-\/](?:\d+|X{0,2}[SLM]|X{3}L?))*$" class="form-control" :class="{'is-invalid':paramsE.codigo && !/^(?:\d+|X{0,2}[SLM]|X{3}L?)(?:[-\/](?:\d+|X{0,2}[SLM]|X{3}L?))*$/.test(paramsE.codigo),'is-valid':paramsE.codigo && /^(?:\d+|X{0,2}[SLM]|X{3}L?)(?:[-\/](?:\d+|X{0,2}[SLM]|X{3}L?))*$/.test(paramsE.codigo)}" v-model="paramsE.codigo" placeholder="codigo" />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">dispositivo</label>
                      <input type="text" maxlength="10" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid':paramsE.dispositivo && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsE.dispositivo),'is-valid':paramsE.dispositivo && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsE.dispositivo)}" v-model="paramsE.dispositivo" placeholder="dispositivo" />
                    </div>
                    <div class="col-2">
                      <label for="" class="badge text-secondary">marca</label>
                      <input type="text" maxlength="15" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid':paramsE.marca && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsE.marca),'is-valid':paramsE.marca && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsE.marca)}" v-model="paramsE.marca" placeholder="marca" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">modelo</label>
                      <input type="text" maxlength="10" pattern="^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$" class="form-control" :class="{'is-invalid':paramsE.modelo && !/^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsE.modelo),'is-valid':paramsE.modelo && /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/.test(paramsE.modelo)}" v-model="paramsE.modelo" placeholder="Modelo" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">serial</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-z0-9\-_]{6,20}$" class="form-control" :class="{'is-invalid':paramsE.serial && !/^[A-Za-z0-9\-_]{6,20}$/.test(paramsE.serial),'is-valid':paramsE.serial && /^[A-Za-z0-9\-_]{6,20}$/.test(paramsE.serial)}" v-model="paramsE.serial" placeholder="XyZ_2025 - xyz-2025 - xyz2025" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">codigo_inv</label>
                      <input type="text" maxlength="15" pattern="^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$" class="form-control" :class="{'is-invalid':paramsE.codigo_inv && !/^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$/.test(paramsE.codigo_inv),'is-valid':paramsE.codigo_inv && /^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$/.test(paramsE.codigo_inv)}" v-model="paramsE.codigo_inv" placeholder="codigo_inv-ABC123" />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">productos<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.producto?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.producto_id" required>
                        <option v-for="(producto, index) in relations" :key="index" :value="producto.id">{{ producto.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-8">
                      <label for="" class="badge text-secondary">observación</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsE.observacion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.observacion), 'is-valid':paramsE.observacion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.observacion) }" placeholder="Observación" v-model="paramsE.observacion"></textarea>
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
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Descripciones</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="paramsE = {}, avisos = null, avisosAlert =''"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>codigo: </b>{{ paramsE.codigo }}</p>
              </div>
              <div class="col-6">
                <p><b>modelo: </b>{{ paramsE.modelo }}</p>
              </div>
              <div class="col-6">
                <p><b>dispositivo: </b>{{ paramsE.dispositivo }}</p>
              </div>
              <div class="col-6">
                <p><b>marca: </b>{{ paramsE.marca }}</p>
              </div>
              <div class="col-6">
                <p><b>serial: </b>{{ paramsE.serial }}</p>
              </div>
              <div class="col-6">
                <p><b>codigo_inv: </b>{{ paramsE.codigo_inv }}</p>
              </div>
              <div class="col-12">
                <p><b>observacion: </b>{{ paramsE.observacion }}</p>
              </div>
              <hr class="border-4 border-primary opacity-75">
              <div class="col-6">
                <p><b>producto: </b>{{ paramsE.producto?.nombre }}</p>
              </div>
              <b>asignaciones: </b>
              <div class="col-6" v-for="(asignar) in paramsE.asignaciones?.filter(evalua => evalua.id === paramsE.id)" :key="asignar.id">
                <p>
                  <b>fecha_asignar: </b>{{ asignar?.fecha_asignar }} 
                </p>
                <p>
                  <b>fecha_devolucion: </b>{{ asignar?.fecha_devolucion }} 
                </p>
                <p>
                  <b>destino: </b>{{ asignar?.destino }} 
                </p>
                <p>
                  <b>comentario: </b>{{ asignar?.comentario }} 
                </p>
              </div>
              <div class="col-6">
                <p><b>evaluaciones: </b></p>
                <div class="row">
                  <span class="col-12" v-for="(evalua) in paramsE.evaluaciones?.filter(evalua => evalua.id === paramsE.id)" :key="evalua.id">
                    <p><b>estado_fisico: </b>{{ evalua?.estado_fisico }}</p>
                    <p><b>escala: </b>{{ evalua?.escala }}</p>
                    <p><b>compatibilidad: </b>{{ evalua?.compatibilidad }}</p>
                    <p><b>reemplazo: </b>{{ evalua?.reemplazo }}</p>
                    <p><b>mantenimineto: </b>{{ evalua?.mantenimineto }}</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="paramsE = {}, avisos = null, avisosAlert =''">Regresar</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="staticImportar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
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
      <div class="modal-dialog modal-dialog-centered">
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
                      <label for="" class="badge text-secondary text-wrap">pedidos</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData(paramsE,'pdf','pedidos')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary text-wrap">nota de entrega</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData(paramsE,'pdf','notaEntrega')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                </div>
                <div class="row" v-else>
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary text-wrap">modelos</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData('','pdf','modelos')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary text-wrap">formatos</label>
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
