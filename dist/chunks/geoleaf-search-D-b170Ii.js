import { L as Log } from './geoleaf-chunk-core-utils-4nAkV2K5.js';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var flexsearch_bundle$1 = {exports: {}};

/**!
 * FlexSearch.js v0.7.31 (Bundle)
 * Copyright 2018-2022 Nextapps GmbH
 * Author: Thomas Wilkerling
 * Licence: Apache-2.0
 * https://github.com/nextapps-de/flexsearch
 */
var flexsearch_bundle = flexsearch_bundle$1.exports;

var hasRequiredFlexsearch_bundle;

function requireFlexsearch_bundle () {
	if (hasRequiredFlexsearch_bundle) return flexsearch_bundle$1.exports;
	hasRequiredFlexsearch_bundle = 1;
	(function (module) {
		(function _f(self){try{if(module)self=module;}catch(e){}self._factory=_f;var t;function u(a){return "undefined"!==typeof a?a:true}function aa(a){const b=Array(a);for(let c=0;c<a;c++)b[c]=v();return b}function v(){return Object.create(null)}function ba(a,b){return b.length-a.length}function x(a){return "string"===typeof a}function C(a){return "object"===typeof a}function D(a){return "function"===typeof a}function ca(a,b){var c=da;if(a&&(b&&(a=E(a,b)),this.H&&(a=E(a,this.H)),this.J&&1<a.length&&(a=E(a,this.J)),c||""===c)){a=a.split(c);if(this.filter){b=this.filter;c=a.length;const d=[];for(let e=0,f=0;e<c;e++){const g=a[e];g&&!b[g]&&(d[f++]=g);}a=d;}return a}return a}const da=/[\p{Z}\p{S}\p{P}\p{C}]+/u,ea=/[\u0300-\u036f]/g;
		function fa(a,b){const c=Object.keys(a),d=c.length,e=[];let f="",g=0;for(let h=0,k,m;h<d;h++)k=c[h],(m=a[k])?(e[g++]=F(b?"(?!\\b)"+k+"(\\b|_)":k),e[g++]=m):f+=(f?"|":"")+k;f&&(e[g++]=F(b?"(?!\\b)("+f+")(\\b|_)":"("+f+")"),e[g]="");return e}function E(a,b){for(let c=0,d=b.length;c<d&&(a=a.replace(b[c],b[c+1]),a);c+=2);return a}function F(a){return new RegExp(a,"g")}function ha(a){let b="",c="";for(let d=0,e=a.length,f;d<e;d++)(f=a[d])!==c&&(b+=c=f);return b}var ja={encode:ia,F:false,G:""};function ia(a){return ca.call(this,(""+a).toLowerCase(),false)}const ka={},G={};function la(a){I(a,"add");I(a,"append");I(a,"search");I(a,"update");I(a,"remove");}function I(a,b){a[b+"Async"]=function(){const c=this,d=arguments;var e=d[d.length-1];let f;D(e)&&(f=e,delete d[d.length-1]);e=new Promise(function(g){setTimeout(function(){c.async=true;const h=c[b].apply(c,d);c.async=false;g(h);});});return f?(e.then(f),this):e};}function ma(a,b,c,d){const e=a.length;let f=[],g,h,k=0;d&&(d=[]);for(let m=e-1;0<=m;m--){const n=a[m],w=n.length,q=v();let r=!g;for(let l=0;l<w;l++){const p=n[l],z=p.length;if(z)for(let B=0,A,y;B<z;B++)if(y=p[B],g){if(g[y]){if(!m)if(c)c--;else if(f[k++]=y,k===b)return f;if(m||d)q[y]=1;r=true;}if(d&&(A=(h[y]||0)+1,h[y]=A,A<e)){const H=d[A-2]||(d[A-2]=[]);H[H.length]=y;}}else q[y]=1;}if(d)g||(h=q);else if(!r)return [];g=q;}if(d)for(let m=d.length-1,n,w;0<=m;m--){n=d[m];w=n.length;for(let q=0,r;q<w;q++)if(r=
		n[q],!g[r]){if(c)c--;else if(f[k++]=r,k===b)return f;g[r]=1;}}return f}function na(a,b){const c=v(),d=v(),e=[];for(let f=0;f<a.length;f++)c[a[f]]=1;for(let f=0,g;f<b.length;f++){g=b[f];for(let h=0,k;h<g.length;h++)k=g[h],c[k]&&!d[k]&&(d[k]=1,e[e.length]=k);}return e}function J(a){this.l=true!==a&&a;this.cache=v();this.h=[];}function oa(a,b,c){C(a)&&(a=a.query);let d=this.cache.get(a);d||(d=this.search(a,b,c),this.cache.set(a,d));return d}J.prototype.set=function(a,b){if(!this.cache[a]){var c=this.h.length;c===this.l?delete this.cache[this.h[c-1]]:c++;for(--c;0<c;c--)this.h[c]=this.h[c-1];this.h[0]=a;}this.cache[a]=b;};J.prototype.get=function(a){const b=this.cache[a];if(this.l&&b&&(a=this.h.indexOf(a))){const c=this.h[a-1];this.h[a-1]=this.h[a];this.h[a]=c;}return b};const qa={memory:{charset:"latin:extra",D:3,B:4,m:false},performance:{D:3,B:3,s:false,context:{depth:2,D:1}},match:{charset:"latin:extra",G:"reverse"},score:{charset:"latin:advanced",D:20,B:3,context:{depth:3,D:9}},"default":{}};function ra(a,b,c,d,e,f,g){setTimeout(function(){const h=a(c?c+"."+d:d,JSON.stringify(g));h&&h.then?h.then(function(){b.export(a,b,c,e,f+1);}):b.export(a,b,c,e,f+1);});}function K(a,b){if(!(this instanceof K))return new K(a);var c;if(a){x(a)?a=qa[a]:(c=a.preset)&&(a=Object.assign({},c[c],a));c=a.charset;var d=a.lang;x(c)&&(-1===c.indexOf(":")&&(c+=":default"),c=G[c]);x(d)&&(d=ka[d]);}else a={};let e,f,g=a.context||{};this.encode=a.encode||c&&c.encode||ia;this.register=b||v();this.D=e=a.resolution||9;this.G=b=c&&c.G||a.tokenize||"strict";this.depth="strict"===b&&g.depth;this.l=u(g.bidirectional);this.s=f=u(a.optimize);this.m=u(a.fastupdate);this.B=a.minlength||1;this.C=
		a.boost;this.map=f?aa(e):v();this.A=e=g.resolution||1;this.h=f?aa(e):v();this.F=c&&c.F||a.rtl;this.H=(b=a.matcher||d&&d.H)&&fa(b,false);this.J=(b=a.stemmer||d&&d.J)&&fa(b,true);if(c=b=a.filter||d&&d.filter){c=b;d=v();for(let h=0,k=c.length;h<k;h++)d[c[h]]=1;c=d;}this.filter=c;this.cache=(b=a.cache)&&new J(b);}t=K.prototype;t.append=function(a,b){return this.add(a,b,true)};
		t.add=function(a,b,c,d){if(b&&(a||0===a)){if(!d&&!c&&this.register[a])return this.update(a,b);b=this.encode(b);if(d=b.length){const m=v(),n=v(),w=this.depth,q=this.D;for(let r=0;r<d;r++){let l=b[this.F?d-1-r:r];var e=l.length;if(l&&e>=this.B&&(w||!n[l])){var f=L(q,d,r),g="";switch(this.G){case "full":if(2<e){for(f=0;f<e;f++)for(var h=e;h>f;h--)if(h-f>=this.B){var k=L(q,d,r,e,f);g=l.substring(f,h);M(this,n,g,k,a,c);}break}case "reverse":if(1<e){for(h=e-1;0<h;h--)g=l[h]+g,g.length>=this.B&&M(this,n,
		g,L(q,d,r,e,h),a,c);g="";}case "forward":if(1<e){for(h=0;h<e;h++)g+=l[h],g.length>=this.B&&M(this,n,g,f,a,c);break}default:if(this.C&&(f=Math.min(f/this.C(b,l,r)|0,q-1)),M(this,n,l,f,a,c),w&&1<d&&r<d-1)for(e=v(),g=this.A,f=l,h=Math.min(w+1,d-r),e[f]=1,k=1;k<h;k++)if((l=b[this.F?d-1-r-k:r+k])&&l.length>=this.B&&!e[l]){e[l]=1;const p=this.l&&l>f;M(this,m,p?f:l,L(g+(d/2>g?0:1),d,r,h-1,k-1),a,c,p?l:f);}}}}this.m||(this.register[a]=1);}}return this};
		function L(a,b,c,d,e){return c&&1<a?b+(d||0)<=a?c+(e||0):(a-1)/(b+(d||0))*(c+(e||0))+1|0:0}function M(a,b,c,d,e,f,g){let h=g?a.h:a.map;if(!b[c]||g&&!b[c][g])a.s&&(h=h[d]),g?(b=b[c]||(b[c]=v()),b[g]=1,h=h[g]||(h[g]=v())):b[c]=1,h=h[c]||(h[c]=[]),a.s||(h=h[d]||(h[d]=[])),f&&h.includes(e)||(h[h.length]=e,a.m&&(a=a.register[e]||(a.register[e]=[]),a[a.length]=h));}
		t.search=function(a,b,c){c||(!b&&C(a)?(c=a,a=c.query):C(b)&&(c=b));let d=[],e;let f,g=0;if(c){a=c.query||a;b=c.limit;g=c.offset||0;var h=c.context;f=c.suggest;}if(a&&(a=this.encode(""+a),e=a.length,1<e)){c=v();var k=[];for(let n=0,w=0,q;n<e;n++)if((q=a[n])&&q.length>=this.B&&!c[q])if(this.s||f||this.map[q])k[w++]=q,c[q]=1;else return d;a=k;e=a.length;}if(!e)return d;b||(b=100);h=this.depth&&1<e&&false!==h;c=0;let m;h?(m=a[0],c=1):1<e&&a.sort(ba);for(let n,w;c<e;c++){w=a[c];h?(n=sa(this,d,f,b,g,2===e,w,
		m),f&&false===n&&d.length||(m=w)):n=sa(this,d,f,b,g,1===e,w);if(n)return n;if(f&&c===e-1){k=d.length;if(!k){if(h){h=0;c=-1;continue}return d}if(1===k)return ta(d[0],b,g)}}return ma(d,b,g,f)};
		function sa(a,b,c,d,e,f,g,h){let k=[],m=h?a.h:a.map;a.s||(m=ua(m,g,h,a.l));if(m){let n=0;const w=Math.min(m.length,h?a.A:a.D);for(let q=0,r=0,l,p;q<w;q++)if(l=m[q])if(a.s&&(l=ua(l,g,h,a.l)),e&&l&&f&&(p=l.length,p<=e?(e-=p,l=null):(l=l.slice(e),e=0)),l&&(k[n++]=l,f&&(r+=l.length,r>=d)))break;if(n){if(f)return ta(k,d,0);b[b.length]=k;return}}return !c&&k}function ta(a,b,c){a=1===a.length?a[0]:[].concat.apply([],a);return c||a.length>b?a.slice(c,c+b):a}
		function ua(a,b,c,d){c?(d=d&&b>c,a=(a=a[d?b:c])&&a[d?c:b]):a=a[b];return a}t.contain=function(a){return !!this.register[a]};t.update=function(a,b){return this.remove(a).add(a,b)};
		t.remove=function(a,b){const c=this.register[a];if(c){if(this.m)for(let d=0,e;d<c.length;d++)e=c[d],e.splice(e.indexOf(a),1);else N(this.map,a,this.D,this.s),this.depth&&N(this.h,a,this.A,this.s);b||delete this.register[a];if(this.cache){b=this.cache;for(let d=0,e,f;d<b.h.length;d++)f=b.h[d],e=b.cache[f],e.includes(a)&&(b.h.splice(d--,1),delete b.cache[f]);}}return this};
		function N(a,b,c,d,e){let f=0;if(a.constructor===Array)if(e)b=a.indexOf(b),-1!==b?1<a.length&&(a.splice(b,1),f++):f++;else {e=Math.min(a.length,c);for(let g=0,h;g<e;g++)if(h=a[g])f=N(h,b,c,d,e),d||f||delete a[g];}else for(let g in a)(f=N(a[g],b,c,d,e))||delete a[g];return f}t.searchCache=oa;
		t.export=function(a,b,c,d,e){let f,g;switch(e||(e=0)){case 0:f="reg";if(this.m){g=v();for(let h in this.register)g[h]=1;}else g=this.register;break;case 1:f="cfg";g={doc:0,opt:this.s?1:0};break;case 2:f="map";g=this.map;break;case 3:f="ctx";g=this.h;break;default:return}ra(a,b||this,c,f,d,e,g);return  true};t.import=function(a,b){if(b)switch(x(b)&&(b=JSON.parse(b)),a){case "cfg":this.s=!!b.opt;break;case "reg":this.m=false;this.register=b;break;case "map":this.map=b;break;case "ctx":this.h=b;}};la(K.prototype);function va(a){a=a.data;var b=self._index;const c=a.args;var d=a.task;switch(d){case "init":d=a.options||{};a=a.factory;b=d.encode;d.cache=false;b&&0===b.indexOf("function")&&(d.encode=Function("return "+b)());a?(Function("return "+a)()(self),self._index=new self.FlexSearch.Index(d),delete self.FlexSearch):self._index=new K(d);break;default:a=a.id,b=b[d].apply(b,c),postMessage("search"===d?{id:a,msg:b}:{id:a});}}let wa=0;function O(a){if(!(this instanceof O))return new O(a);var b;a?D(b=a.encode)&&(a.encode=b.toString()):a={};(b=(self||window)._factory)&&(b=b.toString());const c="undefined"===typeof window&&self.exports,d=this;this.o=xa(b,c,a.worker);this.h=v();if(this.o){if(c)this.o.on("message",function(e){d.h[e.id](e.msg);delete d.h[e.id];});else this.o.onmessage=function(e){e=e.data;d.h[e.id](e.msg);delete d.h[e.id];};this.o.postMessage({task:"init",factory:b,options:a});}}P("add");P("append");P("search");
		P("update");P("remove");function P(a){O.prototype[a]=O.prototype[a+"Async"]=function(){const b=this,c=[].slice.call(arguments);var d=c[c.length-1];let e;D(d)&&(e=d,c.splice(c.length-1,1));d=new Promise(function(f){setTimeout(function(){b.h[++wa]=f;b.o.postMessage({task:a,id:wa,args:c});});});return e?(d.then(e),this):d};}
		function xa(a,b,c){let d;try{d=b?eval('new (require("worker_threads")["Worker"])("../dist/node/node.js")'):a?new Worker(URL.createObjectURL(new Blob(["onmessage="+va.toString()],{type:"text/javascript"}))):new Worker(x(c)?c:"worker/worker.js",{type:"module"});}catch(e){}return d}function Q(a){if(!(this instanceof Q))return new Q(a);var b=a.document||a.doc||a,c;this.K=[];this.h=[];this.A=[];this.register=v();this.key=(c=b.key||b.id)&&S(c,this.A)||"id";this.m=u(a.fastupdate);this.C=(c=b.store)&&true!==c&&[];this.store=c&&v();this.I=(c=b.tag)&&S(c,this.A);this.l=c&&v();this.cache=(c=a.cache)&&new J(c);a.cache=false;this.o=a.worker;this.async=false;c=v();let d=b.index||b.field||b;x(d)&&(d=[d]);for(let e=0,f,g;e<d.length;e++)f=d[e],x(f)||(g=f,f=f.field),g=C(g)?Object.assign({},a,g):a,
		this.o&&(c[f]=new O(g),c[f].o||(this.o=false)),this.o||(c[f]=new K(g,this.register)),this.K[e]=S(f,this.A),this.h[e]=f;if(this.C)for(a=b.store,x(a)&&(a=[a]),b=0;b<a.length;b++)this.C[b]=S(a[b],this.A);this.index=c;}function S(a,b){const c=a.split(":");let d=0;for(let e=0;e<c.length;e++)a=c[e],0<=a.indexOf("[]")&&(a=a.substring(0,a.length-2))&&(b[d]=true),a&&(c[d++]=a);d<c.length&&(c.length=d);return 1<d?c:c[0]}function T(a,b){if(x(b))a=a[b];else for(let c=0;a&&c<b.length;c++)a=a[b[c]];return a}
		function U(a,b,c,d,e){a=a[e];if(d===c.length-1)b[e]=a;else if(a)if(a.constructor===Array)for(b=b[e]=Array(a.length),e=0;e<a.length;e++)U(a,b,c,d,e);else b=b[e]||(b[e]=v()),e=c[++d],U(a,b,c,d,e);}function V(a,b,c,d,e,f,g,h){if(a=a[g])if(d===b.length-1){if(a.constructor===Array){if(c[d]){for(b=0;b<a.length;b++)e.add(f,a[b],true,true);return}a=a.join(" ");}e.add(f,a,h,true);}else if(a.constructor===Array)for(g=0;g<a.length;g++)V(a,b,c,d,e,f,g,h);else g=b[++d],V(a,b,c,d,e,f,g,h);}t=Q.prototype;
		t.add=function(a,b,c){C(a)&&(b=a,a=T(b,this.key));if(b&&(a||0===a)){if(!c&&this.register[a])return this.update(a,b);for(let d=0,e,f;d<this.h.length;d++)f=this.h[d],e=this.K[d],x(e)&&(e=[e]),V(b,e,this.A,0,this.index[f],a,e[0],c);if(this.I){let d=T(b,this.I),e=v();x(d)&&(d=[d]);for(let f=0,g,h;f<d.length;f++)if(g=d[f],!e[g]&&(e[g]=1,h=this.l[g]||(this.l[g]=[]),!c||!h.includes(a)))if(h[h.length]=a,this.m){const k=this.register[a]||(this.register[a]=[]);k[k.length]=h;}}if(this.store&&(!c||!this.store[a])){let d;
		if(this.C){d=v();for(let e=0,f;e<this.C.length;e++)f=this.C[e],x(f)?d[f]=b[f]:U(b,d,f,0,f[0]);}this.store[a]=d||b;}}return this};t.append=function(a,b){return this.add(a,b,true)};t.update=function(a,b){return this.remove(a).add(a,b)};
		t.remove=function(a){C(a)&&(a=T(a,this.key));if(this.register[a]){for(var b=0;b<this.h.length&&(this.index[this.h[b]].remove(a,!this.o),!this.m);b++);if(this.I&&!this.m)for(let c in this.l){b=this.l[c];const d=b.indexOf(a);-1!==d&&(1<b.length?b.splice(d,1):delete this.l[c]);}this.store&&delete this.store[a];delete this.register[a];}return this};
		t.search=function(a,b,c,d){c||(!b&&C(a)?(c=a,a=""):C(b)&&(c=b,b=0));let e=[],f=[],g,h,k,m,n,w,q=0;if(c)if(c.constructor===Array)k=c,c=null;else {a=c.query||a;k=(g=c.pluck)||c.index||c.field;m=c.tag;h=this.store&&c.enrich;n="and"===c.bool;b=c.limit||b||100;w=c.offset||0;if(m&&(x(m)&&(m=[m]),!a)){for(let l=0,p;l<m.length;l++)if(p=ya.call(this,m[l],b,w,h))e[e.length]=p,q++;return q?e:[]}x(k)&&(k=[k]);}k||(k=this.h);n=n&&(1<k.length||m&&1<m.length);const r=!d&&(this.o||this.async)&&[];for(let l=0,p,z,B;l<
		k.length;l++){let A;z=k[l];x(z)||(A=z,z=A.field,a=A.query||a,b=A.limit||b);if(r)r[l]=this.index[z].searchAsync(a,b,A||c);else {d?p=d[l]:p=this.index[z].search(a,b,A||c);B=p&&p.length;if(m&&B){const y=[];let H=0;n&&(y[0]=[p]);for(let X=0,pa,R;X<m.length;X++)if(pa=m[X],B=(R=this.l[pa])&&R.length)H++,y[y.length]=n?[R]:R;H&&(p=n?ma(y,b||100,w||0):na(p,y),B=p.length);}if(B)f[q]=z,e[q++]=p;else if(n)return []}}if(r){const l=this;return new Promise(function(p){Promise.all(r).then(function(z){p(l.search(a,b,
		c,z));});})}if(!q)return [];if(g&&(!h||!this.store))return e[0];for(let l=0,p;l<f.length;l++){p=e[l];p.length&&h&&(p=za.call(this,p));if(g)return p;e[l]={field:f[l],result:p};}return e};function ya(a,b,c,d){let e=this.l[a],f=e&&e.length-c;if(f&&0<f){if(f>b||c)e=e.slice(c,c+b);d&&(e=za.call(this,e));return {tag:a,result:e}}}function za(a){const b=Array(a.length);for(let c=0,d;c<a.length;c++)d=a[c],b[c]={id:d,doc:this.store[d]};return b}t.contain=function(a){return !!this.register[a]};t.get=function(a){return this.store[a]};
		t.set=function(a,b){this.store[a]=b;return this};t.searchCache=oa;t.export=function(a,b,c,d,e){e||(e=0);d||(d=0);if(d<this.h.length){const f=this.h[d],g=this.index[f];b=this;setTimeout(function(){g.export(a,b,e?f:"",d,e++)||(d++,e=1,b.export(a,b,f,d,e));});}else {let f,g;switch(e){case 1:f="tag";g=this.l;break;case 2:f="store";g=this.store;break;default:return}ra(a,this,c,f,d,e,g);}};
		t.import=function(a,b){if(b)switch(x(b)&&(b=JSON.parse(b)),a){case "tag":this.l=b;break;case "reg":this.m=false;this.register=b;for(let d=0,e;d<this.h.length;d++)e=this.index[this.h[d]],e.register=b,e.m=false;break;case "store":this.store=b;break;default:a=a.split(".");const c=a[0];a=a[1];c&&a&&this.index[c].import(a,b);}};la(Q.prototype);var Ba={encode:Aa,F:false,G:""};const Ca=[F("[\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5]"),"a",F("[\u00e8\u00e9\u00ea\u00eb]"),"e",F("[\u00ec\u00ed\u00ee\u00ef]"),"i",F("[\u00f2\u00f3\u00f4\u00f5\u00f6\u0151]"),"o",F("[\u00f9\u00fa\u00fb\u00fc\u0171]"),"u",F("[\u00fd\u0177\u00ff]"),"y",F("\u00f1"),"n",F("[\u00e7c]"),"k",F("\u00df"),"s",F(" & ")," and "];function Aa(a){var b=a=""+a;b.normalize&&(b=b.normalize("NFD").replace(ea,""));return ca.call(this,b.toLowerCase(),!a.normalize&&Ca)}var Ea={encode:Da,F:false,G:"strict"};const Fa=/[^a-z0-9]+/,Ga={b:"p",v:"f",w:"f",z:"s",x:"s","\u00df":"s",d:"t",n:"m",c:"k",g:"k",j:"k",q:"k",i:"e",y:"e",u:"o"};function Da(a){a=Aa.call(this,a).join(" ");const b=[];if(a){const c=a.split(Fa),d=c.length;for(let e=0,f,g=0;e<d;e++)if((a=c[e])&&(!this.filter||!this.filter[a])){f=a[0];let h=Ga[f]||f,k=h;for(let m=1;m<a.length;m++){f=a[m];const n=Ga[f]||f;n&&n!==k&&(h+=n,k=n);}b[g++]=h;}}return b}var Ia={encode:Ha,F:false,G:""};const Ja=[F("ae"),"a",F("oe"),"o",F("sh"),"s",F("th"),"t",F("ph"),"f",F("pf"),"f",F("(?![aeo])h(?![aeo])"),"",F("(?!^[aeo])h(?!^[aeo])"),""];function Ha(a,b){a&&(a=Da.call(this,a).join(" "),2<a.length&&(a=E(a,Ja)),b||(1<a.length&&(a=ha(a)),a&&(a=a.split(" "))));return a||[]}var La={encode:Ka,F:false,G:""};const Ma=F("(?!\\b)[aeo]");function Ka(a){a&&(a=Ha.call(this,a,true),1<a.length&&(a=a.replace(Ma,"")),1<a.length&&(a=ha(a)),a&&(a=a.split(" ")));return a||[]}G["latin:default"]=ja;G["latin:simple"]=Ba;G["latin:balance"]=Ea;G["latin:advanced"]=Ia;G["latin:extra"]=La;const W=self;let Y;const Z={Index:K,Document:Q,Worker:O,registerCharset:function(a,b){G[a]=b;},registerLanguage:function(a,b){ka[a]=b;}};(Y=W.define)&&Y.amd?Y([],function(){return Z}):W.exports?W.exports=Z:W.FlexSearch=Z;}(flexsearch_bundle)); 
	} (flexsearch_bundle$1));
	return flexsearch_bundle$1.exports;
}

