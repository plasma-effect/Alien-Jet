//Copyright(c) 2015, plasma_effect
//All rights reserved.

//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:

//* Redistributions of source code must retain the above copyright notice, this
//list of conditions and the following disclaimer.

//* Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//and / or other materials provided with the distribution.

//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//DISCLAIMED.IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
//FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
//DAMAGES(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
//SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
//CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
//    OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
//OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


namespace plasma {
    export namespace utility {
        var date = new Date();
        export function get_time() {
            return date.getTime();
        }
    }

    export namespace random {
        export class XorShift {
            constructor(private seed: number) {
            }

            public run() {
                this.seed ^= (this.seed << 17);
                this.seed ^= (this.seed >> 9);
                this.seed ^= (this.seed << 8);
                this.seed ^= (this.seed >> 27);
                return this.seed;
            }
        }
        export function make_xorshift(seed: number) {
            var engine = new XorShift(seed);
            return () => {
                return engine.run();
            };
        }
        export function seed_generate() {
            var v = utility.get_time();
            v ^= (v << 19);
            v ^= (v >> 13);
            v ^= (v << 8);
            v ^= (v >> 21);
            return v;
        }

        export function uniformed_int_distribution(callback: () => number, min: number, max: number) {
            return () => {
                var x = callback();
                var m = Math.floor((1 << 30) / (max - min + 1)) * (max - min + 1);
                for (; x < 0 || x >= m; x = callback());
                return (x % (max - min + 1)) + min;
            };
        }
    }

    export class CanvasTraits {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        public flag: boolean;
        constructor(field_name: string) {
            this.canvas = <HTMLCanvasElement>document.getElementById(field_name);
            if (!this.canvas || !this.canvas.getContext) {
                this.flag = false;
            }
            else {
                this.ctx = this.canvas.getContext('2d');
                this.flag = true;
            }
        }

        public draw_string(
            str: string,
            size: number,
            offset_x: number,
            offset_y: number,
            style: string = "black"
        ) {
            if (!this.flag) return;
            this.ctx.fillStyle = style;
            this.ctx.font = size + "px 'メイリオ'";
            this.ctx.fillText(str, offset_x, offset_y + size);
        }

        public draw_rect(
            offset_x: number,
            offset_y: number,
            width: number,
            height: number,
            style: string = "black") {
            if (!this.flag) return;
            this.ctx.fillStyle = style;
            this.ctx.fillRect(offset_x, offset_y, width, height);
        }

        public draw_image(
            image: HTMLImageElement,
            offset_x: number,
            offset_y: number) {
            if (!this.flag) return;
            this.ctx.drawImage(image, offset_x, offset_y);
        }   
    }

    export namespace game_interface {
        export class interface_data{
            public mouse_on: boolean;
            public mouse_click: boolean;
            public mouse_x: number;
            public mouse_y: number;

            public keyboardpress: boolean[];
            public keyboardclick: boolean[];

            constructor() {
                this.keyboardpress = new Array<boolean>(0x100);
                this.keyboardclick = new Array<boolean>(0x100);
                for (var i = 0; i < 0x100; ++i)
                    this.keyboardpress[i] = false;
                this.mouse_on = false;
                this.reset();
            }

            public reset() {
                this.mouse_click = false;
                for (var i = 0; i < 0x100; ++i)
                    this.keyboardclick[i] = false;
            }

            public copy() {
                var ret = new interface_data();
                ret.keyboardclick = this.keyboardclick;
                ret.keyboardpress = this.keyboardpress;
                ret.mouse_click = this.mouse_click;
                ret.mouse_on = this.mouse_on;
                ret.mouse_x = this.mouse_x;
                ret.mouse_y = this.mouse_y;
                return ret;
            }
        }
        export namespace detail {
            export var helper = new interface_data();
            export var now_data = new interface_data();
        }

        export function mouse_on() {
            return detail.now_data.mouse_on;
        }
        export function mouse_click() {
            return detail.now_data.mouse_click;
        }

        export function mouse_x() {
            return detail.now_data.mouse_x;
        }
        export function mouse_y() {
            return detail.now_data.mouse_y;
        }
        export function keyboard_click(code: number) {
            return detail.now_data.keyboardclick[code];
        }
        export function keyboard_press(code: number) {
            return detail.now_data.keyboardpress[code];
        }

        export function set_interval(callback: () => void, timer: number = 20) {
            setInterval(() => {
                detail.now_data = detail.helper.copy();
                detail.helper.reset();
                callback();
            }, timer);
        }
    }
}
document.addEventListener("mousedown", (e) => {
    plasma.game_interface.detail.helper.mouse_on = true;
    plasma.game_interface.detail.helper.mouse_click = true;
    plasma.game_interface.detail.helper.mouse_x = e.clientX;
    plasma.game_interface.detail.helper.mouse_y = e.clientY;
});
document.addEventListener("mouseup", (e) => {
    plasma.game_interface.detail.helper.mouse_on = false;
});

document.addEventListener("keydown", (e) => {
    plasma.game_interface.detail.helper.keyboardclick[e.keyCode] = true;
    plasma.game_interface.detail.helper.keyboardpress[e.keyCode] = true;
});
document.addEventListener("keyup", (e) => {
    plasma.game_interface.detail.helper.keyboardpress[e.keyCode] = false;
});