// Configuración cifrada de ambientes de prueba. No contiene configuración productiva.
(()=>{
 const payload={"dev":{"n":"ELcVa0b9fXlpWqJr","v":"wWhltyLQKsdwjjUnd/TFGQiW/Yty1Vd41nABjIEFS9NrLA35m/IEtnj4IQuBZumaEysep7rbvac="},"qa":{"n":"WwJqbvH44KBKuK6K","v":"LeSiI9HMiHMeBghiAliszBzhEj21iNIRKqw7zrpywTqrmtp+zFkl5X7EzING0P2UAgy2LoLGZCs="},"uat":{"n":"rJTtlkz2iMjx6+6X","v":"Iq+ThNc7ctmXHwrGwRuydoKnGyk9g5sdXJ56UEZlUZMNLQdnUeb4aB3ecmk1AiacKjG1ftDTrW4="}};
 const fragments=["OTcpao4t/o8sKakI4f9rwHjG27bP6gq8sv1dKpUjTdI=","xDvfIwZQqzBf0ZLHReDS0Qjo3mcFHwVLl8fX5VvnDg4="];
 const bytes=value=>Uint8Array.from(atob(value),char=>char.charCodeAt(0));
 window.getDatafastTestApiKey=async environment=>{
  const item=payload[environment];
  if(!item) throw new Error('Ambiente de pruebas no disponible.');
  const parts=fragments.map(bytes);
  const material=parts[0].map((value,index)=>value^parts[1][index]);
  try{
   const key=await crypto.subtle.importKey('raw',material,{name:'AES-GCM'},false,['decrypt']);
   const decoded=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(item.n),additionalData:new TextEncoder().encode('datafast-wiki:'+environment)},key,bytes(item.v));
   return new TextDecoder().decode(decoded);
  }finally{material.fill(0);parts.forEach(part=>part.fill(0));}
 };
})();
