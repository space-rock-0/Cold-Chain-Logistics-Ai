import assert from 'node:assert/strict';
const base = 'http://localhost:3000';
async function json(path, options={}) {
 const res=await fetch(base+path, options);
 assert.ok(res.ok, `${path}: ${res.status}`);
 return [await res.json(),res];
}
const [login,res]=await json('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@coldchain.com',password:'admin123'})});
assert.equal(login.user.role,'ADMIN');
const cookie=res.headers.get('set-cookie').split(';')[0];
const [me]=await json('/api/auth/me',{headers:{cookie}}); assert.equal(me.user.role,'ADMIN');
const [list]=await json('/api/shipments/',{headers:{cookie}}); assert.ok(list.total>=85);
const headers={'Content-Type':'application/json',cookie};
const [created]=await json('/api/shipments/create',{method:'POST',headers,body:JSON.stringify({origin:'Local test',destination:'Delhi',temperature:4})});
try {
 await json(`/api/shipments/${created.id}/edit`,{method:'PATCH',headers,body:JSON.stringify({temperature:6,progress:50})});
 const [updated]=await json('/api/shipments/',{headers:{cookie}});
 assert.equal(updated.shipments.find(s=>s.id===created.id).temperature,6);
} finally { await json(`/api/shipments/${created.id}/delete`,{method:'DELETE',headers}); }
const invalid=await fetch(base+'/api/auth/login',{method:'POST',headers,body:JSON.stringify({email:'admin@coldchain.com',password:'wrong'})}); assert.equal(invalid.status,401);
const ml=await fetch('http://127.0.0.1:5000/ml/predict/spoilage',{method:'POST',headers,body:JSON.stringify({temperature:4})}); assert.ok(ml.ok);
console.log('PASS: login, identity, invalid password, shipments, create/edit/delete persistence, ML endpoint');
