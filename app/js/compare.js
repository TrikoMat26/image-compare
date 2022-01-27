class Compare {
    constructor(container, result) {
        this.c = container;
        this.cc = document.getElementById('compare_container');
        this.h_image_list = this.c.querySelector('ul.mdc-image-list.horizontal-image-list');
        this.v_image_list = this.c.querySelector('ul.mdc-image-list.vertical-image-list');
        this.action_container = this.c.querySelector('div.action');
        this.compare_btn = document.getElementById('compare');
        this.compare_label = this.compare_btn.querySelector('span.mdc-button__label');
        this.result = result;

        this.footer = this.c.querySelector('footer');
        this.back_btn = document.getElementById('back');
        this.more_btn = document.getElementById('more');

        this.toggle = document.getElementById('toggle');
        // TODO: Infer from document or set the document
        this.TOGGLE_SPEED = 2;

        this.toggle.onclick = this.handle_toggle.bind(this);

        this.input = document.getElementById('image_select_input2');
        const process_images = (function(){
            const v_imgs = this.v_image_list.querySelectorAll('img');
            this.result.process(...v_imgs);
        }).bind(this);

        this.compare_btn.onclick = () => {
            this.compare_label.textContent = 'Processing ...'
            this.compare_btn.disabled = true;

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(process_images)
            })
        }

        this.result.canvas.addEventListener('transform', () => {
            this.show_result_screen();
            this.compare_label.textContent = 'Compare';
            this.compare_btn.disabled = false;
        });

        this.back_btn.onclick = this.back.bind(this);

        this.more_btn.onclick = () => {
            this.c.dispatchEvent(new CustomEvent('more'));
        }

        this.input.oninput = this.image_onchange.bind(this);
        [].forEach.call(this.v_image_list.querySelectorAll('li'), (el) => {
            el.onclick = this.handle_image_click.bind(this);
        });
    }

    back () {
        this.c.dispatchEvent(new CustomEvent('back'));
    }

    handle_toggle(e) {
        const clicked_btn = e.target.closest('button.mdc-tab');
        if (!(clicked_btn)) {
            // Button is not clicked?
            return;
        }

        const active_btn = e.currentTarget.querySelector('button.mdc-tab.active');
        if (clicked_btn === active_btn) {
            // Active button is clicked
            return;
        }

        clicked_btn.classList.add('active', 'mdc-theme--primary-bg');
        active_btn.classList.remove('active', 'mdc-theme--primary-bg');

        const clicked_label = clicked_btn.querySelector('span.mdc-tab__text-label');
        const active_label = active_btn.querySelector('span.mdc-tab__text-label');

        active_label.classList.replace('mdc-theme--on-primary', 'mdc-theme--primary');
        clicked_label.classList.replace('mdc-theme--primary', 'mdc-theme--on-primary');

        this.TOGGLE_SPEED = Number.parseInt(clicked_btn.dataset.speed);
        this.result.toggle_images(this.TOGGLE_SPEED);
    }

    handle_image_click (e) {
        this.input.setAttribute('data-click', e.currentTarget.dataset.index)
        this.input.click();
    }

    image_onchange(e) {
        if (e.target.files.length === 0) {
            // TODO: Raise an event to show toast / snackbar
            return;
        }

        // TODO: Raise warning if more than 2 images are selected.
        const { files } = e.target;
        this.set_image(
            [URL.createObjectURL(files[0])],
            Number.parseInt(e.target.dataset.click));

        e.target.value = null;
    }
    set_image (images, index = -1) {
        const v_imgs = this.v_image_list.querySelectorAll('img');
        const h_imgs = this.h_image_list.querySelectorAll('img');

        const twice = () => {
            let count = 0;
            return function() {
                if (count == 1) {
                    URL.revokeObjectURL(this.src);
                    return;
                }
                count++;
            }
        }

        if (images.length == 2) {
            if (!v_imgs) {
                // Create new img elements
                v_imgs = [new document.createElement('img'), new document.createElement('img')];
                h_imgs = [new document.createElement('img'), new document.createElement('img')];
            }

            images.map((_im, idx) => {
                const handler = twice();
                v_imgs[idx].onload = h_imgs[idx].onload = handler;
                v_imgs[idx].src = h_imgs[idx].src = _im;
            });
            return;
        }

        if (images.length > 2 || images.length === 0) {
            console.error('Cannot use function with 0 or more than 2 images')
            return;
        }

        if (index !== 0 && index !== 1) {
            console.error('Index can only be 0 or 1 when only one image is passed')
            return;
        }

        const handler = twice();
        v_imgs[index].onload = h_imgs[index].onload = handler;
        v_imgs[index].src = h_imgs[index].src = images[0]

    }

    show_compare_screen () {
        this.result.toggle_images(0);
        this.cc.scrollIntoView({behavior: 'smooth', inline: 'start'});
        this.back_btn.onclick = this.back.bind(this);
    }

    show_result_screen () {
        this.result.toggle_images(this.TOGGLE_SPEED);
        this.cc.scrollIntoView({behavior: 'smooth', inline: 'end'})
        this.back_btn.onclick = this.show_compare_screen.bind(this);
    }
}