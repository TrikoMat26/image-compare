const MAX_DIM = 1024;

const COLOR_CHANNELS = {
    red: "#F00",
    green: "#0F0",
    blue: "#00F",
    bg: "#0FF",
    rg: "#FF0",
    rb: "#F0F",
    rgb: "#FFF",
};

const multiplyChannel = (_ctx, cname) => {
    _ctx.save();
    _ctx.fillStyle = COLOR_CHANNELS[cname] || "#000";
    _ctx.globalCompositeOperation = "multiply";
    _ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    _ctx.restore();
};
const grayscale = (_ctx) => {
    _ctx.save();
    _ctx.fillStyle = "#000";
    _ctx.globalCompositeOperation = "saturation";
    _ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    _ctx.restore();
};

const copyImage = (_ctx, _img, bbox = null) => {
    // Copy image to canvas
    const iw = _img.naturalWidth || _img.width;
    const ih = _img.naturalHeight || _img.height;
    _ctx.canvas.width = (bbox === null ? iw : bbox.width);
    _ctx.canvas.height = (bbox === null ? ih : bbox.height);
    _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    if (bbox === null) {
        _ctx.drawImage(_img, 0, 0);
    } else {
        _ctx.drawImage(_img,
            bbox.x,
            bbox.y,
            bbox.width,
            bbox.height,
            0,
            0,
            _ctx.canvas.width,
            _ctx.canvas.height
        );
    }
};

class Visualization {

    constructor(c, transform) {
        this.c = c;
        this.canvas = c.querySelector("canvas");
        ;
        this.transform = transform;

        // Canvas to hold the transformed result
        this.tcanvas = document.createElement('canvas')

        // Temporary canvas to read / write image data
        this.bcanvas = document.createElement('canvas');

        // Temporary canvas to use for computing diff
        this.dcanvas = document.createElement('canvas');

        this.bcanvas.width = this.tcanvas.width = this.dcanvas.width = this.canvas.width;
        this.bcanvas.height = this.tcanvas.width = this.dcanvas.height = this.canvas.height;

        this.ctx = this.canvas.getContext('2d');
        this.bctx = this.bcanvas.getContext('2d');
        this.tctx = this.tcanvas.getContext('2d');
        this.dctx = this.dcanvas.getContext('2d');

        this.selected_filename_list = [];
    }

    set_filename_list(filename_list) {
        this.selected_filename_list = filename_list;
    }

    process(img1, img2) {
        this.input_image = img1;
        this.input_image2 = img2;

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

        this.tcanvas.width = this.canvas.width = im1Data.width;
        this.tcanvas.height = this.canvas.height = im1Data.height;
        this.tctx.putImageData(this.resultData, 0, 0);

        this.canvas.dispatchEvent(new CustomEvent('transform', {
            bubbles: true,
        }));
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

    draw_slide_image(slide_factor, is_horizontal = false) {
        const rw = this.canvas.width;
        const rh = this.canvas.height;

        const iw = this.input_image.naturalWidth || this.input_image.width;
        const ih = this.input_image.naturalHeight || this.input_image.height;

        const ow = is_horizontal ? slide_factor * rw : rw;
        const oh = is_horizontal ? rh : slide_factor * rh;

        this.ctx.clearRect(0, 0, rw, rh);

        if (is_horizontal) {
          this.ctx.drawImage(this.input_image, 0, 0, iw * slide_factor, ih, 0, 0, ow, oh);
          this.ctx.drawImage(
            this.tcanvas,
            ow,
            0,
            rw - ow,
            oh,
            ow,
            0,
            rw - ow,
            oh
          );
        } else {
          this.ctx.drawImage(this.input_image, 0, 0, iw, ih * slide_factor, 0, 0, ow, oh);
          this.ctx.drawImage(
            this.tcanvas,
            0,
            oh,
            rw,
            rh - oh,
            0,
            oh,
            rw,
            rh - oh
          );
        }
      };

    draw_image(img, clear=false) {
        if (clear) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.ctx.drawImage(
            img, 0, 0, img.naturalWidth || img.width, img.naturalHeight || img.height,
            0, 0, this.canvas.width, this.canvas.height
        )
    }

    draw_toggle_image(flag = false) {
        this.draw_image(flag ? this.tcanvas : this.input_image, true);
    }

    draw_diff_image() {

        // Based on
        // 1. https://stackoverflow.com/questions/60937639/canvas-splitting-image-into-rgba-components
        // 2. https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Compositing
        // 3. https://stackoverflow.com/questions/33822092/greyscale-canvas-make-canvas-color-to-black-and-white

        const { ctx, dctx, dcanvas, input_image, tcanvas } = this;

        // Copy image
        copyImage(dctx, input_image);

        // gray scale
        grayscale(dctx);

        // Get channel
        multiplyChannel(dctx, "red");

        // Copy it to diff canvas
        copyImage(ctx, dcanvas);

        // copy image2
        copyImage(dctx, tcanvas);

        // grayscale
        grayscale(dctx);

        // multiply blue-green
        multiplyChannel(dctx, "bg");

        // Copy it over diff canvas
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(dcanvas, 0, 0);
        ctx.restore();
    }

    draw_overlay_image(factor) {
        this.ctx.save();
        this.draw_image(this.input_image, true);
        this.ctx.globalAlpha = factor;
        this.draw_image(this.tcanvas, false);
        this.ctx.restore();
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
            this.draw_toggle_image(toggle_flag);
            toggle_flag = !toggle_flag;
        }.bind(this));
        this.toggle_timer = setTimeout(cb, 0);
    }
}
