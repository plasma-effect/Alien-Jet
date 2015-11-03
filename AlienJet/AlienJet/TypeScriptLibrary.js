var plasma;
(function (plasma) {
    var utility;
    (function (utility) {
        var date = new Date();
        function get_time() {
            return date.getTime();
        }
        utility.get_time = get_time;
    })(utility = plasma.utility || (plasma.utility = {}));
    var random;
    (function (random) {
        var XorShift = (function () {
            function XorShift(seed) {
                this.seed = seed;
            }
            XorShift.prototype.run = function () {
                this.seed ^= (this.seed << 17);
                this.seed ^= (this.seed >> 9);
                this.seed ^= (this.seed << 8);
                this.seed ^= (this.seed >> 27);
                return this.seed;
            };
            return XorShift;
        })();
        random.XorShift = XorShift;
        function make_xorshift(seed) {
            var engine = new XorShift(seed);
            return function () {
                return engine.run();
            };
        }
        random.make_xorshift = make_xorshift;
        function seed_generate() {
            var v = utility.get_time();
            v ^= (v << 19);
            v ^= (v >> 13);
            v ^= (v << 8);
            v ^= (v >> 21);
            return v;
        }
        random.seed_generate = seed_generate;
        function uniformed_int_distribution(callback, min, max) {
            return function () {
                var x = callback();
                var m = Math.floor((1 << 30) / (max - min + 1)) * (max - min + 1);
                for (; x < 0 || x >= m; x = callback())
                    ;
                return (x % (max - min + 1)) + min;
            };
        }
        random.uniformed_int_distribution = uniformed_int_distribution;
    })(random = plasma.random || (plasma.random = {}));
    var CanvasTraits = (function () {
        function CanvasTraits(field_name) {
            this.canvas = document.getElementById(field_name);
            if (!this.canvas || !this.canvas.getContext) {
                this.flag = false;
            }
            else {
                this.ctx = this.canvas.getContext('2d');
                this.flag = true;
            }
        }
        CanvasTraits.prototype.draw_string = function (str, size, offset_x, offset_y, style) {
            if (style === void 0) { style = "black"; }
            if (!this.flag)
                return;
            this.ctx.fillStyle = style;
            this.ctx.font = size + "px 'メイリオ'";
            this.ctx.fillText(str, offset_x, offset_y + size);
        };
        CanvasTraits.prototype.draw_rect = function (offset_x, offset_y, width, height, style) {
            if (style === void 0) { style = "black"; }
            if (!this.flag)
                return;
            this.ctx.fillStyle = style;
            this.ctx.fillRect(offset_x, offset_y, width, height);
        };
        CanvasTraits.prototype.draw_image = function (image, offset_x, offset_y) {
            if (!this.flag)
                return;
            this.ctx.drawImage(image, offset_x, offset_y);
        };
        return CanvasTraits;
    })();
    plasma.CanvasTraits = CanvasTraits;
    var game_interface;
    (function (game_interface) {
        var interface_data = (function () {
            function interface_data() {
                this.keyboardpress = new Array(0x100);
                this.keyboardclick = new Array(0x100);
                for (var i = 0; i < 0x100; ++i)
                    this.keyboardpress[i] = false;
                this.mouse_on = false;
                this.reset();
            }
            interface_data.prototype.reset = function () {
                this.mouse_click = false;
                for (var i = 0; i < 0x100; ++i)
                    this.keyboardclick[i] = false;
            };
            interface_data.prototype.copy = function () {
                var ret = new interface_data();
                ret.keyboardclick = this.keyboardclick;
                ret.keyboardpress = this.keyboardpress;
                ret.mouse_click = this.mouse_click;
                ret.mouse_on = this.mouse_on;
                ret.mouse_x = this.mouse_x;
                ret.mouse_y = this.mouse_y;
                return ret;
            };
            return interface_data;
        })();
        game_interface.interface_data = interface_data;
        var detail;
        (function (detail) {
            detail.helper = new interface_data();
            detail.now_data = new interface_data();
        })(detail = game_interface.detail || (game_interface.detail = {}));
        function mouse_on() {
            return detail.now_data.mouse_on;
        }
        game_interface.mouse_on = mouse_on;
        function mouse_click() {
            return detail.now_data.mouse_click;
        }
        game_interface.mouse_click = mouse_click;
        function mouse_x() {
            return detail.now_data.mouse_x;
        }
        game_interface.mouse_x = mouse_x;
        function mouse_y() {
            return detail.now_data.mouse_y;
        }
        game_interface.mouse_y = mouse_y;
        function keyboard_click(code) {
            return detail.now_data.keyboardclick[code];
        }
        game_interface.keyboard_click = keyboard_click;
        function keyboard_press(code) {
            return detail.now_data.keyboardpress[code];
        }
        game_interface.keyboard_press = keyboard_press;
        function set_interval(callback, timer) {
            if (timer === void 0) { timer = 20; }
            setInterval(function () {
                detail.now_data = detail.helper.copy();
                detail.helper.reset();
                callback();
            }, timer);
        }
        game_interface.set_interval = set_interval;
    })(game_interface = plasma.game_interface || (plasma.game_interface = {}));
})(plasma || (plasma = {}));
document.addEventListener("mousedown", function (e) {
    plasma.game_interface.detail.helper.mouse_on = true;
    plasma.game_interface.detail.helper.mouse_click = true;
    plasma.game_interface.detail.helper.mouse_x = e.clientX;
    plasma.game_interface.detail.helper.mouse_y = e.clientY;
});
document.addEventListener("mouseup", function (e) {
    plasma.game_interface.detail.helper.mouse_on = false;
});
document.addEventListener("keydown", function (e) {
    plasma.game_interface.detail.helper.keyboardclick[e.keyCode] = true;
    plasma.game_interface.detail.helper.keyboardpress[e.keyCode] = true;
});
document.addEventListener("keyup", function (e) {
    plasma.game_interface.detail.helper.keyboardpress[e.keyCode] = false;
});
