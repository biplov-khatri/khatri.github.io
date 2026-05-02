var selectedTemplate = 1;
var FILENAME = 'Nepal-Festival-Expo-2026.png';
var ed = {canvas:null,ctx:null,userImg:null,tplImg:null,x:0,y:0,scale:1,rotation:0,dragging:false,lx:0,ly:0,pinchDist:0,ratio:1};

function showToast(msg,type){
    var c=document.getElementById('toast-container');if(!c)return;
    var t=document.createElement('div');
    t.className='toast toast-'+(type||'info');t.textContent=msg;
    c.appendChild(t);
    requestAnimationFrame(function(){t.classList.add('toast-show');});
    setTimeout(function(){t.classList.remove('toast-show');setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},400);},3500);
}

function setStep(n){
    for(var i=1;i<=3;i++){
        var s=document.getElementById('step-'+i);
        if(s){s.classList.toggle('active',i<=n);s.classList.toggle('done',i<n);}
        var l=document.getElementById('line-'+i);
        if(l)l.classList.toggle('done',i<n);
    }
}

window.addEventListener('DOMContentLoaded',function(){
    // ── Auto-detect which frame images actually exist ──
    // Detection is based on template{n}.png (the overlay). If plain{n}.png also exists it
    // is used as the thumbnail; otherwise template{n}.png itself serves as thumbnail.
    var options=Array.from(document.querySelectorAll('.template-option'));
    var checked=0,available=[];

    function setThumb(n,src){
        var img=document.getElementById('thumb-'+n);
        if(img)img.src=src;
    }

    function probeThumb(n,overlayReady){
        // Try plain{n}.png first for the thumbnail
        var p=new Image();
        p.onload=function(){setThumb(n,'templates/plain'+n+'.png');overlayReady();};
        p.onerror=function(){setThumb(n,'templates/template'+n+'.png');overlayReady();};
        p.src='templates/plain'+n+'.png';
    }

    function initPage(avail){
        var section=document.getElementById('section-frames');
        if(avail.length===0){
            // No frames at all — hide selection section entirely
            if(section)section.style.display='none';
            setStep(1);
        } else if(avail.length===1){
            // Only 1 frame — auto-select it silently, skip selection UI
            selectedTemplate=avail[0];
            sessionStorage.setItem('selectedTemplate',String(selectedTemplate));
            var img=document.getElementById('overlay-img');
            if(img)img.src='templates/plain'+selectedTemplate+'.png';
            if(section)section.style.display='none';
            setStep(2); // step 1 auto-done, jump to upload
        } else {
            // Multiple frames — restore session choice or pick first available
            var stored=sessionStorage.getItem('selectedTemplate');
            var pick=(stored&&avail.indexOf(parseInt(stored))!==-1)?parseInt(stored):avail[0];
            selectedTemplate=pick;
            document.querySelectorAll('.template-option').forEach(function(o){o.classList.remove('active');});
            var a=document.querySelector('[data-template="'+pick+'"]');
            if(a)a.classList.add('active');
            var img=document.getElementById('overlay-img');
            if(img)img.src='templates/plain'+pick+'.png';
            setStep(1);
        }
        // Overlay image click → open file picker if no photo yet
        var ov=document.getElementById('overlay-img');
        if(ov)ov.addEventListener('click',function(){if(!ov.getAttribute('data-has-photo'))document.getElementById('file').click();});
        // Drag and drop on upload zone
        var dz=document.getElementById('drop-zone');
        if(dz){
            dz.addEventListener('dragover',function(e){e.preventDefault();dz.classList.add('drag-over');});
            dz.addEventListener('dragleave',function(){dz.classList.remove('drag-over');});
            dz.addEventListener('drop',function(e){
                e.preventDefault();dz.classList.remove('drag-over');
                var f=e.dataTransfer.files;if(f&&f[0])handleFile(f[0]);
            });
        }
    }

    if(options.length===0){initPage([]);return;}
    options.forEach(function(opt){
        var n=parseInt(opt.getAttribute('data-template'));
        // Probe template{n}.png — this is the authoritative file
        var t=new Image();
        t.onload=function(){
            available.push(n);
            probeThumb(n,function(){
                checked++;
                if(checked===options.length)initPage(available.sort(function(a,b){return a-b;}));
            });
        };
        t.onerror=function(){
            opt.style.display='none'; // hide card if overlay doesn't exist
            checked++;
            if(checked===options.length)initPage(available.sort(function(a,b){return a-b;}));
        };
        t.src='templates/template'+n+'.png';
    });
});

function selectTemplate(n){
    selectedTemplate=n;
    document.querySelectorAll('.template-option').forEach(function(o){o.classList.remove('active');});
    var el=document.querySelector('[data-template="'+n+'"]');if(el)el.classList.add('active');
    sessionStorage.setItem('selectedTemplate',n);
    var img=document.getElementById('overlay-img');
    if(img&&!img.getAttribute('data-has-photo'))img.src='templates/plain'+n+'.png';
    showToast('Frame '+n+' selected!','info');setStep(2);
}

