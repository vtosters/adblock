// ==UserScript==
// @name         VK Ads Fixes
// @name:ru      Правки рекламы ВКонтакте
// @namespace    https://vtosters.app/
// @version      0.8
// @description  This script applies several fixes to the adblock filter on VK, aiming to speed up site loading and enhance overall performance.
// @description:ru Этот скрипт вносит несколько исправлений в фильтр adblock в VK, чтобы ускорить загрузку сайта и повысить общую производительность.
// @author       gdlbo
// @match        https://vk.com/*
// @match        https://vk.ru/*
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/499839/VK%20Ads%20Fixes.user.js
// @updateURL https://update.greasyfork.org/scripts/499839/VK%20Ads%20Fixes.meta.js
// ==/UserScript==

(function () {
    'use strict';

    class InteractionListener {
        constructor() {
            this._listeners = [];
        }

        addListener(callback) {
            if (!this._listeners.includes(callback)) {
                this._listeners.push(callback);
            }
            return {
                remove: () => this.removeListener(callback),
            };
        }

        removeListener(callback) {
            const index = this._listeners.indexOf(callback);
            if (index !== -1) {
                this._listeners.splice(index, 1);
            }
        }

        get listeners() {
            return [...this._listeners];
        }
    }

    const interaction = new InteractionListener();

    const hookVK = async () => {
        let vkValue = window.vk;

        Object.defineProperty(window, "vk", {
            get: () => vkValue,
            set: (newVk) => {
                vkValue = newVk;
                for (const callback of interaction.listeners) {
                    try {
                        callback(vkValue);
                    } catch (e) {
                        console.error(e);
                    }
                }
                return true;
            },
            configurable: true,
        });
    };

    let inited = false;
    const onAddNewCallback = async (callback) => {
        if (inited) {
            // await waitVK();
        } else {
            inited = true;
            await hookVK();
        }

        callback(window.vk);
    };

    const onChangeVK = (callback) => {
        const listener = interaction.addListener(callback);

        onAddNewCallback(callback);

        return listener;
    };

    const createOnChangeVKField = (fieldName) => {
        const interaction = new InteractionListener();

        const hookField = (vkValue) => {
            let fieldValue = vkValue[fieldName];

            Object.defineProperty(vkValue, fieldName, {
                get: () => fieldValue,
                set: (newValue) => {
                    fieldValue = newValue;
                    for (const callback of interaction.listeners) {
                        try {
                            callback(fieldValue);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return true;
                },
                configurable: true,
                enumerable: true,
            });
        };

        const hookFieldWithVK = async () => {
            let vkValue = window.vk;

            hookField(vkValue);

            onChangeVK((newVk) => {
                hookField(newVk);
            });
        };

        let inited = false;
        const onAddNewCallback = async (callback) => {
            if (!inited) {
                inited = true;
                await hookFieldWithVK();
            }
            callback(window.vk[fieldName]);
        };

        const onChangeField = (callback) => {
            const listener = interaction.addListener(callback);
            onAddNewCallback(callback);
            return listener;
        };

        return onChangeField;
    };

    const onChangeVKPart = createOnChangeVKField("pe");
    const onChangeAudioAdsConfig = createOnChangeVKField("audioAdsConfig");
    const onChangeErrorMonitoringConfig = createOnChangeVKField("cfg");

    const modifyVkPart = (vkParts) => {
        for (const key of [
            "send_user_info_stats",
            "force_send_user_info",
            "send_user_info_on_localhost",
            "send_navigation_stats_in_spa",
            "log_send_user_info_errors",
            "web_mytracker_collect_post_stats",
            "web_stats_device_id",
            "web_stats_reduce_debounce",
            "web_stats_send_beacon",
            "web_stats_send_on_events_limit",
            "web_stats_transport_story_view",
            "sentry_js_web_request_timeouts_feature",
            "sentry_js_web_request_timeouts_forwarding",
            "sentry_js_web_timeouts_forwarding",
            "sentry_js_web_verbose",
            "sentry_log_network_errors",
            "ads_app_form_link_redirect",
            "ads_autopromotion_web_geo",
            "ads_easy_promote_goods_new_create_api",
            "ads_light_methods_protection",
            "ads_market_autopromotion_bookmarks_stats",
            "ads_use_vk_community_video_portrait_4_5",
            "clips_web_my_tracker",
            "feed_post_track_code_client_web",
            "games_send_track_visitor_activity",
            "js_errors_no_write_uncaught_errors",
            "tgb_adblock_protection",
            "post_adblock_protection_promo",
            "eager_error_monitoring",
            "mini_apps_performance_close_app_empty_event",
            "mini_apps_performance_iframe_errors",
            "mini_apps_performance_web",
            "mini_apps_send_my_tracker_activity",
            "post_click_analytics_int_ext_link_click_web",
            "posting_track_event_count",
            "unique_adblock_users",
            "audio_my_tracker_web",
            "mini_apps_send_stat_arguments_bridge_events_sdk",
            "ajax_request_parse_html_error"
        ]) {
            delete vkParts[key];
        }
    };

    const modifyAudioAdsConfig = (audioAdsConfig) => {
        if (audioAdsConfig) {
            Object.defineProperties(audioAdsConfig, {
                'enabled': {
                    value: false,
                    writable: false,
                    configurable: false,
                    enumerable: false
                },
                'day_limit_reached': {
                    value: false,
                    writable: false,
                    configurable: false,
                    enumerable: false
                },
            });
        }
    };

    const modifyErrorMonitoringConfig = (errorMonitoringConfig) => {
        Object.defineProperties(errorMonitoringConfig, {
            'dsn': {
                value: 'http://127.0.0.1',
                writable: false,
                configurable: false,
                enumerable: false
            },
        });
    };

    const modifyAdParams = (adParams) => {
        Object.defineProperties(adParams, {
            'ads_can_show': {
                value: 0,
                writable: false,
                configurable: false,
                enumerable: false
            },
            'leftads': {
                value: '',
                writable: false,
                configurable: false,
                enumerable: false
            },
            'wsTransport': {
                value: 'http://127.0.0.1',
                writable: false,
                configurable: false,
                enumerable: false
            },
            'ads_rotate_interval': {
                value: Number.MAX_SAFE_INTEGER,
                writable: false,
                configurable: false,
                enumerable: false
            }
        });
    };

    const modifyWindowProperties = () => {
        const properties = {
            noAds: true,
            noAdsAtAll: true,
            no_left_ads: true,
            no_ads: true,
            isNoAdsForce: true,
            hide_ad: true,
            ya_direct: false,
            yaDirectAdActive: false
        };

        for (const prop in properties) {
            if (!(prop in window)) {
                Object.defineProperty(window, prop, {
                    value: properties[prop],
                    writable: false,
                    configurable: false,
                    enumerable: false
                });
            }
        }
    };

    function decodeLink(link) {
        const httpOffset = link.search("http%3A%2F%2F");
        const httpsOffset = link.search("https%3A%2F%2F");
        const postOffset = link.search(/&post=/g);
        const ccKeyOffset = link.search(/&cc_key=/g);
        const offset = httpsOffset !== -1 ? httpsOffset : httpOffset;

        if (postOffset === -1 && ccKeyOffset === -1) {
            return decodeURIComponent(link.substring(offset));
        } else if (postOffset !== -1 && ccKeyOffset === -1) {
            return decodeURIComponent(link.substring(offset, postOffset));
        } else if (postOffset === -1 && ccKeyOffset !== -1) {
            return decodeURIComponent(link.substring(offset, ccKeyOffset));
        } else {
            const endOffset = Math.min(postOffset, ccKeyOffset);
            return decodeURIComponent(link.substring(offset, endOffset));
        }
    }

    function remaway() {
        const links = document.getElementsByTagName("a");

        for (let i = 0; i < links.length; i++) {
            if (links[i].href.match(/away.php/)) {
                links[i].href = decodeLink(links[i].href);
            }
        }
    }

    if (window.vk) {
        modifyVkPart(window.vk.pe);
        modifyAudioAdsConfig(window.vk.audioAdsConfig);
        modifyErrorMonitoringConfig(window.vk.cfg.error_monitoring_config);
        modifyAdParams(window.vk);
        modifyWindowProperties();

        onChangeVKPart(modifyVkPart);
        onChangeAudioAdsConfig(modifyAudioAdsConfig);
        onChangeErrorMonitoringConfig(modifyErrorMonitoringConfig);

        if (window.AdsLight) {
            window.AdsLight.isNoAdsForce();
        }

        window.__adsSet = function () { };
        window.__adsUpdate = function () { };
    }

    setInterval(remaway, window.navigator?.hardwareConcurrency ? (30_000 / navigator.hardwareConcurrency) : 30_000);
})();
