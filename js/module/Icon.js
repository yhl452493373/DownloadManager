import Util from './Util.js'

class Icon {
    /**
     * 图标宽
     * @type {number}
     */
    iconWith = 128;

    /**
     * 图标高
     * @type {number}
     */
    iconHeight = 128;

    /**
     * 灰色图标（用于浏览器浅色模式）
     * @type {HTMLImageElement}
     */
    normalGrayIconImage = new Image();

    /**
     * 浅色图标（用于浏览器深色模式）
     * @type {HTMLImageElement}
     */
    normalLightIconImage = new Image();

    /**
     * 下载时图标（用于绘制进度）
     * @type {HTMLImageElement}
     */
    downloadingIconImage = new Image();

    /**
     * canvas绘图画布，用于绘图
     * @type {HTMLCanvasElement}
     */
    canvas = document.createElement("canvas");

    /**
     * context绘图上下文，用于绘图
     * @type {CanvasRenderingContext2D | null}
     */
    context = this.canvas.getContext('2d');

    /**
     * 浅色模式下的图标是否已加载
     * @type {boolean}
     */
    #grayIconLoaded = false;

    /**
     * 深色模式下的图标是否已加载
     * @type {boolean}
     */
    #lightIconLoaded = false;

    /**
     * 下载中图标是否已加载
     * @type {boolean}
     */
    #downloadingIconLoaded = false;

    /**
     * 下载总进度
     * @type {number}
     */
    #percent = 0;

    /**
     * 图标类型
     * @type {string}
     */
    #iconType = 'auto';

    /**
     * 是否在图标上显示下载进度
     * @type {string}
     */
    #iconProgress = 'off';

    constructor() {
        this.normalGrayIconImage.src = '/img/icon_gray.png';
        this.normalLightIconImage.src = '/img/icon_light.png';
        this.downloadingIconImage.src = '/img/icon_green.png';
        this.canvas.width = this.iconWith;
        this.canvas.height = this.iconHeight;

        //以下用于防止在icon被创建后，图标未完全加载，却执行了drawProcessIcon，导致未给浏览器的browserAction正确的绘制icon
        let that = this;
        this.normalGrayIconImage.onload = function () {
            that.#grayIconLoaded = true;
            if (that.#lightIconLoaded && that.#downloadingIconLoaded) {
                that.drawProcessIcon(that.#percent, that.#iconProgress, that.#iconType);
            }
        }
        this.normalLightIconImage.onload = function () {
            that.#lightIconLoaded = true;
            if (that.#grayIconLoaded && that.#downloadingIconLoaded) {
                that.drawProcessIcon(that.#percent, that.#iconProgress, that.#iconType);
            }
        }
        this.downloadingIconImage.onload = function () {
            that.#downloadingIconLoaded = true;
            if (that.#grayIconLoaded && that.#lightIconLoaded) {
                that.drawProcessIcon(that.#percent, that.#iconProgress, that.#iconType);
            }
        }
    }

    /**
     * 绘制进度图片
     * @param percent 进度，0 - 1.0
     */
    #drawGreenIcon(percent) {
        this.context.drawImage(this.downloadingIconImage, 0, 0, this.iconWith, this.iconHeight * percent, 0, 0, this.iconWith, this.iconHeight * percent);
    }

    /**
     * 浅色模式下进度图标的背景
     */
    #drawDarkIcon() {
        this.context.drawImage(this.normalGrayIconImage, 0, 0, this.iconWith, this.iconHeight);
    }

    /**
     * 深色模式下进度图标的背景
     */
    #drawLightIcon() {
        this.context.drawImage(this.normalLightIconImage, 0, 0, this.iconWith, this.iconHeight);
    }

    /**
     * 绘制进度图标
     * @param percent 进度 0 - 1.0
     * @param iconProgress {string} 是否在浏览器图标上显示下载进度。on-显示，off-不显示
     * @param iconType {string} 图标类型，auto-自动（未下载时，深色模式为浅色图标，浅色模式为深色图标0，dark-深色图标，light-浅色图标，不传默认浅色
     */
    drawProcessIcon(percent, iconProgress, iconType) {
        this.#percent = percent;
        this.#iconType = iconType;
        this.#iconProgress = iconProgress;
        iconType = Util.emptyString(iconType) ? 'light' : iconType;
        this.context.clearRect(0, 0, this.iconWith, this.iconHeight);
        if (iconType === 'auto') {
            if (Util.isDark()) {
                this.#drawLightIcon();
            } else {
                this.#drawDarkIcon();
            }
        } else if (iconType === 'light') {
            this.#drawLightIcon();
        } else if (iconType === 'dark') {
            this.#drawDarkIcon();
        }
        if (percent > 0) {
            this.#drawGreenIcon(iconProgress === 'on' ? percent : 1);
        }

        chrome.browserAction.setIcon({
            imageData: this.context.getImageData(0, 0, this.iconWith, this.iconHeight)
        });
    }
}

export default Icon;