var flexsearch_bundleExports = requireFlexsearch_bundle();
var FlexSearchLib = /*@__PURE__*/getDefaultExportFromCjs(flexsearch_bundleExports);

/*!
 * GeoLeaf Core – Search / IndexEngine
 * © 2026 Mattieu Pottier — MIT License
 */
/**
 * @module search/index-engine
 *
 * Defines the `ISearchEngine` interface and its two implementations:
 * - `FlexSearchEngine` – fast prefix-indexed full-text search via FlexSearch v0.7.
 * - `NativeEngine`     – stub that always returns `isReady() = false`, triggering
 *   the legacy `String.prototype.includes()` fallback in the filter layer.
 *
 * Security:
 * - User query strings are sanitized via `_sanitizeQueryInput()` before being
 *   forwarded to FlexSearch (control-char stripping, max 200 chars).
 * - Document fields are indexed as-is; they are already sanitized at POI
 *   ingestion time via `Security.sanitizePoiProperties()`.
 */
// FlexSearch v0.7.31 – CJS/ESM dual package.
// The bundled flexsearch package ships v0.6 typings; we use `any` to avoid
// a false TS2339 ("Property 'Document' does not exist") caused by the mismatch
// between the package's self-referencing .d.ts and the @types/flexsearch v0.7 stubs.
const FlexSearch = FlexSearchLib;
// ── Constants ────────────────────────────────────────────────────────────────
/** Maximum length of a user-supplied query string. Longer inputs are silently truncated. */
const MAX_QUERY_LENGTH = 200;
// ── Security helper ──────────────────────────────────────────────────────────
/**
 * Strips control characters and truncates the input to `MAX_QUERY_LENGTH`.
 * Does NOT HTML-encode: the result stays a plain string for text matching.
 * @internal
 */