function loadFile(event){
    var file=event.target.files[0];if(!file)return;
    event.target.value='';handleFile(file);
}

function handleFile(file){
    if(!file.type.startsWith('image/')){showToast('Please select an image file.','error');return;}
    var reader=new FileReader();
    reader.onload=function(e){openPositionModal(e.target.result);};
    reader.readAsDataURL(file);
}

function openPositionModal(src){
    var modal=document.getElementById('position-modal');
    if(!modal){showToast('Modal not found','error');return;}
    ed.rotation=0;ed.dragging=false;
    ed.canvas=document.getElementById('position-canvas');
    if(!ed.canvas){showToast('Canvas not found','error');return;}
    ed.ctx=ed.canvas.getContext('2d');
    var tpl=new Image();
    tpl.onload=function(){ed.tplImg=tpl;initEditor(ed.canvas,tpl.naturalWidth||1000,tpl.naturalHeight||1000,src);};
    tpl.onerror=function(){ed.tplImg=null;initEditor(ed.canvas,1000,1000,src);};
    tpl.src='templates/template'+selectedTemplate+'.png';
    modal.classList.add('open');
    document.body.style.overflow='hidden';
    setStep(2);
}

function initEditor(canvas,cw,ch,src){
    var wrap=document.getElementById('position-canvas-wrap');
    var maxD=Math.min(wrap?wrap.clientWidth:500,520);
    ed.ratio=Math.min(maxD/cw,maxD/ch);
    canvas.width=cw;canvas.height=ch;
    canvas.style.width=Math.round(cw*ed.ratio)+'px';
    canvas.style.height=Math.round(ch*ed.ratio)+'px';
    var ui=new Image();
    ui.onload=function(){ed.userImg=ui;resetEditor();attachEditorEvents();};
    ui.onerror=function(){showToast('Could not load image.','error');};
    ui.src=src;
}

function resetEditor(){
    if(!ed.userImg||!ed.canvas)return;
    var cw=ed.canvas.width,ch=ed.canvas.height;
    var s=Math.max(cw/ed.userImg.naturalWidth,ch/ed.userImg.naturalHeight);
    ed.scale=s;
    ed.x=(cw-ed.userImg.naturalWidth*s)/2;
    ed.y=(ch-ed.userImg.naturalHeight*s)/2;
    ed.rotation=0;
    drawEditor();
}

function drawEditor(){
    if(!ed.canvas||!ed.ctx||!ed.userImg)return;
    var ctx=ed.ctx,cw=ed.canvas.width,ch=ed.canvas.height;
    ctx.clearRect(0,0,cw,ch);
    var iw=ed.userImg.naturalWidth*ed.scale;
    var ih=ed.userImg.naturalHeight*ed.scale;
    var cx=ed.x+iw/2,cy=ed.y+ih/2;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(ed.rotation*Math.PI/180);
    ctx.drawImage(ed.userImg,-iw/2,-ih/2,iw,ih);
    ctx.restore();
    if(ed.tplImg)ctx.drawImage(ed.tplImg,0,0,cw,ch);
}

function attachEditorEvents(){
    var cv=ed.canvas;if(!cv)return;
    cv.style.cursor='grab';
    cv.style.touchAction='none';
    cv.onmousedown=function(e){
        ed.dragging=true;ed.lx=e.clientX;ed.ly=e.clientY;
        cv.style.cursor='grabbing';e.preventDefault();
    };
    document.onmousemove=function(e){
        if(!ed.dragging)return;
        ed.x+=(e.clientX-ed.lx)/ed.ratio;
        ed.y+=(e.clientY-ed.ly)/ed.ratio;
        ed.lx=e.clientX;ed.ly=e.clientY;
        drawEditor();
    };
    document.onmouseup=function(){ed.dragging=false;if(cv)cv.style.cursor='grab';};
    cv.addEventListener('wheel',function(e){
        e.preventDefault();
        var r=cv.getBoundingClientRect();
        zoomAt((e.clientX-r.left)/ed.ratio,(e.clientY-r.top)/ed.ratio,e.deltaY<0?0.12:-0.12);
    },{passive:false});
    cv.addEventListener('touchstart',function(e){
        e.preventDefault();
        if(e.touches.length===1){
            ed.dragging=true;ed.lx=e.touches[0].clientX;ed.ly=e.touches[0].clientY;ed.pinchDist=0;
        }else if(e.touches.length===2){
            ed.dragging=false;
            ed.pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        }
    },{passive:false});
    cv.addEventListener('touchmove',function(e){
        e.preventDefault();
        if(e.touches.length===1&&ed.dragging){
            ed.x+=(e.touches[0].clientX-ed.lx)/ed.ratio;
            ed.y+=(e.touches[0].clientY-ed.ly)/ed.ratio;
            ed.lx=e.touches[0].clientX;ed.ly=e.touches[0].clientY;
            drawEditor();
        }else if(e.touches.length===2&&ed.pinchDist>0){
            var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
            var r=ed.canvas.getBoundingClientRect();
            var mx=((e.touches[0].clientX+e.touches[1].clientX)/2-r.left)/ed.ratio;
            var my=((e.touches[0].clientY+e.touches[1].clientY)/2-r.top)/ed.ratio;
            zoomAt(mx,my,(d-ed.pinchDist)/ed.pinchDist*0.7);
            ed.pinchDist=d;
        }
    },{passive:false});
    cv.addEventListener('touchend',function(e){
        if(e.touches.length<2)ed.pinchDist=0;
        if(e.touches.length===0)ed.dragging=false;
    });
}

