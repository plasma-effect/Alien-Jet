/// <reference path="TypeScriptLibrary.ts"/>
var canvas :plasma.CanvasTraits;

enum Color {
    red, green, blue, yellow
}

enum ReturnType {
    nothing, jeted, through
}

class Alien {
    constructor(
        public x: number,
        public y: number,
        public speed: number,
        public color: Color,
        public flag: boolean = false) {
    }

    public run() {
        if (this.flag) {
            this.y -= 16;
            if (this.y < -80) return ReturnType.jeted;
        }
        else {
            this.x += this.speed;
            if (this.x > 640) return ReturnType.through;
        }
        return ReturnType.nothing;
    }
}

class SpeedData {
    public speed: number;
    public timer: number;
}

class GameSystem {
    public random_engine: () => number;
    public nexts: Array<Color>;
    public target: Color;
    public point: number;

    private generate_next() {
        var engine = plasma.random.uniformed_int_distribution(this.random_engine, 0, 11);
        this.nexts = [
            Color.blue, Color.green, Color.red, Color.yellow,
            Color.blue, Color.green, Color.red, Color.yellow,
            Color.blue, Color.green, Color.red, Color.yellow];
        for (var i = 0; i < 0x20; ++i) {
            var u = engine();
            var v = engine();
            var c = this.nexts[u];
            this.nexts[u] = this.nexts[v];
            this.nexts[v] = c;
        }
    }

    constructor(
        public aliens: Array<Alien>,
        public images: Array<HTMLImageElement>,
        public speed_data: Array<SpeedData>) {
        this.random_engine = plasma.random.make_xorshift(plasma.random.seed_generate());

        this.generate_next();
        this.target = <Color>this.random_engine() % 4;
        this.point = 0;
    }

    public run() {
        var flag = false;
        this.aliens = this.aliens.filter((value, index, array) => {
            var r = value.run();
            switch (r) {
                case ReturnType.jeted:
                    return false;
                case ReturnType.through:
                    if (this.target == value.color)
                        flag = true;
                    return false;
            }
            return true;
        });
        if (plasma.game_interface.mouse_click()) {
            var x = plasma.game_interface.mouse_x() - 8;
            var y = plasma.game_interface.mouse_y() - 7;

            this.aliens.forEach((value, index, array) => {
                if (!value.flag &&
                    value.x < x &&
                    value.x + 79 > x &&
                    value.y < y &&
                    value.y + 79 > y) {
                    if (this.target == value.color) {
                        ++this.point;
                        value.flag = true;
                    }
                    else {
                        flag = true;
                    }
                }
            });
        }
        if (this.aliens.every((value, index, array) => {
            return (value.flag || value.x > 0);
        })) {
            this.aliens.unshift(
                new Alien(-80, 200, this.speed_data[0].speed, this.nexts.shift()),
                new Alien(-80, 280, this.speed_data[0].speed, this.nexts.shift()),
                new Alien(-80, 360, this.speed_data[0].speed, this.nexts.shift()));
            if (this.nexts.length == 0) this.generate_next();
        }
        if (this.speed_data[0].timer > 0) {
            --this.speed_data[0].timer;
            canvas.draw_string("next:" + Math.floor(1 + this.speed_data[0].timer / 50) + "sec", 24, 0, 32, "azure");
        }
        if (this.speed_data[0].timer == 0) {
            this.speed_data.shift();
            this.aliens.forEach((value, index, array) => {
                value.speed = this.speed_data[0].speed;
            });
        }
        return flag;
    }

    public graphic() {
        this.aliens.forEach((value, index, array) => {
            canvas.draw_image(this.images[<number>value.color], value.x, value.y);
        });
        canvas.draw_rect(320, 0, 80, 80, "white");
        canvas.draw_image(this.images[<number>this.target], 320, 0);
        canvas.draw_string("to be clicked!!", 24, 400, 0, "azure");
        canvas.draw_string("point:" + this.point, 16, 0, 0, "azure");
    }
}