function _sanitizeQueryInput(raw) {
    if (typeof raw !== "string")
        return "";
    return raw.replace(/[\x00-\x1F\x7F]/g, "").slice(0, MAX_QUERY_LENGTH);
}
// ── FlexSearchEngine ─────────────────────────────────────────────────────────
/**
 * Full-text search engine backed by FlexSearch v0.7 `Document` index.
 *
 * Configuration:
 * - `tokenize: "forward"` — prefix matching ("rando" matches "randonnée").
 * - Fields: single virtual `text` field (pre-concatenated by the registry).
 * - Encoder: `"advanced"` — full diacritics/accent normalization (é→e, ê→e…).
 */
class FlexSearchEngine {
    _index = null;
    _ready = false;
    isReady() {
        return this._ready;
    }
    build(docs) {
        this._index = new FlexSearch.Document({
            tokenize: "forward",
            encoder: "advanced",
            document: {
                id: "id",
                index: ["text"],
            },
        });
        for (const doc of docs) {
            this._index.add(doc);
        }
        this._ready = true;
    }
    query(text) {
        if (!this._ready || !this._index)
            return new Set();
        const sanitized = _sanitizeQueryInput(text);
        if (!sanitized)
            return new Set();
        const results = this._index.search(sanitized, { limit: 5000 });
        const ids = new Set();
        for (const field of results) {
            for (const id of field.result) {
                ids.add(String(id));
            }
        }
        return ids;
    }
    add(doc) {
        if (!this._ready || !this._index)
            return;
        this._index.add(doc);
    }
    remove(id) {
        if (!this._ready || !this._index)
            return;
        this._index.remove(id);
    }
    clear() {
        this._index = null;
        this._ready = false;
    }
}
// ── NativeEngine ─────────────────────────────────────────────────────────────
/**
 * Stub engine that is always in a "not ready" state.
 * When this engine is active, `SearchRegistry.isReady()` returns `false` and
 * the filter layer falls back to the legacy `String.prototype.includes()` scan.
 */
