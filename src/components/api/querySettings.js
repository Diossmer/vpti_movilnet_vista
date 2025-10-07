const querySettings = ()=>{

  const get = async ( url=null, token = null ) => {
    return await fetch(`${ url }`,{
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    }).then( async ( response ) =>{
      return await response.json();
    }).catch( async ( err )=>{
      return await err;
    });
  };

  const post = async ( url=null, params = null, token = null, optional = 'omit') => {
    return await fetch(`${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      credentials: optional,
      body: JSON.stringify(params),
    }).then( async ( response ) =>{
      return await response.json();
    }).catch( async ( err )=>{
      return await err;
    });
  };

  const put = async ( url=null, params = null, token = null ) => {
    return await fetch(`${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params),
    }).then( async ( response ) =>{
      return await response.json();
    }).catch( async ( err )=>{
      return await err;
    });
  };

  const patch = async (url=null, params = null, token = null) => {
    return await fetch(`${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params),
    }).then( async ( response ) =>{
      return await response.json();
    }).catch( async ( err )=>{
      return await err;
    });
  };

  const destroy = async ( url=null, token = null, optional = 'omit' ) => {
    return await fetch(`${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      credentials: optional,
    }).then( async ( response ) =>{
      return await response.json();
    }).catch( async ( err )=>{
      return await err;
    });
  };

  const blob = async (url=null, token = null) => {
    return await fetch(`${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    }).then( async ( response ) =>{
      return await response.blob();
    }).catch( async ( err )=>{
      return await err;
    });
  };

  const formData = async ( url=null, params = null, token = null) => {
    return await fetch(`${url}`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: params,
    }).then( async ( response ) =>{
      return await response.json();
    }).catch( async ( err )=>{
      return await err;
    });
  };

  return { get, post, put, patch, destroy, blob, formData };
};

export default querySettings;
