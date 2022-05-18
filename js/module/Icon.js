import IconType from './IconType.js'

class Icon {
    /**
     * 下载中图标颜色
     * @type {string}
     */
    #green = '#11c54b';

    /**
     * 浅色图标颜色
     * @type {string}
     */
    #dark = '#5b5b5b';

    /**
     * 深色图标颜色
     * @type {string}
     */
    #light = '#ebedef';

    /**
     * 默认图标颜色
     * @type {string}
     */
    #default = '#2487fa';

    /**
     * 图标宽，由于svg是按128x128生成，所以这个写死128
     * @type {number}
     */
    #iconWith = 128;

    /**
     * 图标高，由于svg是按128x128生成，所以这个写死128
     * @type {number}
     */
    #iconHeight = 128;

    /**
     * 图标svg路径，尺寸为128x128
     * @type {Path2D}
     */
    #path = new Path2D('M 59.583 99.118 L 16.168 55.626 C 13.784 53.244 13.784 49.326 16.168 46.942 C 18.55 44.561 22.468 44.561 24.851 46.942 L 57.815 79.907 L 57.815 8.676 C 57.815 5.295 60.581 2.528 63.963 2.528 C 67.343 2.528 70.111 5.295 70.111 8.676 L 70.111 79.907 L 103.149 47.017 C 105.533 44.636 109.453 44.636 111.834 47.017 C 114.215 49.402 114.215 53.321 111.834 55.702 L 68.342 99.193 C 68.113 99.503 67.726 99.732 67.421 99.962 L 66.959 100.193 C 66.729 100.27 66.574 100.422 66.344 100.501 C 66.115 100.578 65.961 100.578 65.729 100.653 C 65.576 100.731 65.345 100.807 65.192 100.807 C 64.73 100.885 64.422 100.961 63.963 100.961 C 63.5 100.961 63.115 100.885 62.734 100.807 C 62.501 100.807 62.35 100.731 62.194 100.653 C 61.965 100.578 61.812 100.501 61.581 100.422 C 61.349 100.347 61.196 100.193 60.967 100.116 L 60.505 99.887 C 60.198 99.654 59.889 99.424 59.583 99.118 Z M 106.993 113.179 C 110.375 113.179 113.14 115.946 113.14 119.325 C 113.14 122.706 110.375 125.473 106.993 125.473 L 20.93 125.473 C 17.55 125.473 14.784 122.706 14.784 119.325 C 14.784 115.946 17.55 113.179 20.93 113.179 L 106.993 113.179 Z');

    /**
     * canvas绘图画布，用于绘图
     * @type {HTMLCanvasElement}
     */
    #canvas = new OffscreenCanvas(this.#iconWith, this.#iconHeight);

    /**
     * context绘图上下文，用于绘图
     * @type {CanvasRenderingContext2D}
     */
    #context = this.#canvas.getContext('2d');

    /**
     * 下载总进度
     * @type {number}
     */
    #percent = 0;

    /**
     * 图标类型
     * @type {IconType}
     */
    #iconType = IconType.auto;

    /**
     * 是否在图标上显示下载进度
     * @type {string}
     */
    #iconProgress = 'off';

    constructor() {

    }

    /**
     * 绘制下载中图标
     * @param percent 进度，0 - 1.0
     */
    #drawDownloadingIcon(percent) {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        let gradient = this.#context.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, this.#green);
        gradient.addColorStop(percent, this.#green);
        if (this.#iconType === IconType.light) {
            gradient.addColorStop(percent, this.#light);
            gradient.addColorStop(1, this.#light)
        } else if (this.#iconType === IconType.dark) {
            gradient.addColorStop(percent, this.#dark);
            gradient.addColorStop(1, this.#dark)
        } else {
            gradient.addColorStop(percent, this.#default);
            gradient.addColorStop(1, this.#default);
        }

        this.#context.fillStyle = gradient;
        this.#context.fill(this.#path);
    }

    /**
     * 绘制非下载状态下图标
     */
    #drawNormalIcon() {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#context.fillStyle = this.#iconType === IconType.dark ? this.#dark : this.#iconType === IconType.light ? this.#light : this.#default;
        this.#context.fill(this.#path);
    }

    /**
     * 设置使用的图标类型
     * @param iconType {IconType} 图标类型
     */
    setIconType(iconType) {
        this.#iconType = iconType == null ? IconType.default : iconType;
    }

    /**
     * 绘制进度图标
     * @param percent 进度 0 - 1.0
     * @param iconProgress {string} 是否在浏览器图标上显示下载进度。on-显示，off-不显示
     */
    drawProcessIcon(percent, iconProgress) {
        this.#percent = percent;
        this.#iconProgress = iconProgress;
        if (percent > 0) {
            this.#drawDownloadingIcon(iconProgress === 'on' ? percent : 1);
        } else {
            this.#drawNormalIcon();
        }
        chrome.action.setIcon({
            imageData: this.#context.getImageData(0, 0, this.#canvas.width, this.#canvas.height)
        });
    }
}

export default Icon;