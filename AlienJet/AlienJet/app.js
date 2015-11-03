var canvas;
var Color;
(function (Color) {
    Color[Color["red"] = 0] = "red";
    Color[Color["green"] = 1] = "green";
    Color[Color["blue"] = 2] = "blue";
    Color[Color["yellow"] = 3] = "yellow";
})(Color || (Color = {}));
var ReturnType;
(function (ReturnType) {
    ReturnType[ReturnType["nothing"] = 0] = "nothing";
    ReturnType[ReturnType["jeted"] = 1] = "jeted";
    ReturnType[ReturnType["through"] = 2] = "through";
})(ReturnType || (ReturnType = {}));
var Alien = (function () {
    function Alien(x, y, speed, color, flag) {
        if (flag === void 0) { flag = false; }
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.color = color;
        this.flag = flag;
    }
    Alien.prototype.run = function () {
        if (this.flag) {
            this.y -= 16;
            if (this.y < -80)
                return ReturnType.jeted;
        }
        else {
            this.x += this.speed;
            if (this.x > 640)
                return ReturnType.through;
        }
        return ReturnType.nothing;
    };
    return Alien;
})();
var SpeedData = (function () {
    function SpeedData() {
    }
    return SpeedData;
})();
var GameSystem = (function () {
    function GameSystem(aliens, images, speed_data) {
        this.aliens = aliens;
        this.images = images;
        this.speed_data = speed_data;
        this.random_engine = plasma.random.make_xorshift(plasma.random.seed_generate());
        this.generate_next();
        this.target = this.random_engine() % 4;
        this.point = 0;
    }
    GameSystem.prototype.generate_next = function () {
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
    };
    GameSystem.prototype.run = function () {
        var _this = this;
        var flag = false;
        this.aliens = this.aliens.filter(function (value, index, array) {
            var r = value.run();
            switch (r) {
                case ReturnType.jeted:
                    return false;
                case ReturnType.through:
                    if (_this.target == value.color)
                        flag = true;
                    return false;
            }
            return true;
        });
        if (plasma.game_interface.mouse_click()) {
            var x = plasma.game_interface.mouse_x() - 8;
            var y = plasma.game_interface.mouse_y() - 7;
            this.aliens.forEach(function (value, index, array) {
                if (!value.flag &&
                    value.x < x &&
                    value.x + 79 > x &&
                    value.y < y &&
                    value.y + 79 > y) {
                    if (_this.target == value.color) {
                        ++_this.point;
                        value.flag = true;
                    }
                    else {
                        flag = true;
                    }
                }
            });
        }
        if (this.aliens.every(function (value, index, array) {
            return (value.flag || value.x > 0);
        })) {
            this.aliens.unshift(new Alien(-80, 200, this.speed_data[0].speed, this.nexts.shift()), new Alien(-80, 280, this.speed_data[0].speed, this.nexts.shift()), new Alien(-80, 360, this.speed_data[0].speed, this.nexts.shift()));
            if (this.nexts.length == 0)
                this.generate_next();
        }
        if (this.speed_data[0].timer > 0) {
            --this.speed_data[0].timer;
            canvas.draw_string("next:" + Math.floor(1 + this.speed_data[0].timer / 50) + "sec", 24, 0, 32, "azure");
        }
        if (this.speed_data[0].timer == 0) {
            this.speed_data.shift();
            this.aliens.forEach(function (value, index, array) {
                value.speed = _this.speed_data[0].speed;
            });
        }
        return flag;
    };
    GameSystem.prototype.graphic = function () {
        var _this = this;
        this.aliens.forEach(function (value, index, array) {
            canvas.draw_image(_this.images[value.color], value.x, value.y);
        });
        canvas.draw_rect(320, 0, 80, 80, "white");
        canvas.draw_image(this.images[this.target], 320, 0);
        canvas.draw_string("to be clicked!!", 24, 400, 0, "azure");
        canvas.draw_string("point:" + this.point, 16, 0, 0, "azure");
    };
    return GameSystem;
})();
var game_system;
var GameFlag;
(function (GameFlag) {
    GameFlag[GameFlag["title"] = 0] = "title";
    GameFlag[GameFlag["running"] = 1] = "running";
    GameFlag[GameFlag["gameover"] = 2] = "gameover";
})(GameFlag || (GameFlag = {}));
var game_flag;
var image;
window.onload = function () {
    canvas = new plasma.CanvasTraits("field");
    game_flag = GameFlag.title;
    image = [new Image(), new Image(), new Image(), new Image()];
    image[Color.red].src = "red.png";
    image[Color.green].src = "green.png";
    image[Color.blue].src = "blue.png";
    image[Color.yellow].src = "yellow.png";
    plasma.game_interface.set_interval(function () {
        canvas.draw_rect(0, 0, 640, 480, "black");
        canvas.draw_rect(0, 0, 640, 200, "blue");
        canvas.draw_rect(0, 200, 640, 240, "green");
        switch (game_flag) {
            case GameFlag.title:
                if (plasma.game_interface.mouse_click()) {
                    game_flag = GameFlag.running;
                    game_system = new GameSystem([], image, [
                        { speed: 1, timer: 750 },
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
                canvas.draw_string("Alien Jet", 64, 240, 208, "azure");
                break;
            case GameFlag.running:
                if (game_system.run())
                    game_flag = GameFlag.gameover;
                game_system.graphic();
                break;
            case GameFlag.gameover:
                if (plasma.game_interface.mouse_click())
                    game_flag = GameFlag.title;
                game_system.graphic();
                canvas.draw_string("GameOver", 64, 160, 208, "azure");
                break;
        }
    }, 20);
};
