// On attend que la page soit chargée
document.addEventListener('DOMContentLoaded', () => {

    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // --- 1. FONCTION D'ENVOI PRO (FETCH API) ---
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // On cible les éléments HTML précisément
        const elements = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            reason: document.getElementById('reason'),
            message: document.getElementById('message')
        };

        // Extraction des valeurs proprement (Retire les espaces inutiles)
        const data = {
            nom: elements.name?.value.trim(),
            email: elements.email?.value.trim(),
            sujet: elements.subject?.value.trim() || "Sans objet",
            motif: elements.reason?.value,
            message: elements.message?.value.trim()
        };

        // --- VERIFICATION ROBUSTE ---
        // Si l'un des champs obligatoires est vide pour le JS, on arrête et on affiche l'erreur
        if (!data.nom || !data.email || !data.message) {
            console.error("Données invalides :", data);
            showNotification("Erreur : Veuillez remplir correctement le Nom, l'Email et le Message.", "error");
            return;
        }

        // Effet visuel : Désactivation du bouton pendant l'envoi (pour éviter les doublons)
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi rapide...';

        try {
            // ENVOI AU BACKEND DJANGO
            const response = await fetch('/envoyer-contact/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showNotification(`Succès : ${data.nom}, votre message a été envoyé !`, "success");
                contactForm.reset();
            } else {
                throw new Error(result.message || "Erreur du serveur Django");
            }

        } catch (error) {
            showNotification("Le serveur Django ne répond pas. Vérifiez le terminal.", "error");
            console.error("Bug de communication :", error);
        } finally {
            // Remise à l'état normal du bouton
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    // Initialisation rapide des visuels
    if (typeof initTheme === 'function') initTheme();
    if (typeof initCarousel === 'function') initCarousel();
    document.body.classList.remove('no-js');
    if (document.getElementById('preloader')) document.getElementById('preloader').classList.add('hidden');
});

// --- 2. SYSTÈME DE NOTIFICATION PRO (TOAST) ---
function showNotification(msg, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; 
        padding: 15px 25px; border-radius: 10px; z-index: 10000;
        color: white; font-weight: bold; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.5s ease-out;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// CSS d'animation rapide pour le Toast
const style = document.createElement('style');
style.innerHTML = `@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`;
document.head.appendChild(style);