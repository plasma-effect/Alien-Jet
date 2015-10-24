var ctx: CanvasRenderingContext2D;

namespace random_number {
    class XorShift {
        constructor(private seed: number) {
        }

        public run(): number {
            this.seed ^= (this.seed << 13);
            this.seed ^= (this.seed >> 21);
            this.seed ^= (this.seed << 8);
            this.seed ^= (this.seed >> 17);
            return this.seed;
        }
    }
    export var ran = new XorShift((new Date).getTime());
    export function random() {
        return ((ran.run() % 4) + 4) % 4;
    }

    export function int_distribute(m: number) {
        var x = ran.run();
        var max = Math.floor((1 << 31) / m) * m;
        for (; x < 0 || x >= max; x = ran.run());
        return x % m;
    }

    export function make_numbers(m: number) {
        if (m == 0) return new Array<number>(0);
        m -= 1;
        var ret = [0];
        for (var v = 1; v < m; ++v) {
            var x = int_distribute(v);
            var y = ret[x];
            ret[x] = v;
            ret.unshift(y);
        }
        return ret;
    }
}

namespace mouse {
    export var mouse_x = 0;
    export var mouse_y = 0;
    export var mouse_on = false;
}
document.addEventListener('click', (e) => {
    mouse.mouse_x = e.clientX - 8;
    mouse.mouse_y = e.clientY - 7;
    mouse.mouse_on = true;
});

namespace enter {
    export var enter_on: boolean;
}
document.addEventListener("keydown", (e) => {
    enter.enter_on = e.keyCode == 229;
});

namespace enemy_data {
    export enum Color { Red, Blue, Yellow, Green };
    export enum GameFlag { Nothing, OK, Gameover };
    export var enemy_image: Array<HTMLImageElement>;
    export class Alien {
        private flag: boolean;

        constructor(
            private x: number,
            private y: number,
            private speed: number,
            public color: Color) {
        }

        public run(
            target: Color) {
            if (this.flag) {
                this.y += 10;
                return GameFlag.Nothing;
            }
            else {
                if (mouse.mouse_on &&
                    this.x >= mouse.mouse_x &&
                    this.x < mouse.mouse_x + 80 &&
                    this.y >= mouse.mouse_y &&
                    this.y < mouse.mouse_y + 80) {
                    mouse.mouse_on = false;
                    this.flag = true;
                    return target == this.color ? GameFlag.OK : GameFlag.Gameover;
                }
                this.x += this.speed;
                if (this.x >= 640 && this.color == target) return GameFlag.Gameover;
                return GameFlag.Nothing;
            }
        }

        public graphic() {
            ctx.drawImage(enemy_image[this.color], this.x, this.y);
        }

        public exist() {
            return this.x < 640 && this.y > 0;
        }

        public speed_change(n: number) {
            this.speed = n;
        }

        public appear() {
            return this.flag || this.x >= 0;
        }
    }
}

class GameProcess {
    private aliens: Array<enemy_data.Alien>;
    private nexts: Array<Array<enemy_data.Alien>>;
    private now_time: number;
    private now_level: number;
    private target: enemy_data.Color;
    private point: number;
    private timer: number;
    private mode: boolean;

    constructor(
        private speed: Array<number>,
        private time: Array<number>) {
        this.generate_next();
        this.now_level = 0;
        this.target = random_number.int_distribute(4);
        this.point = 0;
        this.timer = 0;
        this.mode = true;
        
    }

    private generate_next() {
        var ar = random_number.make_numbers(12);
        for (var i = 0; i < 4; ++i) {
            this.nexts.unshift([
                new enemy_data.Alien(-80, 230 + 0 * 80, this.speed[this.now_level], ar[3 * i]),
                new enemy_data.Alien(-80, 230 + 1 * 80, this.speed[this.now_level], ar[3 * i + 1]),
                new enemy_data.Alien(-80, 230 + 2 * 80, this.speed[this.now_level], ar[3 * i + 2])]);
        }
    }

    public run() {
        if (this.mode) {
            this.aliens.forEach((value, index, array) => {
                var v = value.run(this.target);
                switch (v) {
                    case enemy_data.GameFlag.OK:
                        ++this.point;
                        break;
                    case enemy_data.GameFlag.Gameover:
                        this.mode = false;
                }
            });
            ++this.timer;
            if (this.time[this.now_level] == this.timer) {
                ++this.now_level;
                this.aliens.forEach((value, i, a) => value.speed_change(this.speed[this.now_level]));
            }
            if (this.aliens.every((value, i, a) => value.appear())) {
                var next = this.nexts.shift();
                this.aliens.unshift(next[0], next[1], next[2]);
                if (this.nexts.length == 0) this.generate_next();
            }
        }
        else {
            if (enter.enter_on) {
                enter.enter_on = false;
                return true;
            }
        }
        return false;
    }
    public graphic() {
        this.aliens = this.aliens.filter((value, index, array) => {
            if (value.exist()) {
                value.graphic();
                return true;
            }
            else return false;
        });
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(320, 0, 80, 80);
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(321, 1, 78, 78);
        ctx.drawImage(enemy_data.enemy_image[this.target], 320, 0);
        ctx.font = "24px 'ＭＳ Ｐゴシック'";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("をクリック！", 400, 0);
        ctx.font = "16px 'ＭＳ Ｐゴシック'";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("SCORE: " + this.point.toString(), 0, 0);
        if (!this.mode) {
            ctx.font = "64px 'ＭＳ Ｐゴシック'";
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText("GameOver!!(press Space Key)\n" + this.point.toString() + "体のエイリアンをふっ飛ばしました", 32, 280);
        }
    }
}
var game_process: GameProcess = null;

function loop() {
    random_number.ran.run();
    ctx.fillStyle = "rgb(153, 217, 234)";
    ctx.fillRect(0, 0, 640, 230);
    ctx.fillStyle = "rgb(34, 177, 76)";
    ctx.fillRect(0, 230, 640, 240);

    if (game_process != null) {
        if (game_process.run()) {
            game_process = null;
            return;
        }
        game_process.graphic();
    }
    else {
        ctx.font = "64px 'ＭＳ Ｐゴシック'";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("Alien Jet", 280, 280);
        if (mouse.mouse_on) {
            mouse.mouse_on = false;
            game_process = new GameProcess([1, 2, 3], [500, 1000, 0]);
        }
    }
    return false;
}

window.onload = () => {
    var canvas = <HTMLCanvasElement>document.getElementById('field');
    if (!canvas || !canvas.getContext) return false;
    ctx = canvas.getContext('2d');
    var flags = [false, false, false, false];
    enemy_data.enemy_image = [new Image(), new Image(), new Image(), new Image()];

    enemy_data.enemy_image[enemy_data.Color.Red].src = "red.png";
    enemy_data.enemy_image[enemy_data.Color.Blue].src = "blue.png";
    enemy_data.enemy_image[enemy_data.Color.Yellow].src = "yellow.png";
    enemy_data.enemy_image[enemy_data.Color.Green].src = "green.png";

    game_process = null;

    setInterval(loop, 20);
};
