var documentoUrl=global_settings.urlCORS+"/api/documentoapi/";registrationModule.factory("documentoRepository",function(o){return{get:function(t){return o.get(documentoUrl+"0|"+t)},getByNodo:function(t,n,e){return o.get(documentoUrl+"1|"+t+"|"+n+"|"+e)},sendMail:function(t,n,e){return o({url:documentoUrl,method:"POST",params:{id:"2|"+t+"|"+n+"|"+e}})},saveDocument:function(t,n,e,r,u,c,d){return o({url:documentoUrl,method:"POST",params:{id:"3|"+t+"|"+n+"|"+e+"|"+r+"|"+u+"|"+c+"|"+d}})}}});