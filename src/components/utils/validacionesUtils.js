export function validacionesUtils() {
  const usuariosValid = (params) => {
    const usuarioRegex = /^[a-zA-Z0-9]{4,}$/;
    return usuarioRegex.test(params)
      ? "✅Correcto."
      : "❌El usuario debe tener al menos 4 caracteres alfanuméricos.";
  }

  const passwordValid = (params) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@.*_+\-]).{8,}$/;
    return passwordRegex.test(params)
      ? "✅Correcto."
      : "❌La contraseña debe tener al menos una mayúscula, un número y un caracter especial, y debe tener al menos 8 caracteres.";
  }

  const passwordVerificValid = (passwordOld, password) => {
    return (passwordOld === password)
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
    const textRegex = /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/;
    return textRegex.test(params)
      ? "✅Correcto."
      : "❌Solo debe contener letras, espacios y los símbolos permitidos.";
  };

  const textareaValid = (params) => {
    const textareaRegex = /^[^<>{}\[\]]+$/;
    return textareaRegex.test(params)
      ? "✅Correcto."
      : "❌ No se permiten los caracteres < > { } [ ] y solo se permiten letras, números, espacios y los símbolos , . -";
  };

  const decimalValid = (params) => {
    const numberRegex = /^\d+(\.\d{1,2})?$/;
    return numberRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten números y decimales (hasta 2 decimales).";
  };

  const numberValid = (params) => {
    const numberRegex = /^\d+$/;
    return numberRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten números enteros.";
  };

  const checkboxValid = (params) => {
    return params
      ? "✅Correcto."
      : "❌Debe seleccionar una opción.";
  };

  const nivelValid = (params) => {
    const nivelRegex = /^(1[0-5]|[1-9])$/;
    return nivelRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten números entre 1 y 15.";
  }

  const dateValid = (params) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permite el formato de fecha año-mes-día (yyyy-mm-dd).";
  }

  const pointvalid = (params) => {
    const pointRegex = /^\d+$/;
    return !pointRegex.test(params)
      ? "❌Solo números enteros permitidos"
      : (params < 1 || params > 5)
      ? "❌Solo debe ser entre 1 y 5"
      : "✅Correcto.";
  }

  const serialValid = (params) => {
    const serialRegex = /^[^<>/'`]{6,20}$/;
    return serialRegex.test(params)
      ? "✅Correcto."
      : "❌No se permiten los caracteres < > / ' `, y la longitud debe ser entre 6 y 20 caracteres.";
  };

  const skuValid = (params) => {
    const skuRegex = /^[^<>/'`]{3,}-[A-Z0-9]{3,8}$/;
    return skuRegex.test(params)
      ? "✅Correcto."
      : "❌No se permiten los caracteres < > / ' `. Debe tener un guion (-), con 3 a 8 letras o números en mayúsculas después.";
  };

  const phoneValid = (params) => {
    const phoneRegex = /^(0?41[246]|0?42[46])-?\d{7}$/;
    return phoneRegex.test(params)
      ? "✅Correcto."
      : "❌Solo codigos de area permitidos";
  }

  const phoneLocalValid = (params) => {
    const phoneLocalRegex = /^(0?212)-?\d{7}$/;
    return phoneLocalRegex.test(params)
      ? "✅Correcto."
      : "❌Solo codigos de area local permitidos";
  }

  const phoneAlternativeValid = (params) => {
    const phoneAlternativeRegex = /^(0?41[246]|0?42[46]|0?212)-?\d{7}$/;
    return phoneAlternativeRegex.test(params)
      ? "✅Correcto."
      : "❌Solo codigos de area permitidos";
  }

  const formatValid = (params) => {
    const formatRegex = /^\d+$/;
    return formatRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten códigos de equipos numéricos. No se permiten letras ni otros caracteres.";
  }

  const sizeValid = (params) => {
    const escalaRegex = /^(critico|alto|medio|bajo|regular|resuelto)$/;
    return escalaRegex.test(params)
      ? "✅Correcto."
      : "❌Solo se permiten las escalas: critico, alto, medio, bajo, regular, o resuelto.";
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