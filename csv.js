(function(root){
'use strict';
function encode(rows){return '\uFEFF'+rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[\s\uFEFF]*[=+@-]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n')+'\r\n';}
const api={encode};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OrgoCsv=api;
})(typeof window!=='undefined'?window:globalThis);