class NativeEngine {
    isReady() {
        return false;
    }
    build(_docs) {
        /* no-op */
    }
    query(_text) {
        return new Set();
    }
    add(_doc) {
        /* no-op */
    }
    remove(_id) {
        /* no-op */
    }
    clear() {
        /* no-op */
    }
}

/*!
 * GeoLeaf Core – Search / SearchRegistry
 * © 2026 Mattieu Pottier — MIT License
 */
/**
 * @module search/search-registry
 *
 * Singleton registry that manages the active search engine instance.
 *
 * Lifecycle:
 * 1. `SearchRegistry.init()` is called by the lazy `search` module at load time.
 * 2. It reads `profile.search.engine` to pick `FlexSearchEngine` or `NativeEngine`.
 * 3. It subscribes to `geoleaf:poi:loaded`, `geoleaf:poi:added`, `geoleaf:poi:removed`
 *    events to keep the index in sync.
 * 4. `poi-filter.ts` and `route-filter.ts` call `SearchRegistry.query()` at filter time.
 *    When the engine is not ready they fall back to the `includes()` scan.
 *
 * Security:
 * - POI data reaching `build()` / `add()` is already sanitized by
 *   `Security.sanitizePoiProperties()` at ingestion time (in `poi/core.ts`).
 * - IDs returned by the engine are normalised to `String` before Set insertion
 *   to prevent object-injection if FlexSearch ever returns numeric IDs.
 * - Prototype-pollution guard: ID lookup uses strict `===` comparison, never
 *   dynamic object key access.
 */
