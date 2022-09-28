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

const debounce = (f, delay=250) => {
    let timeout = null;
    return () => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(f, delay);
    }
}

const getImageBounds = (img, cw, ch) => {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    let rh = 0;
    let rw = 0;
    // Get Image and Rendered Canvas Aspect ratio
    const iar = iw / ih;
    const ar = cw / ch;

    if (iar < ar) {
        // Rendered on a wider canvas
        rh = ch;
        rw = rh * iar;
    } else {
        // Rendered on a taller canvas
        rw = cw;
        rh = rw / iar;
    }
    return {
        offset_x: (cw - rw) / 2,
        offset_y: (ch - rh) / 2,
        width: rw,
        height: rh
    }
}

class Visualization {

    constructor(c, transform) {
        this.c = c;
        this.canvas = c.querySelector("canvas");
        this.primary_colour = getComputedStyle(document.documentElement).getPropertyValue('--mdc-theme-primary') || "#6200ee";
        this.transform = transform;

        // Canvas to hold the transformed result
        this.tcanvas = document.createElement('canvas')

        // Temporary canvas to read / write image data
        this.bcanvas = document.createElement('canvas');

        // Temporary canvas to use for computing diff
        this.dcanvas = document.createElement('canvas');

        this.bcanvas.width = this.tcanvas.width = this.dcanvas.width = this.canvas.width;
        this.bcanvas.height = this.tcanvas.height = this.dcanvas.height = this.canvas.height;

        this.ctx = this.canvas.getContext('2d');
        this.bctx = this.bcanvas.getContext('2d');
        this.tctx = this.tcanvas.getContext('2d');
        this.dctx = this.dcanvas.getContext('2d');

        this.selected_filename_list = [];

        // Internal state
        this._input_image = null;
        this._image_bounds = {
            offset_x: 0,
            offset_y: 0,
            width: 0,
            height: 0,
        };

        this._identity = {
            scale: 1.0,
            tx: 0.0,
            ty: 0.0
        };
        this._current_transform = Object.assign({}, this._identity);

        window.addEventListener('resize', debounce(() => {
            this._measure_canvas();
        }));
    }
    _measure_canvas() {
        const { width, height } = this.canvas.getBoundingClientRect();
        if (this._input_image) {
            this._image_bounds = getImageBounds(
                this._input_image,
                width,
                height
            );
        }
    }

    get current_transform () {
        return this._current_transform;
    }

    set current_transform(val) {
        this._current_transform = Object.assign({}, val);
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    get input_image(){
        return this._input_image;
    }

    set input_image(val) {
        this._input_image = val;
    }

    set_filename_list(filename_list) {
        this.selected_filename_list = filename_list;
    }

    process(img1, img2, transform) {
        this.input_image = img1;

        const im1Data = this.getImageData(img1);
        const im2Data = this.getImageData(img2);

        const buf = this.transform.estimate_transform(
            im2Data.data,
            im2Data.height,
            im1Data.data,
            im1Data.height,
            transform,
        );

        const H = new Float64Array(
            buf.buffer,
            buf.byteOffset,
            buf.length / Float64Array.BYTES_PER_ELEMENT
        ).slice();

        const _warped_buf = this.transform.warp_image(
            im2Data.data,
            im2Data.height,
            H,
            im1Data.height,
            im1Data.width,
            transform,
        )

        this.resultData = new ImageData(
            new Uint8ClampedArray(_warped_buf),
            im1Data.width,
            im1Data.height
        );

        this.tcanvas.width = this.bcanvas.width = this.canvas.width = im1Data.width;
        this.tcanvas.height = this.bcanvas.height = this.canvas.height = im1Data.height;
        this.tctx.putImageData(this.resultData, 0, 0);

        this.canvas.dispatchEvent(new CustomEvent('transform', {
            bubbles: true,
        }));

        window.requestAnimationFrame(() => {
            this._measure_canvas();
        })
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

    draw() {
        // Zoom
        const { scale, tx, ty } = this._current_transform;
        if (scale === 1.0) {
            // Copy over bcanvas
            copyImage(this.ctx, this.bcanvas);
            return;
        }

        // Convert mouse to image coordinates
        const {_image_bounds, width, height, ctx} = this;
        const { offset_x, offset_y, width: iw, height: ih } = _image_bounds;

        let ix = Math.min(iw, Math.max(0, tx - offset_x));
        let iy = Math.min(ih, Math.max(0, ty - offset_y));
        ix *= (width / iw);
        iy *= (height / ih);

        ix = Math.round(ix);
        iy = Math.round(iy);

        const zoom_radius = Math.round(0.30 * Math.min(width, height));
        const scaled_dim = Math.round(zoom_radius / scale);

        // Draw base layer
        copyImage(this.ctx, this.bcanvas);

        // Create a clipping mask with arc
        ctx.save();

        ctx.beginPath();
        ctx.arc(ix, iy, zoom_radius, 0, Math.PI * 2, true);
        ctx.clip();

        // Draw portion of canvas where mouse is and based on scale
        // back on canvas
        ctx.globalCompositeOperation = 'copy';
        ctx.globalAlpha = 1.0;

        ctx.drawImage(
            this.bcanvas,
            ix - scaled_dim,
            iy - scaled_dim,
            scaled_dim *2,
            scaled_dim *2,
            ix - zoom_radius,
            iy - zoom_radius,
            zoom_radius * 2,
            zoom_radius * 2
        );
        ctx.globalCompositeOperation = 'source-over';

        ctx.beginPath();
        ctx.arc(ix, iy, zoom_radius - 1, 0, Math.PI * 2, true);
        ctx.strokeStyle = this.primary_colour;
        ctx.lineWidth = '2';
        ctx.stroke();

        ctx.restore();
    }

    _draw_image(img = null, clear=false) {
        const { width, height } = this.bcanvas;
        if (clear) {
            this.bctx.clearRect(0, 0, width, height)
        }
        this.bctx.drawImage(
            img, 0, 0, img.naturalWidth || img.width, img.naturalHeight || img.height,
            0, 0, width, height
        );
    }

    draw_toggle_image(flag = false) {
        this._draw_image(flag ? this.tcanvas : this.input_image, true);
        this.draw();
    }

    draw_diff_image() {

        // Based on
        // 1. https://stackoverflow.com/questions/60937639/canvas-splitting-image-into-rgba-components
        // 2. https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Compositing
        // 3. https://stackoverflow.com/questions/33822092/greyscale-canvas-make-canvas-color-to-black-and-white

        const { bctx, dctx, dcanvas, input_image, tcanvas } = this;

        // Copy image
        copyImage(dctx, input_image);

        // gray scale
        grayscale(dctx);

        // Get channel
        multiplyChannel(dctx, "red");

        // Copy it to diff canvas
        this._draw_image(dcanvas, true);

        // copy image2
        copyImage(dctx, tcanvas);

        // grayscale
        grayscale(dctx);

        // multiply blue-green
        multiplyChannel(dctx, "bg");

        // Copy it over diff canvas
        bctx.save();
        bctx.globalCompositeOperation = "lighter";
        this._draw_image(dcanvas, false);
        bctx.restore();

        this.draw();
    }

    draw_overlay_image(factor) {
        this.bctx.save();
        this._draw_image(this.input_image, true);
        this.bctx.globalAlpha = factor;
        this._draw_image(this.tcanvas, false);
        this.bctx.restore();

        this.draw();
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