var game_system: GameSystem;
enum GameFlag {
    title, running, gameover
}
var game_flag: GameFlag;
var image: Array<HTMLImageElement>;
var diffculty: string;
var timer: number;

window.onload = () => {
    canvas = new plasma.CanvasTraits("field");
    game_flag = GameFlag.title;
    image = [new Image(), new Image(), new Image(), new Image()];
    image[Color.red]    .src = "red.png";
    image[Color.green]  .src = "green.png";
    image[Color.blue]   .src = "blue.png";
    image[Color.yellow] .src = "yellow.png";

    plasma.game_interface.set_interval(() => {
        canvas.draw_rect(0, 0, 640, 480, "black");
        canvas.draw_rect(0, 0, 640, 200, "blue");
        canvas.draw_rect(0, 200, 640, 240, "green");
        switch (game_flag) {
            case GameFlag.title:
                if (plasma.game_interface.mouse_click() &&
                    plasma.game_interface.mouse_x() - 8 > 0 &&
                    plasma.game_interface.mouse_x() - 8 < 640 &&
                    plasma.game_interface.mouse_y() - 7 > 0 &&
                    plasma.game_interface.mouse_y() - 7 <480) {
                    game_flag = GameFlag.running;
                    if (plasma.game_interface.keyboard_press(16))
                    {
                        diffculty = "ハードモード";
                        game_system = new GameSystem([], image, [
                            { speed: 4, timer: 1000 },
                            { speed: 5, timer: 1000 },
                            { speed: 6, timer: 1000 },
                            { speed: 7, timer: 1000 },
                            { speed: 8, timer: 1000 },
                            { speed: 9, timer: 1000 },
                            { speed: 10, timer: -1 }]);
                    }
                    else if (plasma.game_interface.keyboard_press(17)) {
                        diffculty = "デスモード";
                        game_system = new GameSystem([], image, [
                            { speed: 10, timer:-1  }]);
                    }else {
                        diffculty = "オリジナルモード";
                        game_system = new GameSystem([], image, [
                            { speed: 2, timer: 750 },
                            { speed: 3, timer: 750 },
                            { speed: 4, timer: 750 },
                            { speed: 5, timer: 750 },
                            { speed: 6, timer: 750 },
                            { speed: 7, timer: 750 },
                            { speed: 8, timer: 750 },
                            { speed: 9, timer: 750 },
                            { speed: 10, timer: -1 }]);
                    }
                }
                canvas.draw_string("Alien Jet", 64, 240, 208, "azure");
                canvas.draw_string("Click to Start", 32, 240, 272, "azure");
                break;
            case GameFlag.running:
                if (game_system.run()) {
                    timer = 50;
                    game_flag = GameFlag.gameover;
                }
                game_system.graphic();
                break;
            case GameFlag.gameover:
                if (timer > 0)--timer;
                if (plasma.game_interface.mouse_click()) {
                    if (plasma.game_interface.mouse_x() - 8 > 160 &&
                        plasma.game_interface.mouse_x() - 8 < 328 &&
                        plasma.game_interface.mouse_y() - 7 > 272 &&
                        plasma.game_interface.mouse_y() - 7 < 312) {
                        var url = "http://plasma-effect.github.io/Alien-Jet/AlienJet/AlienJet/index.html";
                        var text = encodeURIComponent(diffculty + "で" + game_system.point + "体のエイリアンをふっ飛ばした！");
                        var tag = "AlienJet";
                        window.open("https://twitter.com/intent/tweet?text=" + text + "&hashtags=" + tag + "&url=" + url);
                    }
                    else if(timer==0){
                        game_flag = GameFlag.title;
                    }
                }game_system.graphic();
                canvas.draw_string("GameOver", 64, 160, 208, "azure");
                canvas.draw_rect(160, 272, 128, 40, "red");
                canvas.draw_string("つぶやく", 32, 160, 272, "white");
                break;
        }
    }, 20);
}