// ── Globals accessor ─────────────────────────────────────────────────────────
const _g$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
// ── Internal helpers ─────────────────────────────────────────────────────────
/**
 * Returns the `search.engine` value from the active profile, or `"native"`.
 * @internal
 */
function _getConfiguredEngine() {
    try {
        const profile = _g$1.GeoLeaf?.Config?.getActiveProfile?.();
        return (profile?.search?.engine ?? profile?.searchConfig?.engine ?? "native");
    }
    catch {
        return "native";
    }
}
/**
 * Extracts current search fields from profile, falling back to defaults.
 * @internal
 */
function _getSearchFields() {
    try {
        const profile = _g$1.GeoLeaf?.Config?.getActiveProfile?.();
        const layout = profile?.panels?.detail?.layout;
        if (Array.isArray(layout)) {
            const fields = layout
                .filter((item) => item.search === true && item.field)
                .map((item) => item.field);
            if (fields.length > 0)
                return fields;
        }
        const searchFilter = profile?.panels?.search?.filters?.find((f) => f.type === "search");
        if (Array.isArray(searchFilter?.searchFields) && searchFilter.searchFields.length > 0) {
            return searchFilter.searchFields;
        }
    }
    catch {
        /* ignore */
    }
    return ["title", "label", "name"];
}
/**
 * Builds the flat text string to index for a single POI.
 * Concatenates all searchable field values into a single space-separated string.
 * @internal
 */
