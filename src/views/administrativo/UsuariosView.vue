<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { dataTable } from '@/components/utils/dataTableUtils';
import { Modal } from 'bootstrap/dist/js/bootstrap.min';
import UsuariosServicios from '@/components/services/administrativo/UsuariosServicios';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router'
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
const passwordVisible = ref(false);
const passwordshow = ref(false);
const avisos = ref(null);
const avisosAlert = ref(null);
const isLoadingImport = ref(false);
const modalAgregar = ref(null);
const modalEditar = ref(null);
const store = useLoginStore()
const { dataPerfil } = storeToRefs(store);
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
      if(row?.rol?.nombre?.toLowerCase()===(searchQuery?.toLowerCase() || row?.rol !== null)){
        const searchRelation = Object.values(row?.rol).some((celda) => {
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
      response = action=== 'create'? await UsuariosServicios(action, data, paramsA.value)
    : action === 'update'? await UsuariosServicios(action, data, paramsE.value):undefined;
      await handleData('fetchAll');
      paramsA.value = {};
      paramsE.value = {};
    } else if (action === 'delete') {
      await UsuariosServicios(action, data);
      await handleData('fetchAll');
    } else if (action === 'fetch') {
      paramsE.value = await UsuariosServicios('fetch', data);
    }
    avisos.value=response
    let timeoutId
    if(response?.error){
      avisos.value = response?.error;
      clearTimeout(timeoutId);
      let modalInstance = Modal.getInstance(modalAgregar.value) || Modal.getInstance(modalEditar.value);
      timeoutId = setTimeout(() => {
        avisos.value = null;
        modalInstance.hide();
      }, 3000);
    }else if(action === 'create' || action === 'update'){
      clearTimeout(timeoutId);
      let modalInstance = Modal.getInstance(modalAgregar.value) || Modal.getInstance(modalEditar.value);
      timeoutId = setTimeout(() => {
        avisos.value = null;
        modalInstance.hide();
      }, 1000);
    }
  } catch (error) {
    console.error('Error al manejar los datos:', error);
  } finally {
    isLoadingImport.value = false
    const {mostrarT,estatus,roles} = await UsuariosServicios('fetchAll');
    col.value = columns(mostrarT);
    relations.value=[estatus,roles]
    console.log(dataPerfil.value);
    rowData.value = mostrarT.filter(row => {
      if(dataPerfil.value.rol?.id !== 1 && dataPerfil.value.rol?.id !== 3)
      return row.rol?.id === dataPerfil.value.rol?.id
      else if(dataPerfil.value.rol?.id !== 1 && dataPerfil.value.rol?.id === 3)
      return row.rol?.id !== 1
      else
      return row
    });
    totalOfPage.value = Math.ceil(rowData.value.length / rowsPerPage.value);
  }
};
const visiblePages = computed(() => {
  const total = Math.ceil(filteredData.value?.length / rowsPerPage.value) || Math.ceil(rowData.value?.length / rowsPerPage.value);
  const current = currentPage.value;
  const range = [];

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
  () => paramsA.value?.nombre,
  () => paramsA.value?.apellido,
  () => paramsA.value?.cedula,
  () => paramsA.value?.usuario,
  () => paramsA.value?.correo,
  () => paramsA.value?.password,
  () => paramsA.value?.ciudad,
  () => paramsA.value?.estado,
  () => paramsA.value?.telefono_casa,
  () => paramsA.value?.telefono_celular,
  () => paramsA.value?.telefono_alternativo,
  () => paramsA.value?.codigo_postal,
  () => paramsA.value?.direccion,
],
  ([
  nombre, apellido, cedula,
  usuario, correo, password,
  ciudad, estado, telefono_casa,
  telefono_celular, telefono_alternativo, codigo_postal,
  direccion,
  ]) => {
  const errors = [];
  const nombreError = validacionesUtils().textValid(nombre);
  if (nombreError) errors.push(nombreError);
  const apellidoError = validacionesUtils().textValid(apellido);
  if (apellidoError) errors.push(apellidoError);
  const usuarioError = validacionesUtils().usuariosValid(usuario);
  if (usuarioError) errors.push(usuarioError);
  const cedulaError = validacionesUtils().cedulaValid(cedula);
  if (cedulaError) errors.push(cedulaError);
  const correoError = validacionesUtils().emailValid(correo);
  if (correoError) errors.push(correoError);
  const passwordError = validacionesUtils().passwordValid(password);
  if (passwordError) errors.push(passwordError);
  const ciudadError = validacionesUtils().textValid(ciudad);
  if (ciudadError) errors.push(ciudadError);
  const estadoError = validacionesUtils().textValid(estado);
  if (estadoError) errors.push(estadoError);
  const telefono_casaError = validacionesUtils().phoneLocalValid(telefono_casa);
  if (telefono_casaError) errors.push(telefono_casaError);
  const telefono_celularError = validacionesUtils().phoneValid(telefono_celular);
  if (telefono_celularError) errors.push(telefono_celularError);
  const telefono_alternativoError = validacionesUtils().phoneAlternativeValid(telefono_alternativo);
  if (telefono_alternativoError) errors.push(telefono_alternativoError);
  const codigo_postalError = validacionesUtils().numberValid(codigo_postal);
  if (codigo_postalError) errors.push(codigo_postalError);
  const direccionError = validacionesUtils().textareaValid(direccion);
  if (direccionError) errors.push(direccionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((nombre==='' || nombre===undefined)
  && (apellido==='' || apellido===undefined)
  && (usuario==='' || usuario===undefined)
  && (cedula==='' || cedula===undefined)
  && (correo==='' || correo===undefined)
  && (ciudad==='' || ciudad===undefined)
  && (estado==='' || estado===undefined)
  && (telefono_celular==='' || telefono_celular===undefined)
  && (telefono_alternativo==='' || telefono_alternativo===undefined)
  && (codigo_postal==='' || codigo_postal===undefined)
  && (direccion==='' || direccion===undefined)
  && (telefono_casa==='' || telefono_casa===undefined))
  avisosAlert.value="";
});
watch([
  () => paramsE.value?.nombre,
  () => paramsE.value?.apellido,
  () => paramsE.value?.cedula,
  () => paramsE.value?.usuario,
  () => paramsE.value?.correo,
  () => paramsE.value?.password,
  () => paramsE.value?.ciudad,
  () => paramsE.value?.estado,
  () => paramsE.value?.telefono_casa,
  () => paramsE.value?.telefono_celular,
  () => paramsE.value?.telefono_alternativo,
  () => paramsE.value?.codigo_postal,
  () => paramsE.value?.direccion,
],
  ([
  nombre, apellido, cedula,
  usuario, correo, password,
  ciudad, estado, telefono_casa,
  telefono_celular, telefono_alternativo, codigo_postal,
  direccion,
  ]) => {
  const errors = [];
  const nombreError = validacionesUtils().textValid(nombre);
  if (nombreError) errors.push(nombreError);
  const apellidoError = validacionesUtils().textValid(apellido);
  if (apellidoError) errors.push(apellidoError);
  const usuarioError = validacionesUtils().usuariosValid(usuario);
  if (usuarioError) errors.push(usuarioError);
  const cedulaError = validacionesUtils().cedulaValid(cedula);
  if (cedulaError) errors.push(cedulaError);
  const correoError = validacionesUtils().emailValid(correo);
  if (correoError) errors.push(correoError);
  const passwordError = validacionesUtils().passwordValid(password);
  if (passwordError) errors.push(passwordError);
  const ciudadError = validacionesUtils().textValid(ciudad);
  if (ciudadError) errors.push(ciudadError);
  const estadoError = validacionesUtils().textValid(estado);
  if (estadoError) errors.push(estadoError);
  const telefono_casaError = validacionesUtils().phoneLocalValid(telefono_casa);
  if (telefono_casaError) errors.push(telefono_casaError);
  const telefono_celularError = validacionesUtils().phoneValid(telefono_celular);
  if (telefono_celularError) errors.push(telefono_celularError);
  const telefono_alternativoError = validacionesUtils().phoneAlternativeValid(telefono_alternativo);
  if (telefono_alternativoError) errors.push(telefono_alternativoError);
  const codigo_postalError = validacionesUtils().numberValid(codigo_postal);
  if (codigo_postalError) errors.push(codigo_postalError);
  const direccionError = validacionesUtils().textareaValid(direccion);
  if (direccionError) errors.push(direccionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((nombre==='' || nombre===undefined)
  && (apellido==='' || apellido===undefined)
  && (usuario==='' || usuario===undefined)
  && (cedula==='' || cedula===undefined)
  && (correo==='' || correo===undefined)
  && (ciudad==='' || ciudad===undefined)
  && (estado==='' || estado===undefined)
  && (telefono_celular==='' || telefono_celular===undefined)
  && (telefono_alternativo==='' || telefono_alternativo===undefined)
  && (codigo_postal==='' || codigo_postal===undefined)
  && (direccion==='' || direccion===undefined)
  && (telefono_casa==='' || telefono_casa===undefined))
  avisosAlert.value="";
});
const fileData = async (fileEvent,format,nameFile) => {
  switch (format) {
    case 'pdf':
      await UsuariosServicios(format,fileEvent.id,nameFile);
        break;
    case 'export':
      await UsuariosServicios(format,fileEvent.id,nameFile);
        break;
    case 'exportAll':
      await UsuariosServicios(format,fileEvent.id,nameFile);
        break;
    case 'import':
      isLoadingImport.value = true
      const formData = new FormData();
      Array.from(fileEvent.target.elements?.file.files).map(async (file,index)=>{
        formData.append(`file[${index}]`,file);
      })
      try {
          const response = await UsuariosServicios(format, '', formData);
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
          UsuariosServicios('delete', row.id)
        }
      }));
    } else if (type === 'all') {
      // Eliminación de todos los registros
      await Promise.all(selectedRowsAll.value.map(row =>{
        if(row.id !==1){
          UsuariosServicios('delete', row.id)
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
    <span class="badge fs-1"><i class="bi bi-people"></i> Usuarios</span>
    <hr class="border-5 border-red-m opacity-75">
    <div class="card w-100">
      <div class="card-body p-5">
        <h5 class="text-dark fs-6 badge"><i class="bi bi-people"></i> Usuarios</h5>
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
                    <li><button class="dropdown-item" type="button" @click="fileData(rowData,'exportAll','usuarios')"><i class="bi bi-upload"></i> Exportar</button></li>
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
                      <input class="form-check-input"  :class="{ 'selected': selectedRowsAll.length }" type="checkbox" role="switch" id="flexSwitchCheckDefault" @change="(e)=>handleMasivoDelete(e)" :checked="selectedRowsAll.length === rowData.length">
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
                  <td>{{ row.nombre }}</td>
                  <td>{{ row.apellido }}</td>
                  <td>{{ row.cedula }}</td>
                  <td>{{ row.usuario }}</td>
                  <td>{{ row.correo }}</td>
                  <td>{{ row.estatus?.nombre }}</td>
                  <td>{{ row.rol?.nombre }}</td>
                  <td>
                    <button class="btn btn-outline-secondary text-red dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">⚙️</button>
                    <ul class="dropdown-menu p-2 gap-3">
                      <li><button class="btn btn-outline-secondary text-red dropdown-item fs-5 p-0" title="PDF" type="button" data-bs-toggle="modal" data-bs-target="#staticPDF" @click="handleData('fetch', row.id)"><i class="bi bi-file-pdf"></i>PDF</button></li>
                      <li><button class="btn btn-outline-warning text-red dropdown-item fs-5 p-0" title="Exportar" type="button" @click="fileData(row,'export',row.usuario)"><i class="bi bi-upload"></i>Exportar</button></li>
                      <li v-if="dataPerfil.rol.id !== 2">
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
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">roles<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.rol_id" required>
                        <option v-for="(rol, index) in relations[1]" :key="index" :value="rol.id">{{ rol.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">nombre<span class="text-danger">*</span></label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsA.nombre && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.nombre),'is-valid':paramsA.nombre && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.nombre)}" v-model="paramsA.nombre" placeholder="Nombre" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Apellido<span class="text-danger">*</span></label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsA.apellido && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.apellido),'is-valid':paramsA.apellido && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.apellido)}" v-model="paramsA.apellido" placeholder="Apellido" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Cedula<span class="text-danger">*</span></label>
                      <input type="text" maxlength="10" pattern="^[a-zA-Z]?(-?)\d{7,10}$" class="form-control" :class="{'is-invalid':paramsA.cedula && !/^[a-zA-Z]?(-?)\d{7,10}$/.test(paramsA.cedula),'is-valid':paramsA.cedula && /^[a-zA-Z]?(-?)\d{7,10}$/.test(paramsA.cedula)}" v-model="paramsA.cedula" placeholder="Cedula" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Usuario<span class="text-danger">*</span></label>
                      <input type="text" maxlength="15" pattern="^[a-zA-Z0-9]{4,}$" class="form-control" :class="{'is-invalid':paramsA.usuario && !/^[a-zA-Z0-9]{4,}$/.test(paramsA.usuario),'is-valid':paramsA.usuario && /^[a-zA-Z0-9]{4,}$/.test(paramsA.usuario)}" v-model="paramsA.usuario" placeholder="Usuario" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Correo<span class="text-danger">*</span></label>
                      <input type="email" maxlength="35" pattern="^\S+@\S+\.\S+$" class="form-control" :class="{'is-invalid':paramsA.correo && !/^\S+@\S+\.\S+$/.test(paramsA.correo),'is-valid':paramsA.correo && /^\S+@\S+\.\S+$/.test(paramsA.correo)}" v-model="paramsA.correo" placeholder="Correo" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <div class="row">
                        <div class="col-12">
                          <label for="" class="badge text-secondary">Contraseña<span class="text-danger">*</span></label>
                        </div>
                        <div class="col-8 m-0 ms-3 p-0">
                          <input :type="passwordVisible?'text':'password'" maxlength="20" pattern="^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$" class="form-control" :class="{'is-invalid':paramsA.password && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(paramsA.password),'is-valid':paramsA.password && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(paramsA.password)}" v-model="paramsA.password" placeholder="Contraseña" required autocomplete="on"/>
                        </div>
                        <div class="col-3 m-0 p-0">
                          <button type="button" @click="passwordVisible = !passwordVisible" class="icono btn btn-outline-secondary">
                            <span  v-if="passwordVisible">👁️</span>
                            <span v-else>👁️‍🗨️</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Ciudad</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsA.ciudad && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.ciudad),'is-valid':paramsA.ciudad && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.ciudad)}" v-model="paramsA.ciudad" placeholder="Ciudad capital" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Estado</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsA.estado && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.estado),'is-valid':paramsA.estado && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.estado)}" v-model="paramsA.estado" placeholder="Estado geográfico" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de casa</label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?212)-?\d{7}$" class="form-control" :class="{'is-invalid': paramsA.telefono_casa && !/^(0?212)-?\d{7}$/.test(paramsA.telefono_casa),'is-valid': paramsA.telefono_casa && /^(0?212)-?\d{7}$/.test(paramsA.telefono_casa)}" v-model="paramsA.telefono_casa" placeholder="Telefono de casa" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de celular<span class="text-danger">*</span></label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?41[246]|0?42[46])-?\d{7}$" class="form-control" :class="{'is-invalid': paramsA.telefono_celular && !/^(0?41[246]|0?42[46])-?\d{7}$/.test(paramsA.telefono_celular),'is-valid': paramsA.telefono_celular && /^(0?41[246]|0?42[46])-?\d{7}$/.test(paramsA.telefono_celular)}" v-model="paramsA.telefono_celular" placeholder="Telefono de celular" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de alternativo</label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?41[246]|0?42[46]|0?212)-?\d{7}$" class="form-control" :class="{'is-invalid': paramsA.telefono_alternativo && !/^(0?41[246]|0?42[46]|0?212)-?\d{7}$/.test(paramsA.telefono_alternativo),'is-valid': paramsA.telefono_alternativo && /^(0?41[246]|0?42[46]|0?212)-?\d{7}$/.test(paramsA.telefono_alternativo)}" v-model="paramsA.telefono_alternativo" placeholder="Telefono de alternativo" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Codigo postal</label>
                      <input type="text" inputmode="numeric" maxlength="4" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsA.codigo_postal && !/^\d+(^\.\d+)?$/.test(paramsA.codigo_postal),'is-valid': paramsA.codigo_postal && /^\d+(^\.\d+)?$/.test(paramsA.codigo_postal)}" v-model="paramsA.codigo_postal" placeholder="Codigo postal" autocomplete="on"/>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">Dirección</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.direccion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.direccion), 'is-valid':paramsA.direccion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.direccion) }" placeholder="Dirección" v-model="paramsA.direccion" autocomplete="on"></textarea>
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
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus actual<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.estatus?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">roles actual<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.rol?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.rol_id" required>
                        <option v-for="(rol, index) in relations[1]" :key="index" :value="rol.id">{{ rol.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">nombre<span class="text-danger">*</span></label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsE.nombre && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.nombre),'is-valid':paramsE.nombre && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.nombre)}" v-model="paramsE.nombre" placeholder="Nombre" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Apellido<span class="text-danger">*</span></label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsE.apellido && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.apellido),'is-valid':paramsE.apellido && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.apellido)}" v-model="paramsE.apellido" placeholder="Apellido" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Cedula<span class="text-danger">*</span></label>
                      <input type="text" maxlength="10" pattern="^[a-zA-Z]?(-?)\d{7,10}$" class="form-control" :class="{'is-invalid':paramsE.cedula && !/^[a-zA-Z]?(-?)\d{7,10}$/.test(paramsE.cedula),'is-valid':paramsE.cedula && /^[a-zA-Z]?(-?)\d{7,10}$/.test(paramsE.cedula)}" v-model="paramsE.cedula" placeholder="Cedula" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Usuario<span class="text-danger">*</span></label>
                      <input type="text" maxlength="15" pattern="^[a-zA-Z0-9]{4,}$" class="form-control" :class="{'is-invalid':paramsE.usuario && !/^[a-zA-Z0-9]{4,}$/.test(paramsE.usuario),'is-valid':paramsE.usuario && /^[a-zA-Z0-9]{4,}$/.test(paramsE.usuario)}" v-model="paramsE.usuario" placeholder="Usuario" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Correo<span class="text-danger">*</span></label>
                      <input type="email" maxlength="35" pattern="^\S+@\S+\.\S+$" class="form-control" :class="{'is-invalid':paramsE.correo && !/^\S+@\S+\.\S+$/.test(paramsE.correo),'is-valid':paramsE.correo && /^\S+@\S+\.\S+$/.test(paramsE.correo)}" v-model="paramsE.correo" placeholder="Correo" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <div class="row">
                        <div class="col-12">
                          <label for="" class="badge text-secondary">Contraseña<span class="text-danger">*</span></label>
                        </div>
                        <div class="col-8 m-0 ms-3 p-0">
                          <input :type="passwordshow?'text':'password'" maxlength="20" pattern="^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$" class="form-control" :class="{'is-invalid':paramsE.password && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(paramsE.password),'is-valid':paramsE.password && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(paramsE.password)}" v-model="paramsE.password" placeholder="Contraseña" required autocomplete="on"/>
                        </div>
                        <div class="col-3 m-0 p-0">
                          <button type="button" @click="passwordshow = !passwordshow" class="icono btn btn-outline-secondary">
                            <span  v-if="passwordshow">👁️</span>
                            <span v-else>👁️‍🗨️</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Ciudad</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsE.ciudad && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.ciudad),'is-valid':paramsE.ciudad && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.ciudad)}" v-model="paramsE.ciudad" placeholder="Ciudad capital" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Estado</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsE.estado && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.estado),'is-valid':paramsE.estado && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.estado)}" v-model="paramsE.estado" placeholder="Estado geográfico" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de casa</label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?212)-?\d{7}$" class="form-control" :class="{'is-invalid': paramsE.telefono_casa && !/^(0?212)-?\d{7}$/.test(paramsE.telefono_casa),'is-valid': paramsE.telefono_casa && /^(0?212)-?\d{7}$/.test(paramsE.telefono_casa)}" v-model="paramsE.telefono_casa" placeholder="Telefono de casa" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de celular<span class="text-danger">*</span></label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?41[246]|0?42[46])-?\d{7}$" class="form-control" :class="{'is-invalid': paramsE.telefono_celular && !/^(0?41[246]|0?42[46])-?\d{7}$/.test(paramsE.telefono_celular),'is-valid': paramsE.telefono_celular && /^(0?41[246]|0?42[46])-?\d{7}$/.test(paramsE.telefono_celular)}" v-model="paramsE.telefono_celular" placeholder="Telefono de celular" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de alternativo</label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?41[246]|0?42[46]|0?212)-?\d{7}$" class="form-control" :class="{'is-invalid': paramsE.telefono_alternativo && !/^(0?41[246]|0?42[46]|0?212)-?\d{7}$/.test(paramsE.telefono_alternativo),'is-valid': paramsE.telefono_alternativo && /^(0?41[246]|0?42[46]|0?212)-?\d{7}$/.test(paramsE.telefono_alternativo)}" v-model="paramsE.telefono_alternativo" placeholder="Telefono de alternativo" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Codigo postal</label>
                      <input type="text" inputmode="numeric" maxlength="4" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsE.codigo_postal && !/^\d+(^\.\d+)?$/.test(paramsE.codigo_postal),'is-valid': paramsE.codigo_postal && /^\d+(^\.\d+)?$/.test(paramsE.codigo_postal)}" v-model="paramsE.codigo_postal" placeholder="Codigo postal" autocomplete="on"/>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">Dirección</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsE.direccion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.direccion), 'is-valid':paramsE.direccion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.direccion) }" placeholder="Dirección" v-model="paramsE.direccion" autocomplete="on"></textarea>
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
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Usuario</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="paramsE = {}, avisos = null, avisosAlert =''"></button>
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
                <p><b class="text-red fw-bolder">estatus: </b>{{ paramsE.estatus?.nombre }}</p>
              </div>
              <div class="col-4">
                <p><b class="text-red fw-bolder">rol: </b>{{ paramsE.rol?.nombre }}</p>
              </div>
              <div class="col-4">
                <p><b class="text-red fw-bolder">productos: </b>{{ paramsE.productos?.length }}</p>
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
