const MAX_DIM = 1024;
class Visualization {

    constructor(canvas, transform) {
        this.canvas = canvas;
        this.transform = transform;

        // Canvas to hold the transformed result
        this.tcanvas = document.createElement('canvas')

        // Temporary canvas to read / write image data
        this.bcanvas = document.createElement('canvas');

        this.bcanvas.width = this.tcanvas.width = canvas.width;
        this.bcanvas.height = this.tcanvas.width = canvas.height;

        this.ctx = this.canvas.getContext('2d');
        this.bctx = this.bcanvas.getContext('2d');
        this.tctx = this.tcanvas.getContext('2d');
    }
    process(img1, img2) {
        this.input_image = img1;
        const im1Data = this.getImageData(img1);
        const im2Data = this.getImageData(img2);

        const buf = this.transform.getTransformedImage(
            im1Data.data,
            im1Data.height,
            im2Data.data,
            im2Data.height,
            "affine",
        );

        this.resultData = new ImageData(
            new Uint8ClampedArray(buf),
            im1Data.width,
            im1Data.height
        );

        const diffBuf = this.transform.getDiff(
            im1Data.data,
            this.resultData.data,
            im1Data.height
        );
        this.diffData = new ImageData(
            new Uint8ClampedArray(diffBuf),
            im1Data.width,
            im1Data.height
        );

        this.tcanvas.width = this.canvas.width = im1Data.width;
        this.tcanvas.height = this.canvas.height = im1Data.height;
        this.tctx.putImageData(this.resultData, 0, 0);

        this.canvas.dispatchEvent(new CustomEvent('transform'));
    }

    getImageData (img) {
        const { width: cw, height: ch } = this.bcanvas;
        this.bctx.clearRect(0, 0, cw, ch);
        const iw = img.naturalWidth,
            ih = img.naturalHeight;

        if (iw < MAX_DIM && ih < MAX_DIM) {
            this.bcanvas.width = iw;
            this.bcanvas.height = ih;
            this.bctx.drawImage(img, 0, 0);
            return this.bctx.getImageData(0, 0, this.bcanvas.width, this.bcanvas.height);
        }

        const max_dim = iw > ih ? iw : ih;
        const ow = Math.round((iw / max_dim) * MAX_DIM),
            oh = Math.round((ih / max_dim) * MAX_DIM);
        this.bcanvas.width = ow;
        this.bcanvas.height = oh;
        this.bctx.drawImage(img, 0, 0, iw, ih, 0, 0, ow, oh);
        return this.bctx.getImageData(0, 0, ow, oh);
    }

    draw_image(img) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
            img, 0, 0, img.naturalWidth || img.width, img.naturalHeight || img.height,
            0, 0, this.canvas.width, this.canvas.height
        )
    }

    toggle_images(speed) {
        if (this.toggle_timer) {
            clearTimeout(this.toggle_timer);
            this.toggle_timer = null;
        }
        if (speed === 0) {
            this.TOGGLE_IMAGES = false;
            return;
        }
        this.TOGGLE_IMAGES = true;
        let toggle_flag = false;
        const cb = (function() {
            if (this.TOGGLE_IMAGES) {
                this.toggle_timer = setTimeout(cb, 1000 / speed);
            }
            this.draw_image(toggle_flag ? this.tcanvas : this.input_image);
            toggle_flag = !toggle_flag;
        }.bind(this));
        this.toggle_timer = setTimeout(cb, 0);
    }
}