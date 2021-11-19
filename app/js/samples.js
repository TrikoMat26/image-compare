class Samples {
    constructor(container) {
        this.c = container;
        this.close_btn = document.getElementById('samples_close_btn');
        this.close_btn.onclick = this.hide.bind(this);

        this.samples_list_items = this.c.querySelectorAll('li.mdc-list-item');
        this.samples_list_items.forEach(el => {
            el.onclick = this.select_sample.bind(this);
        });

    }

    select_sample(e) {
        const image_sources = [].map.call(e.currentTarget.querySelectorAll('img'), (el) => {
            return el.src;
        });
        this.c.dispatchEvent(new CustomEvent('select_sample', {
            detail: {
                image_sources,
            }
        }));
        // const close_listener = () => {
        //     this.c.dispatchEvent(new CustomEvent('select_sample', {
        //         detail: {
        //             image_source: image_sources,
        //         }
        //     }));
        //     document.removeEventListener('MDCDrawer:closed', close_listener);
        // }
        // document.addEventListener('MDCDrawer:closed', close_listener)
    }
    show() {
        //this.c.MDCDrawer.open = true;
        this.c.classList.add('ty-100');
    }

    hide() {
        // this.c.MDCDrawer.open = false;
        this.c.classList.remove('ty-100');
    }

    toggle () {
        // this.c.MDCDrawer.open = !this.c.MDCDrawer.open;
        this.c.classList.toggle('ty-100');
    }
}