function _buildDocumentText(poi, fields) {
    const parts = [];
    for (const fieldPath of fields) {
        const segments = fieldPath.split(".");
        let val = poi;
        for (const seg of segments) {
            // Prototype-pollution guard: ignore __proto__ / constructor keys
            if (seg === "__proto__" || seg === "constructor" || seg === "prototype") {
                val = undefined;
                break;
            }
            val = val != null ? val[seg] : undefined;
        }
        if (val == null)
            continue;
        if (Array.isArray(val)) {
            parts.push(...val.map((v) => String(v)));
        }
        else {
            parts.push(String(val));
        }
    }
    return parts.join(" ");
}
/**
 * Converts a single POI object into a `SearchDocument`.
 * @internal
 */
function _buildDocument(poi, fields) {
    const id = String(poi.id ?? poi._id ?? poi.properties?.id ?? "");
    if (!id)
        return null;
    return { id, text: _buildDocumentText(poi, fields) };
}
// ── Event handlers ────────────────────────────────────────────────────────────
function _onPoiLoaded() {
    try {
        const allPois = _g$1.GeoLeaf?.POI?.getAllPois?.() ?? [];
        SearchRegistry.build(allPois);
        Log?.debug(`[Search] Index built on poi:loaded – ${allPois.length} POI(s).`);
    }
    catch (err) {
        Log?.warn("[Search] _onPoiLoaded error:", err);
    }
}
function _onPoiAdded(event) {
    try {
        const poiId = event.detail?.poiId;
        if (!poiId)
            return;
        const poi = _g$1.GeoLeaf?.POI?.getPoiById?.(poiId);
        if (!poi)
            return;
        const fields = _getSearchFields();
        const doc = _buildDocument(poi, fields);
        if (doc) {
            SearchRegistry.getEngine().add(doc);
            Log?.debug(`[Search] Incremental add: ${poiId}`);
        }
    }
    catch (err) {
        Log?.warn("[Search] _onPoiAdded error:", err);
    }
}
function _onPoiRemoved(event) {
    try {
        const poiId = event.detail?.poiId;
        if (!poiId)
            return;
        SearchRegistry.getEngine().remove(String(poiId));
        Log?.debug(`[Search] Incremental remove: ${poiId}`);
    }
    catch (err) {
        Log?.warn("[Search] _onPoiRemoved error:", err);
    }
}
// ── Registry ─────────────────────────────────────────────────────────────────
/**
 * Singleton search registry.
 * Exposed as `GeoLeaf.Search` via `geoleaf.search.ts`.
 */
