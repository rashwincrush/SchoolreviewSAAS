(function(){
  try{
    var s = document.currentScript;
    var tenant = s.getAttribute('data-tenant');
    if(!tenant) return;
    var url = "https://reviews.yourdomain.com/embed?tenant="+encodeURIComponent(tenant);
    var mount = s.previousElementSibling && s.previousElementSibling.id === 'school-reviews'
      ? s.previousElementSibling
      : (function(){var d=document.createElement('div'); d.id='school-reviews'; s.parentNode.insertBefore(d,s); return d;})();
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = "100%";
    iframe.style.border = "0";
    iframe.style.minHeight = "600px";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    mount.appendChild(iframe);
  }catch(e){}
})();
