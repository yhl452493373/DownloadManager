import DangerType from "./module/DangerType.js";
import State from "./module/State.js";
import DownloadItem from "./module/DownloadItem.js";
import DownloadDelta from "./module/DownloadDelta.js";
import Util from "./module/Util.js";
import Icon from "./module/Icon.js";
import IconType from "./module/IconType.js";
import OSType from "./module/OSType.js";

Util.osType().then(async os => {

    const osType = OSType.toEnum(os);

    // 隐藏下载界面
    await chrome.downloads.setUiOptions({enabled: false});

    /**
     * action的图标
     * @type {Icon}
     */
    let icon = new Icon();

    /**
     * 设置的图标类型
     * @type {IconType}
     */
    let iconType = osType === OSType.mac ? IconType.auto : IconType.dark;

    /**
     * 定时获取下载进度
     * @type {number}
     */
    let timer;

    /**
     * 正在下载的项.其他状态(暂停,取消,删除)会从里面删除
     * @type [DownloadItem]
     */
    let downloadingItems = [];

    /**
     * 缓存的下载项的图标
     * @type {{}}
     */
    let itemIcons = {};

    /**
     * 是否正在轮询获取下载进度
     * @type {boolean}
     */
    let pollProgressRunning = false;

    /**
     * 是否开启通知
     * @type {string}
     */
    let notice = 'off';

    /**
     * 是否播放下载完成声音
     * @type {string}
     */
    let sound = 'off';

    /**
     * 清空时是否删除文件
     * @type {string}
     */
    let deleteFile = 'off';

    /**
     * 在下载图标上显示下载进度
     * @type {string}
     */
    let iconProgress = 'off';

    /**
     * 是否在下载文件。是，则不会改变图标，因为图标会跟随进度改变
     * @type {boolean}
     */
    let downloading = false;

    /**
     * 触发创建下载事件，将其信息存入下载中的项目列表
     */
    chrome.downloads.onCreated.addListener(async downloadItemInfo => {
        let existItem = downloadingItems.find(item => item.id === downloadItemInfo.id);
        let downloadItem = new DownloadItem(downloadItemInfo);
        if (!existItem && downloadItem.state !== State.complete && downloadItem.state !== State.interrupted) {
            downloadingItems.push(downloadItem);
        }
        startPolling();
        //若能获取到文件名，则创建下载项（已有必要数据：id，filename）
        if (downloadItem.filename) {
            await Util.sendMessage({
                method: 'createDownloadItem',
                data: downloadItem
            });
        }
    });

    chrome.downloads.onChanged.addListener(async downloadDeltaInfo => {
        let downloadDelta = new DownloadDelta(downloadDeltaInfo);
        cacheIcon(downloadDelta.id);
        changeActionIcon();
        await createDownloadItem(downloadDelta);
        startPolling();
        //检测到文件名变化(由无->有)说明开始下载
        if (downloadDelta.filename.isNotEmpty() && Util.emptyString(downloadDelta.filename.previous) && downloadDelta.filename.current) {
            if (Array.isArray(notice) && notice.indexOf('start') !== -1) {
                chrome.notifications.create('start-' + downloadDelta.id, {
                    type: 'basic',
                    title: chrome.i18n.getMessage('downloadStart'),
                    message: chrome.i18n.getMessage('downloadStart') + '：' + Util.filename(downloadDelta.filename.current),
                    iconUrl: itemIcons[downloadDelta.id] && itemIcons[downloadDelta.id].icon || Icon.notificationIcon,
                    isClickable: true
                });
            }
        }
        //检测到危险程度变化(变为不安全且不为允许下载不安全文件),说明需要提示有安全问题
        if (downloadDelta.danger.isNotEmpty() && downloadDelta.danger.current !== DangerType.safe.code && downloadDelta.danger.current !== DangerType.accepted.code) {
            if (Array.isArray(notice) && notice.indexOf('danger') !== -1) {
                chrome.notifications.getPermissionLevel(level => {
                    if (level === 'granted') {
                        chrome.downloads.search({id: downloadDelta.id}, results => {
                            if (Array.isArray(results) && results.length > 0) {
                                chrome.notifications.create('danger-' + downloadDelta.id, {
                                    type: 'basic',
                                    title: chrome.i18n.getMessage('safetyWaring'),
                                    message: Util.filename(results[0].filename),
                                    contextMessage: DangerType.valueOf(downloadDelta.danger.current).name,
                                    iconUrl: itemIcons[downloadDelta.id].icon || Icon.notificationIcon,
                                    isClickable: true
                                });
                            }
                        });
                    }
                });
            }
        }
        //检测到状态变化
        if (downloadDelta.state.isNotEmpty()) {
            //状态由其他变为完成,说明下载完成
            if (downloadDelta.state.current === State.complete.code) {
                playSound();
                removeNotDownloadingItem(downloadDelta.id);
                //下载项变为完成状态，通知页面渲染为完成状态
                await Util.sendMessage({
                    method: 'downloadComplete',
                    data: downloadDelta
                });
                if (Array.isArray(notice) && notice.indexOf('complete') !== -1) {
                    chrome.notifications.getPermissionLevel(level => {
                        if (level === 'granted') {
                            chrome.downloads.search({id: downloadDelta.id}, results => {
                                if (Array.isArray(results) && results.length > 0) {
                                    chrome.notifications.create('complete-' + downloadDelta.id, {
                                        type: 'basic',
                                        title: chrome.i18n.getMessage('downloadComplete'),
                                        message: results[0].filename,
                                        iconUrl: itemIcons[downloadDelta.id].icon || Icon.notificationIcon,
                                        buttons: [{
                                            title: chrome.i18n.getMessage('open'),
                                        }, {
                                            title: chrome.i18n.getMessage('openFolder'),
                                        }],
                                        isClickable: true
                                    });
                                }
                            });
                        }
                    });
                }
            } else if (downloadDelta.state.current === State.interrupted.code) {
                removeNotDownloadingItem(downloadDelta.id);
                //下载项取消，通知页面渲染为取消下载状态
                await Util.sendMessage({
                    method: 'cancelDownloadItem',
                    data: downloadDelta
                });
            }
        }
        //检测到暂停情况发生变化
        if (downloadDelta.paused.isNotEmpty()) {
            //由其他状态变为暂停,说明下载暂停
            if (downloadDelta.paused.current) {
                removeNotDownloadingItem(downloadDelta.id);
                if (downloadDelta.canResume.current) {
                    //从下载变为暂停,并且可以恢复
                    await Util.sendMessage({
                        method: 'pauseDownloadItem',
                        data: downloadDelta.id
                    });
                } else {
                    //从下载变为暂停,并且不可恢复
                    await Util.sendMessage({
                        method: 'cancelDownloadItem',
                        data: downloadDelta
                    });
                }
            } else {
                //从暂停变为下载,并且之前状态指明可以恢复
                if (downloadDelta.canResume.previous) {
                    //开始下载点击的项，因为poll时如果只有1个项，timeout会被clear，因此需要调用此法重新poll
                    startPolling();
                } else {
                    //从暂停变为下载,并且之前状态指明不可恢复,则取消下载
                    await Util.sendMessage({
                        method: 'cancelDownloadItem',
                        data: downloadDelta
                    });
                }
                if (Array.isArray(notice) && notice.indexOf('start') !== -1) {
                    let downloadItem = downloadingItems.find(item => item.id === downloadDelta.id);
                    if (downloadItem) {
                        chrome.notifications.create('start-' + downloadItem.id, {
                            type: 'basic',
                            title: chrome.i18n.getMessage('downloadStart'),
                            message: chrome.i18n.getMessage('downloadStart') + '：' + downloadItem.simpleFilename,
                            iconUrl: itemIcons[downloadDelta.id].icon || Icon.notificationIcon,
                            isClickable: true
                        });
                    }
                }
            }
        }

        if (downloadDelta.exists.isNotEmpty() && !downloadDelta.exists.current) {
            //文件不存在，则删除
            chrome.downloads.erase({
                id: downloadDelta.id
            });
        }
    });

    chrome.downloads.onErased.addListener(async id => {
        //发送消除下载请求
        await Util.sendMessage({
            method: 'eraseDownloadItem',
            data: id
        });
        //删除文件时,将其从下载项列表移除
        removeNotDownloadingItem(id);
    });

    chrome.downloads.search({}, results => {
        results.filter(item => !Util.emptyString(item.filename)).forEach(result => {
            cacheIcon(result.id);
        });
    });

    chrome.runtime.onMessage.addListener((message, sender, response) => {
        if (chrome.runtime.lastError) {
            let msg = chrome.runtime.lastError;
        }
        if (message.method === 'pollProgress') {
            startPolling();
        } else if (message.method === 'cacheIcon') {
            cacheIcon(message.data);
        } else if (message.method === 'deleteIconCache') {
            //删除已缓存的图标
            delete itemIcons[message.data];
        } else if (message.method === 'changeActionIcon') {
            //main,options页面请求
            if (typeof message.data === "string") {
                icon.setIconType(IconType.toEnum(message.data));
            } else if (typeof message.data === 'number') {
                removeNotDownloadingItem(message.data);
            }
            changeActionIcon();
        } else if (message.method === 'changeNotice') {
            //options页面请求
            notice = message.data;
        } else if (message.method === 'changeSound') {
            //options页面请求
            sound = message.data;
        } else if (message.method === 'alsoDeleteFile') {
            //options页面请求
            deleteFile = message.data;
        } else if (message.method === 'alsoDeleteFileState') {
            //main页面获取deleteFile状态
        } else if (message.method === 'iconProgress') {
            //options页面请求
            iconProgress = message.data;
        }
        Util.responseMessage(response);
        return true;
    });

    chrome.notifications.onClicked.addListener(id => {
        if (id.indexOf('danger') !== -1) {
        }
        chrome.notifications.clear(notificationId);
    });

    chrome.notifications.onButtonClicked.addListener((id, index) => {
        chrome.notifications.clear(id);
        if (id.indexOf("complete") > -1) {
            if (index === 0) {
                chrome.downloads.open(parseInt(id.substring(id.indexOf("-") + 1)));
            } else if (index === 1) {
                chrome.downloads.show(parseInt(id.substring(id.indexOf("-") + 1)));
            }
        }
    });

    /**
     * 恢复配置后执行
     * @param obj {{}}
     */
    function afterRestoreOption(obj) {
        return new Promise(async resolve => {
            notice = obj.downloadNotice;
            sound = obj.downloadSound;
            deleteFile = obj.alsoDeleteFile;
            iconProgress = obj.iconProgress;
            iconType = IconType.toEnum(obj.iconType);
            iconType = iconType === IconType.auto ? (osType === OSType.mac ? iconType : IconType.dark) : iconType;
            icon.setIconType(iconType);
            if (iconType !== IconType.auto) {
                changeActionIcon();
            } else {
                await autoChangeActionIcon();
            }
            resolve();
        });
    }

    /**
     * 从云端恢复
     */
    function restoreOptionFromCloud() {
        return new Promise(async resolve => {
            const cloudData = await Util.getCloudStorage({
                iconType: osType === OSType.mac ? IconType.auto.toString() : IconType.dark.toString(),
                downloadNotice: 'off',
                downloadSound: 'off',
                alsoDeleteFile: 'off',
                iconProgress: 'off'
            });
            await Util.setLocalStorage(cloudData);
            await afterRestoreOption(cloudData);
            resolve(cloudData);
        });
    }

    /**
     * 从本地储存恢复
     */
    function restoreOptionFromLocal() {
        return new Promise(async resolve => {
            const localData = await Util.getLocalStorage({
                iconType: osType === OSType.mac ? IconType.auto.toString() : IconType.dark.toString(),
                downloadNotice: 'off',
                downloadSound: 'off',
                alsoDeleteFile: 'off',
                iconProgress: 'off'
            });
            await afterRestoreOption(localData);
            resolve(localData);
        });
    }

    /**
     * 实时获取下载信息
     */
    function pollProgress() {
        pollProgressRunning = true;
        let startTime = new Date().getTime();
        /**
         * 查找正在下载的项
         */
        chrome.downloads.search({state: State.in_progress.code, paused: false}, async results => {
            setActionIcon(results);
            if (results.length === 0) {
                downloading = false;
                pollProgressRunning = false;
                startTime = null;
            } else {
                downloading = true;
                /**
                 * 计算下载速度和下载进度
                 */
                results.forEach(file => {
                    /**
                     * file的字段大致与DownloadItem相同，但是需要进行转换。具体字段参考 {@link https://crxdoc-zh.appspot.com/extensions/downloads#type-DownloadItem}
                     */
                    let downloadingItem = downloadingItems.find(item => item.id === file.id);
                    if (downloadingItem === undefined) {
                        downloadingItem = new DownloadItem(file);
                        //若没有id相同的，则视为新增下载
                        downloadingItems.push(downloadingItem);
                    } else {
                        //若有id相同的，则视为已有下载
                        downloadingItem.init(file, downloadingItem.bytesReceived);
                    }
                });
                //发送更新文件进度请求
                await Util.sendMessage({
                    method: 'updateProgress',
                    data: downloadingItems
                });
                timer = setTimeout(() => {
                    clearTimeout(timer);
                    pollProgress();
                }, 1000 - (new Date().getTime() - startTime));
            }
        });
    }

    /**
     * 移除downloadingItems中非下载中的项.如果不传,则会删除所有非下载中的项
     * @param id {number?}
     */
    function removeNotDownloadingItem(id) {
        if (id == null) {
            chrome.downloads.search({paused: false}, function (results) {
                results.forEach(result => {
                    downloadingItems.splice(downloadingItems.findIndex(item => item.id === result.id), 1);
                });
            });
        } else {
            downloadingItems.splice(downloadingItems.findIndex(item => item.id === id), 1);
        }
    }

    /**
     * 缓存图标：如果图标已存在，则直接发送更新图标请求
     * 所有最终更新图标的请求都在这里发起
     *
     * @param id {number} 图标对应的下载对象id
     * @param callback {function(iconPath:string)?} 缓存后的回掉，用于立即更新图标
     */
    function cacheIcon(id, callback) {
        chrome.downloads.getFileIcon(id, {
            size: 32
        }, async icon => {
            //删除时会触发chrome.downloads.onChange，若文件已经删除，再去获取其图标会报错：downloadId错误，加入chrome.runtime.lastError进行容错处理
            if (!chrome.runtime.lastError && icon) {
                if (itemIcons.hasOwnProperty(id)) {
                    //若已有缓存记录
                    if (itemIcons[id] !== icon) {
                        //已有的和获取到的不同，则更新
                        itemIcons[id].icon = icon;
                    }
                } else {
                    //否则不做处理
                    itemIcons[id] = {
                        id: id,
                        icon: icon
                    };
                }
                await Util.sendMessage({
                    method: 'updateIcon',
                    data: itemIcons[id]
                });
                callback && callback(itemIcons[id]);
            }
        });
    }

    /**
     * 根据搜索结果改变浏览器中插件的图标
     */
    function changeActionIcon() {
        if (downloadingItems.length === 0) {
            if (downloading)
                return;
            icon.drawProcessIcon(0, iconProgress);
        }
        chrome.downloads.search({state: State.in_progress.code, paused: false}, results => {
            results = results.filter(item => !Util.emptyString(item.filename));
            setActionIcon(results);
        });
    }

    /**
     * 根据下载项数量改变浏览器中插件的图标
     */
    function setActionIcon(results) {
        /**
         * 总文件大小，若总大小为负数，则表示有文件的大小无法获取，进度图标须一直为100%，否则为receivedSize/totalSize
         * @type {number}
         */
        let totalSize = 0;

        /**
         * 已下载文件大小
         * @type {number}
         */
        let receivedSize = 0;

        if (results) {
            results.forEach(file => {
                let downloadItem = new DownloadItem(file);
                totalSize += downloadItem.totalBytes;
                if (downloadItem.totalBytes === 0)
                    totalSize = Math.abs(totalSize) * -1 + -1;
                receivedSize += downloadItem.bytesReceived;
            });
            results = results.filter(item => !Util.emptyString(item.filename));
            chrome.action.setBadgeText({
                text: results.length === 0 ? '' : (results.length + '')
            });
            if (results.length === 0) {
                icon.drawProcessIcon(0, iconProgress);
            } else {
                icon.drawProcessIcon(totalSize === 0 ? 0 : totalSize < 0 ? 1 : (receivedSize / totalSize), iconProgress);
            }
        }
    }

    /**
     * 开始获取下载信息
     */
    function startPolling() {
        if (!pollProgressRunning)
            pollProgress();
    }

    /**
     * 发送消息给main页面，创建下载项
     * @param downloadDelta {DownloadDelta}
     */
    async function createDownloadItem(downloadDelta) {
        let existItem = downloadingItems.find(item => item.id === downloadDelta.id);
        if (existItem == null)
            return;
        if (!Util.emptyString(downloadDelta.filename.current)) {
            existItem.filename = downloadDelta.filename.current;
            existItem.getSimpleFilename();
        }
        await Util.sendMessage({
            method: 'createDownloadItem',
            data: existItem
        });
    }

    /**
     * 播放音频
     */
    async function playSound() {
        if (sound === 'on') {
            await Util.sendMessage({
                method: 'playSound'
            });
        }
    }

    /**
     * 创建离屏窗口来获取深色模式、播放下载完成声音
     */
    async function createOffscreenDocument() {
        try {
            if (await chrome.offscreen.hasDocument()) {
                console.log('Offscreen document already exists');
                return;
            }
            await chrome.offscreen.createDocument({
                url: 'offscreen.html',
                reasons: ['AUDIO_PLAYBACK', 'MATCH_MEDIA'],
                justification: 'Play downloaded audio and detect dark mode'
            });
        } catch (error) {
            console.error('Error maintaining offscreen document:', error);
        }
    }

    /**
     * 浏览器模式自动改变图标
     */
    async function autoChangeActionIcon() {
        const localData = await Util.getLocalStorage({
            iconType: osType === OSType.mac ? IconType.auto.toString() : IconType.dark.toString()
        });
        if (localData.iconType === IconType.auto.toString()) {
            await Util.sendMessage({
                method: 'detectIconType',
            });
        }
    }

    //插件第一次安装时，从云端恢复配置
    chrome.runtime.onInstalled.addListener(async () => {
        await restoreOptionFromCloud();
        startPolling();
    });

    //标签页激活时监听
    chrome.tabs.onActivated.addListener(async (activeTabInfo) => {
        await autoChangeActionIcon();
    });

    //窗口焦点改变时，重新绘制图标
    chrome.windows.onFocusChanged.addListener(async () => {
        await autoChangeActionIcon();
    });

    await createOffscreenDocument();
    await restoreOptionFromLocal();
    startPolling();
});
