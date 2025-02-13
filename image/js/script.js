const metas = Array.from(document.getElementsByTagName('meta'))
const metaTitle = metas.find((m) => m.attributes[0].nodeValue === 'og:title')
metaTitle.attributes[1].nodeValue = 'NRNA Chiba Festival Design Tool'
const metaUrl = metas.find((m) => m.attributes[0].nodeValue === 'og:url')
metaUrl.attributes[1].nodeValue = window.location.href
const metaImage = metas.find((m) => m.attributes[0].nodeValue === 'og:image')
metaImage.attributes[1].nodeValue = window.location.href + 'thumbnail.png'
const metaDescription = metas.find((m) => m.attributes[0].nodeValue === 'og:description')
metaDescription.attributes[1].nodeValue = 'यो NRNA चिबा को फेस्टिवल को डिजाइन बनाउने टुल हो। तपाईंले आफ्नो मनपर्ने फोटो चयन गरेर फेस्टिवल ब्यानर बनाउन सक्नुहुन्छ र फेस्टिवललाई सफल बनाउनको लागि अनुरोध गर्दछौं।'

function isPc() {
    const userAgent = navigator.userAgent;
    const mobileKeywords = [
        'Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry',
        'Windows Phone', 'Opera Mini', 'IEMobile', 'Mobile'
    ];

    // Check for common mobile keywords
    for (let keyword of mobileKeywords) {
        if (userAgent.includes(keyword)) {
        return false; // Found a mobile keyword, hence not a PC
        }
    }

    return true; // No mobile keywords found, hence it's a PC
}


document.getElementById('overlay-img').addEventListener('click', function() {
    document.getElementById('file').click();
});	

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var loadFile = function(event) {
var reader = new FileReader();
reader.onload = function() {
  createOverlay(reader.result);
  sleep(2000).then(() => {
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('downloadBtn').style.removeProperty('display');
   });  

};
reader.readAsDataURL(event.target.files[0]);
};

var createOverlay = function(uploadImage) {
var baseImg = uploadImage;
document.getElementById('overlay-img').removeAttribute('style');
Caman("#overlay-img", function () {
    document.getElementById('overlay-img').removeAttribute('style');
    this.brightness(5).render();
    this.newLayer(function() {
        this.setBlendingMode("normal");
        this.opacity(100);
        this.overlayImage(baseImg);
        });

        this.newLayer(function() {
        this.setBlendingMode("normal");
        this.opacity(100);
        this.overlayImage('overlay.png');
        });
    
        document.getElementById('overlay-img').removeAttribute('style');
        document.getElementById('downloadBtn').style.removeProperty('display');
        window.scrollTo(0, document.body.scrollHeight);

        // document.getElementById('overlay-img').style.display = 'none';
});




};

var downloadImage = function() {
if (isPc()) {
    const fileName = 'overlay-image.png';
    const uri = document.getElementById('overlay-img').toDataURL('image/png');

    if (window.navigator.msSaveOrOpenBlob) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', uri);
        xhr.responseType = 'blob';
        xhr.onloadend = () => {
            if (xhr.status !== 200) {
                return false;
            }
            window.navigator.msSaveOrOpenBlob(xhr.response, fileName);
        };
        xhr.send();
    } else {
        let link = document.createElement('a');
        link.href = uri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
} else {

    const downloadFestivalImage = () => {
      const canvas = document.getElementById("overlay-img");
      if (!canvas) {
        return;
      }

      const dataURL = canvas.toDataURL("image/png");
      const blob = toBlob(dataURL);

      if (!blob) {
        return;
      }

      const imageFile = new File([blob], "[Save Image] क्लिक गर्नु होला.png", {
        type: "image/png",
      });

      navigator.share({
          files: [imageFile],
          title: "[Save Image] क्लिक गर्नुहोला",
        }).then(() => {
        }).catch((error) => {
    });
    };

    /**
     * Base64形式の画像データをBlobに変換する
     * @param {String} base64 Base64形式の画像データ
     * @returns {Blob} Blob形式の画像データ
     */
    const toBlob = (base64) => {
    const decodedData = atob(base64.replace(/^.*,/, ""));
    const buffers = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
        buffers[i] = decodedData.charCodeAt(i);
    }

    try {
        const blob = new Blob([buffers.buffer], {
        type: "image/png",
        });
        return blob;
    } catch (e) {
        return null;
    }
    };

    // do share
    downloadFestivalImage();
}

};