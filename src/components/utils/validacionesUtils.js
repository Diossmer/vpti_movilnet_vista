export function validacionesUtils() {
  const usuariosValid = (params)=>{
    const usuarioRegex = /^[a-zA-Z0-9]{4,}$/;
    return usuarioRegex.test(params)
    ? "✅Correcto."
    : "❌El usuario debe tener al menos 4 caracteres alfanuméricos.";
  }
  const passwordValid = (params)=>{
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}/
    return passwordRegex.test(params)
    ? "✅Correcto."
    : "❌Solo debe tener mayúscula, número y caracteres especiales.";
  }
  const passwordVerificValid = (passwordOld,password)=>{
    return (passwordOld===password)
    ? "✅Correcto."
    : "❌La contraseña no coinciden, Intente con otra contraseña.";
  }
  const nombreValid = (params) => {
    const textRegex = /^[A-Za-zÁ-Úá-úñÑ\s\d]+$/;
    return textRegex.test(params)
      ? "✅Correcto."
      : "❌Solo debe contener letras, espacios y numeros.";
  }
  const textValid = (params) => {
    const textRegex = /^[^0-9][A-Za-zÁ-Úá-úñÑ\s-{}()+*]+$/;
    return textRegex.test(params)
      ? "✅Correcto."
      : "❌Solo debe contener letras y espacios.";
  };
  const textareaValid = (params) => {
    const textareaRegex = /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/;
    return textareaRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten letras y espacios (sin símbolos o caracteres especiales)";
  };
  const decimalValid = (params) => {
    const numberRegex = /^\d+(\.\d{1,2})?$/;
    return numberRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten números y decimales (sin símbolos, sin caracteres y caracteres especiales)";
  };
  const numberValid = (params) => {
    const numberRegex = /^\d+(^\.\d+)?$/;
    return numberRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten números (Sin decimales, sin símbolos, sin caracteres y caracteres especiales)";
  };
  const checkboxValid = (params) => {
    return params
      ? "✅Correcto."
      : "❌Solo se permiten números y decimales (sin símbolos, sin caracteres y caracteres especiales)";
  };
  const nivelValid = (params) => {
    const nivelRegex = /^(1[0-5]|[1-9])$/;
    return nivelRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten números y debe ser entre 1 y 15";
  }
  const dateValid = (params) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten formato de fecha año - mes - dia";
  }
  const pointvalid = (params) => {
    const pointRegex = /^\d+$/;
    return !pointRegex.test(params)
      ? "❌Solo números enteros permitidos"
      : (params < 1 || params > 5)
      ? "❌Solo debe ser entre 1 y 5"
      : "✅Correcto.";
  }
  const serialValid=(params)=>{
    const serialRegex = /^[A-Za-z0-9\-_]{6,20}$/;
    return serialRegex.test(params)
    ?"✅Correcto."
    :"❌Solo números Alfanumericos cantidad digitos 6 ó 20 permitidos"
  }
  const skuValid=(params)=>{
    const skuRegex = /^[A-Z0-9]{3,}-[A-Z0-9]{3,8}$/;
    return skuRegex.test(params)
    ?"✅Correcto."
    :"❌Solo números Alfanumericos cantidad digitos entre 3 a 8 permitidos"
  }
  const phoneValid=(params)=>{
    const phoneRegex = /^(0?41[246]|0?42[46])-?\d{7}$/;
    return phoneRegex.test(params)
    ?"✅Correcto."
    :"❌Solo codigos de area permitidos"
  }
  const phoneLocalValid=(params)=>{
    const phoneLocalRegex = /^(0?212)-?\d{7}$/;
    return phoneLocalRegex.test(params)
    ?"✅Correcto."
    :"❌Solo codigos de area local permitidos"
  }
  const phoneAlternativeValid=(params)=>{
    const phoneAlternativeRegex = /^(0?41[246]|0?42[46]|0?212)-?\d{7}$/;
    return phoneAlternativeRegex.test(params)
    ?"✅Correcto."
    :"❌Solo codigos de area permitidos"
  }
  const formatValid=(params)=>{//tallas
    const formatRegex = /^(\d+|X{0,2}[SLM]|X{3}L?)([-/](\d+|X{0,2}[SLM]|X{3}L?))*$/;
    return formatRegex.test(params)
    ?"✅Correcto."
    :"❌Solo Tallas internacionales y nacionales permitidos"
  }
  const sizeValid=(params)=>{
    const sizeRegex = /^\d+\s*[a-zA-Z]+(?:\s+\d+\s*[a-zA-Z]+)*$/;
    return sizeRegex.test(params)
    ?"✅Correcto."
    :"❌Solo Unidades de medidas o escala"
  }
  const emailValid = (params) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(params)
      ? "✅Correcto."
      : "❌Formato válido: usuario@dominio.com (ej: nombre.apellido123@empresa.com.co)";
  };
  const cedulaValid = (params) => {
    const cedulaRegex = /^[a-zA-Z]?(-?)\d{7,10}$/;
    return cedulaRegex.test(params)
      ? "✅Correcto."
      : "❌Formato válido:V-12345678";
  };
  const pisoValid = (params) => {
    const cedulaRegex = /^(PB|pb|\d+|S[0-9]|s[0-9])$/;
    return cedulaRegex.test(params)
      ? "✅Correcto."
      : "❌Formato válido: PB, 1-n, S0-S9 (ej: S3, pb)";
  };
  return {
    usuariosValid,
    passwordValid,
    nombreValid,
    textValid,
    textareaValid,
    numberValid,
    decimalValid,
    checkboxValid,
    nivelValid,
    dateValid,
    pointvalid,
    serialValid,
    skuValid,
    phoneValid,
    phoneLocalValid,
    phoneAlternativeValid,
    formatValid,
    sizeValid,
    emailValid,
    cedulaValid,
    pisoValid,
    passwordVerificValid,
  };
};
