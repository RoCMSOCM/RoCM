
var Pi=Math.PI; var PiD2=Pi/2; var PiD4=Pi/4; var Pi2=2*Pi
var e=2.718281828459045235; var e10 = 1.105170918075647625
var Deg=180/Pi

function ChiSq(x,n) {
    if(x>1000 | n>1000) { var q=Norm((Math.pow(x/n,1/3)+2/(9*n)-1)/Math.sqrt(2/(9*n)))/2; if (x>n) {return q}{return 1-q} }
    var p=Math.exp(-0.5*x); if((n%2)==1) { p=p*Math.sqrt(2*x/Pi) }
    var k=n; while(k>=2) { p=p*x/k; k=k-2 }
    var t=p; var a=n; while(t>1e-15*p) { a=a+2; t=t*x/a; p=p+t }
    return 1-p
    }
function Norm(z) { var q=z*z
    if(Math.abs(z)>7) {return (1-1/q+3/(q*q))*Math.exp(-q/2)/(Math.abs(z)*Math.sqrt(PiD2))} {return ChiSq(q,1) }
    }
function StudT(t,n) {
    t=Math.abs(t); var w=t/Math.sqrt(n); var th=Math.atan(w)
    if(n==1) { return 1-th/PiD2 }
    var sth=Math.sin(th); var cth=Math.cos(th)
    if((n%2)==1)
        { return 1-(th+sth*cth*StatCom(cth*cth,2,n-3,-1))/PiD2 }
        else
        { return 1-sth*StatCom(cth*cth,1,n-3,-1) }
    }
function FishF(f,n1,n2) {
    var x=n2/(n1*f+n2)
    if((n1%2)==0) { return StatCom(1-x,n2,n1+n2-4,n2-2)*Math.pow(x,n2/2) }
    if((n2%2)==0){ return 1-StatCom(x,n1,n1+n2-4,n1-2)*Math.pow(1-x,n1/2) }
    var th=Math.atan(Math.sqrt(n1*f/n2)); var a=th/PiD2; var sth=Math.sin(th); var cth=Math.cos(th)
    if(n2>1) { a=a+sth*cth*StatCom(cth*cth,2,n2-3,-1)/PiD2 }
    if(n1==1) { return 1-a }
    var c=4*StatCom(sth*sth,n2+1,n1+n2-4,n2-2)*sth*Math.pow(cth,n2)/Pi
    if(n2==1) { return 1-a+c/2 }
    var k=2; while(k<=(n2-1)/2) {c=c*k/(k-.5); k=k+1 }
    return 1-a+c
    }
function StatCom(q,i,j,b) {
    var zz=1; var z=zz; var k=i; while(k<=j) { zz=zz*q*k/(k-b); z=z+zz; k=k+2 }
    return z
    }
function ANorm(p) { var v=0.5; var dv=0.5; var z=0
    while(dv>1e-6) { z=1/v-1; dv=dv/2; if(Norm(z)>p) { v=v-dv } else { v=v+dv } }
    return z
    }
function AChiSq(p,n) { var v=0.5; var dv=0.5; var x=0
    while(dv>1e-10) { x=1/v-1; dv=dv/2; if(ChiSq(x,n)>p) { v=v-dv } else { v=v+dv } }
    return x
    }
function AStudT(p,n) { var v=0.5; var dv=0.5; var t=0
    while(dv>1e-6) { t=1/v-1; dv=dv/2; if(StudT(t,n)>p) { v=v-dv } else { v=v+dv } }
    return t
    }
function AFishF(p,n1,n2) { var v=0.5; var dv=0.5; var f=0
    while(dv>1e-10) { f=1/v-1; dv=dv/2; if(FishF(f,n1,n2)>p) { v=v-dv } else { v=v+dv } }
    return f
    }

function CalcN(form) { form.pn.value=Fmt(Norm(eval(form.z.value))) }
function CalcNr(form) { form.z.value=Fmt(ANorm(eval(form.pn.value))) }
function CalcT(form) { form.pt.value=Fmt(StudT(eval(form.t.value),eval(form.nt.value))) }
function CalcTr(form) { form.t.value=Fmt(AStudT(eval(form.pt.value),eval(form.nt.value))) }
function CalcX(form) { form.px.value=Fmt(ChiSq(eval(form.x.value),eval(form.nx.value))) }
function CalcXr(form) { form.x.value=Fmt(AChiSq(eval(form.px.value),eval(form.nx.value))) }
function CalcF(form) { form.pf.value=Fmt(FishF(eval(form.f.value),eval(form.n1.value),eval(form.n2.value))) }
function CalcFr(form) { form.f.value=Fmt(AFishF(eval(form.pf.value),eval(form.n1.value),eval(form.n2.value))) }

function Fmt(x) { 
var v
if(x>=0) { v=''+(x+0.00005) } else { v=''+(x-0.00005) }
return v.substring(0,v.indexOf('.')+5)
}