function zoomAt(px,py,delta){
    var ns=Math.max(0.05,Math.min(ed.scale*(1+delta),20));
    var r=ns/ed.scale;
    ed.x=px-(px-ed.x)*r;ed.y=py-(py-ed.y)*r;
    ed.scale=ns;drawEditor();
}
function zoomEditor(d){if(ed.canvas)zoomAt(ed.canvas.width/2,ed.canvas.height/2,d);}
function rotateEditor(deg){ed.rotation=(ed.rotation+deg)%360;drawEditor();}

function cancelPosition(){
    var m=document.getElementById('position-modal');
    if(m)m.classList.remove('open');
    document.body.style.overflow='';
    document.onmousemove=null;document.onmouseup=null;
}

function confirmPosition(){
    if(!ed.canvas||!ed.userImg)return;
    drawEditor();
    var proc=document.getElementById('processing-overlay');
    var ar=document.getElementById('action-row');
    var ri=document.getElementById('overlay-img');
    cancelPosition();
    if(proc)proc.style.display='flex';
    if(ar)ar.style.display='none';
    window._resultCanvas=ed.canvas;
    var dataURL=ed.canvas.toDataURL('image/png');
    ri.src=dataURL;
    ri.setAttribute('data-has-photo','1');
    ri.classList.add('frame-ready');
    setTimeout(function(){
        if(proc)proc.style.display='none';
        if(ar)ar.style.display='flex';
        setStep(3);
        showToast('Your frame is ready! Download below.','success');
        var w=document.getElementById('section-result');
        if(w)w.scrollIntoView({behavior:'smooth',block:'start'});
    },120);
}

function getImageDataURL(){
    if(window._resultCanvas)return window._resultCanvas.toDataURL('image/png');
    var img=document.getElementById('overlay-img');
    if(img.src&&img.src.startsWith('data:'))return img.src;
    var c=document.createElement('canvas');
    c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;
    c.getContext('2d').drawImage(img,0,0);
    return c.toDataURL('image/png');
}

function toBlob(d){
    var dec=atob(d.replace(/^.*,/,''));
    var buf=new Uint8Array(dec.length);
    for(var i=0;i<dec.length;i++)buf[i]=dec.charCodeAt(i);
    try{return new Blob([buf.buffer],{type:'image/png'});}catch(e){return null;}
}

function downloadImage(){
    var uri=getImageDataURL();
    var blob=toBlob(uri);
    if(!blob){showToast('Could not prepare image.','error');return;}

    // Try Web Share API with file (mobile — lets user save to photos directly)
    var mob=/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
    if(mob&&navigator.canShare){
        var f=new File([blob],FILENAME,{type:'image/png'});
        if(navigator.canShare({files:[f]})){
            navigator.share({files:[f],title:'Nepal Festival & Expo 2026'})
                .then(function(){showToast('Image shared!','success');})
                .catch(function(err){
                    // User cancelled or share failed — fall back to blob download
                    if(err.name!=='AbortError')triggerDownload(blob);
                });
            return;
        }
    }
    // Desktop or fallback: blob URL download (works everywhere, including mobile Chrome)
    triggerDownload(blob);
}

function triggerDownload(blob){
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;
    a.download=FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},2000);
    showToast('Download started!','success');
}

function shareFacebook(){
    window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(window.location.href),'_blank','width=600,height=450,noopener');
}

function copyLink(){
    if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(window.location.href)
            .then(function(){showToast('Link copied!','success');})
            .catch(fallbackCopy);
    }else{fallbackCopy();}
}

function fallbackCopy(){
    var i=document.createElement('input');i.value=window.location.href;
    document.body.appendChild(i);i.select();
    try{document.execCommand('copy');showToast('Link copied!','success');}
    catch(e){showToast('Could not copy.','error');}
    document.body.removeChild(i);
}

function refreshPage(){sessionStorage.removeItem('selectedTemplate');window._resultCanvas=null;window.location.reload();}