// Affichage du loading simplifié
function showLoading(message) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingText) {
        loadingText.textContent = message;
    }
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.animation = 'fadeIn 0.3s ease-in-out';
    }, 300);
}

function disableButtons() {
    const pdfBtn = document.getElementById('pdfBtn');
    const contactBtn = document.getElementById('contactBtn');
    pdfBtn.disabled = true;
    contactBtn.disabled = true;
    pdfBtn.style.opacity = '0.6';
    contactBtn.style.opacity = '0.6';
}

function enableButtons() {
    const pdfBtn = document.getElementById('pdfBtn');
    const contactBtn = document.getElementById('contactBtn');
    pdfBtn.disabled = false;
    contactBtn.disabled = false;
    pdfBtn.style.opacity = '1';
    contactBtn.style.opacity = '1';
}

// Fonction PDF avec loader simplifié
async function downloadPDF() {
    try {
        showLoading('Génération du PDF en cours...');
        disableButtons();
        
        // Mode PDF activé
        document.body.classList.add('pdf-mode');
        
        // Petit délai pour permettre l'application du mode PDF
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Configuration html2canvas optimisée
        const canvas = await html2canvas(document.body, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 794,
            windowHeight: 1123,
            removeContainer: true,
            imageTimeout: 5000,
            logging: false,
            ignoreElements: function(element) {
                return element.classList.contains('loading-overlay') ||
                       element.classList.contains('header') ||
                       element.classList.contains('footer');
            }
        });
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
            precision: 2
        });
        
        // Dimensions et calculs
        const pageWidth = 210;
        const pageHeight = 297;
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        
        let offsetY = 0;
        if (imgHeight < pageHeight) {
            offsetY = (pageHeight - imgHeight) / 2;
        }
        
        // Ajout de l'image
        pdf.addImage(
            canvas.toDataURL('image/jpeg', 0.85),
            'JPEG', 
            0, 
            offsetY, 
            imgWidth, 
            Math.min(imgHeight, pageHeight),
            undefined,
            'FAST'
        );
        
        // Nom dynamique pour le PDF
        let pdfFileName = 'Carte_Visite';
        if (typeof contactData !== 'undefined' && contactData.name) {
            pdfFileName += '_' + contactData.name.replace(/\s+/g, '_');
        }
        pdfFileName += '.pdf';
        
        // Téléchargement
        pdf.save(pdfFileName);
        
    } catch (error) {
        console.error('Erreur PDF:', error);
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
        // Nettoyage
        document.body.classList.remove('pdf-mode');
        hideLoading();
        enableButtons();
    }
}

// Fonction de sauvegarde contact avec loader
function saveContact() {
    try {
        showLoading('Création du contact...');
        disableButtons();
        
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactData.name}\nORG:${contactData.company}\nTITLE:${contactData.title}\nTEL;TYPE=WORK,VOICE:${contactData.phone1}\nTEL;TYPE=WORK,VOICE:${contactData.phone2}\nEMAIL;TYPE=WORK:${contactData.email}\nURL:${contactData.website}\nEND:VCARD`;
        
        const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Nom dynamique pour le contact
        let vcfFileName = 'Contact';
        if (typeof contactData !== 'undefined' && contactData.name) {
            vcfFileName = contactData.name.replace(/\s+/g, '_');
        }
        a.download = vcfFileName + '.vcf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setTimeout(() => {
            hideLoading();
            enableButtons();
        }, 800);
        
    } catch (error) {
        console.error('Erreur contact:', error);
        alert('Erreur lors de la création du contact. Veuillez réessayer.');
        hideLoading();
        enableButtons();
    }
}

// Préchargement des images
window.addEventListener('load', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            img.addEventListener('load', function() {
                // Image chargée
            });
        }
    });
});