const SearchRegistry = {
    _engine: null,
    _initialized: false,
    /** Returns the active engine instance (creates `NativeEngine` lazily if needed). */
    getEngine() {
        if (!this._engine)
            this._engine = new NativeEngine();
        return this._engine;
    },
    /** Returns `true` when the index has been built and is ready to serve queries. */
    isReady() {
        return this.getEngine().isReady();
    },
    /**
     * Builds the search index from an array of POI objects.
     * Re-entrant: calling again replaces the existing index.
     */
    build(pois) {
        const fields = _getSearchFields();
        const docs = [];
        for (const poi of pois) {
            const doc = _buildDocument(poi, fields);
            if (doc)
                docs.push(doc);
        }
        this.getEngine().build(docs);
    },
    /**
     * Queries the index and returns a `Set` of matching POI IDs (strings).
     * Returns an empty `Set` when the engine is not ready.
     */
    query(text) {
        return this.getEngine().query(text);
    },
    /**
     * Clears the index.
     * Called on profile change or full POI reload.
     */
    clear() {
        this.getEngine().clear();
    },
    /**
     * Initialises the registry:
     * 1. Picks the engine from profile config.
     * 2. Registers DOM event listeners for incremental updates.
     * 3. Triggers an immediate build if POIs are already loaded.
     *
     * Safe to call multiple times — subsequent calls are no-ops.
     */
    init() {
        if (this._initialized)
            return;
        this._initialized = true;
        const engineName = _getConfiguredEngine();
        this._engine = engineName === "flexsearch" ? new FlexSearchEngine() : new NativeEngine();
        if (typeof document === "undefined")
            return;
        document.addEventListener("geoleaf:poi:loaded", _onPoiLoaded);
        document.addEventListener("geoleaf:poi:added", _onPoiAdded);
        document.addEventListener("geoleaf:poi:removed", _onPoiRemoved);
        // Boot guard: build immediately if POIs already present
        const existing = _g$1.GeoLeaf?.POI?.getAllPois?.() ?? [];
        if (existing.length > 0 && engineName === "flexsearch") {
            this.build(existing);
            Log?.debug(`[Search] Boot build – ${existing.length} POI(s) indexed.`);
        }
        Log?.info(`[Search] SearchRegistry initialised (engine: ${engineName}).`);
    },
    /** Resets the registry (useful for tests and profile switches). */
    reset() {
        if (typeof document !== "undefined") {
            document.removeEventListener("geoleaf:poi:loaded", _onPoiLoaded);
            document.removeEventListener("geoleaf:poi:added", _onPoiAdded);
            document.removeEventListener("geoleaf:poi:removed", _onPoiRemoved);
        }
        this._engine = null;
        this._initialized = false;
    },
};

