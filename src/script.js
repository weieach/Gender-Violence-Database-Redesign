document.addEventListener('DOMContentLoaded', () => {
    const contactBtn = document.querySelector('.btn-contact');
    const contactModal = document.getElementById('contact-modal');
    const closeContactBtn = contactModal ? contactModal.querySelector('.modal-contact-close') : null;
    const doneContactBtn = contactModal ? contactModal.querySelector('.glossary-modal-done') : null;

    if (!contactBtn || !contactModal) return;

    const openModal = () => {
        contactModal.classList.remove('is-hidden');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        contactModal.classList.add('is-hidden');
        document.body.classList.remove('modal-open');
    };

    contactBtn.addEventListener('click', openModal);
    if (closeContactBtn) closeContactBtn.addEventListener('click', closeModal);
    if (doneContactBtn) doneContactBtn.addEventListener('click', closeModal);
    contactModal.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !contactModal.classList.contains('is-hidden')) {
            closeModal();
        }
    });
});