/*!
 * GeoLeaf Core – Search / Public Facade
 * © 2026 Mattieu Pottier — MIT License
 */
/**
 * @module geoleaf.search
 *
 * Public facade for the GeoLeaf Search module.
 * Exposes `GeoLeaf.Search` on the global namespace and provides named ESM exports.
 *
 * @example
 * // Check if FlexSearch index is ready
 * if (GeoLeaf.Search.isReady()) {
 *   const ids = GeoLeaf.Search.query("randonnée");
 * }
 *
 * @example
 * // Manually trigger a re-build (e.g. after bulk POI update)
 * GeoLeaf.Search.build(GeoLeaf.POI.getAllPois());
 *
 * @see {@link ./optional/search/search-registry.ts} for the search engine implementation
 */
const _g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
/**
 * Public Search namespace.
 * Available as `GeoLeaf.Search` after the lazy `search` module is loaded.
 */
const Search = {
    /**
     * Returns `true` when the FlexSearch index has been built and is ready.
     * Returns `false` when engine is `"native"` (uses `includes()` fallback).
     */
    isReady: () => SearchRegistry.isReady(),
    /**
     * Queries the index and returns a `Set` of matching POI IDs.
     * Returns an empty `Set` when not ready.
     * @param text - User search input.
     */
    query: (text) => SearchRegistry.query(text),
    /**
     * Manually builds (or rebuilds) the search index from a POI array.
     * Normally called automatically on `geoleaf:poi:loaded`.
     * @param pois - Array of normalized POI objects.
     */
    build: (pois) => SearchRegistry.build(pois),
    /**
     * Returns the name of the active engine: `"flexsearch"` or `"native"`.
     */
    getEngine: () => (SearchRegistry.isReady() ? "flexsearch" : "native"),
    /**
     * Clears the index (e.g. on profile switch).
     */
    clear: () => SearchRegistry.clear(),
};
// Assign on global GeoLeaf namespace for CDN / UMD consumers
if (_g.GeoLeaf) {
    _g.GeoLeaf.Search = Search;
}
// Trigger init at module load time (lazy chunk loading order guarantees the
// profile config is available at this point).
SearchRegistry.init();

/**
 * GeoLeaf lazy chunk — Search (FlexSearch engine + public facade).
 * Loaded on demand when `profile.search.engine === "flexsearch"`.
 *
 * Import order: registry first, then facade (which calls SearchRegistry.init()).
 */

var search = /*#__PURE__*/Object.freeze({
	__proto__: null
});

export { Search as S, search as s };
//# sourceMappingURL=geoleaf-search-D-b170Ii.js.map
