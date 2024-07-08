// ==UserScript==
// @name         VK Ads Fixes
// @name:ru      Правки рекламы ВКонтакте
// @name:uk      Правки реклами ВКонтакте
// @namespace    https://vtosters.app/
// @version      1.9
// @description  This script applies several fixes to the adblock filter on VK, aiming to speed up site loading and enhance overall performance.
// @description:ru Этот скрипт вносит несколько исправлений в фильтр adblock в VK, чтобы ускорить загрузку сайта и повысить общую производительность.
// @description:uk Цей скрипт вносить кілька виправлень у фільтр adblock у VK, щоб прискорити завантаження сайту і підвищити загальну продуктивність.
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
                interaction.listeners.forEach(callback => {
                    try {
                        callback(vkValue);
                    } catch (e) {
                        console.error(e);
                    }
                });
                return true;
            },
            configurable: true,
        });
    };

    let inited = false;
    const onAddNewCallback = async (callback) => {
        if (!inited) {
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
        const fieldInteraction = new InteractionListener();

        const hookField = (vkValue) => {
            let fieldValue = vkValue[fieldName];

            Object.defineProperty(vkValue, fieldName, {
                get: () => fieldValue,
                set: (newValue) => {
                    fieldValue = newValue;
                    fieldInteraction.listeners.forEach(callback => {
                        try {
                            callback(fieldValue);
                        } catch (e) {
                            console.error(e);
                        }
                    });
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
            const listener = fieldInteraction.addListener(callback);
            onAddNewCallback(callback);
            return listener;
        };

        return onChangeField;
    };

    const onChangeVKPart = createOnChangeVKField("pe");
    const onChangeAudioAdsConfig = createOnChangeVKField("audioAdsConfig");
    const onChangeErrorMonitoringConfig = createOnChangeVKField("cfg");

    const modifyVkPart = (vkParts) => {
        Object.keys(vkParts).forEach((key) => {
            if (isVkPart(key)) delete vkParts[key];
        });
    };

    const modifyAudioAdsConfig = (audioAdsConfig) => {
        if (audioAdsConfig) {
            Object.defineProperties(audioAdsConfig, {
                'enabled': {
                    value: false
                },
                'day_limit_reached': {
                    value: false
                },
            });
        }
    };

    const modifyErrorMonitoringConfig = (errorMonitoringConfig) => {
        Object.defineProperty(errorMonitoringConfig, 'dsn', {
            value: 'http://127.0.0.1'
        });
    };

    const modifyAdParams = (adParams) => {
        Object.defineProperties(adParams, {
            'ads_can_show': {
                value: 0
            },
            'leftads': {
                value: ''
            },
            'wsTransport': {
                value: 'http://127.0.0.1'
            },
            'ads_rotate_interval': {
                value: Number.MAX_SAFE_INTEGER
            }
        });
    };

    const modifyWindowProperties = () => {
        Object.defineProperties(window, {
            noAds: {
                value: true
            },
            noAdsAtAll: {
                value: true
            },
            no_left_ads: {
                value: true
            },
            no_ads: {
                value: true
            },
            isNoAdsForce: {
                value: true
            },
            hide_ad: {
                value: true
            },
            ya_direct: {
                value: false
            },
            yaDirectAdActive: {
                value: false
            }
        });
    };

    function isVkPart(prop) {
        const vkPartsList = [
            "send_user_info_stats", "force_send_user_info", "send_user_info_on_localhost",
            "send_navigation_stats_in_spa", "log_send_user_info_errors", "web_mytracker_collect_post_stats",
            "web_stats_device_id", "web_stats_reduce_debounce", "web_stats_send_beacon",
            "web_stats_send_on_events_limit", "web_stats_transport_story_view", "sentry_js_web_request_timeouts_feature",
            "sentry_js_web_request_timeouts_forwarding", "sentry_js_web_timeouts_forwarding", "sentry_js_web_verbose",
            "sentry_log_network_errors", "ads_app_form_link_redirect", "ads_autopromotion_web_geo",
            "ads_easy_promote_goods_new_create_api", "ads_light_methods_protection", "ads_market_autopromotion_bookmarks_stats",
            "ads_use_vk_community_video_portrait_4_5", "clips_web_my_tracker", "feed_post_track_code_client_web",
            "games_send_track_visitor_activity", "js_errors_no_write_uncaught_errors", "tgb_adblock_protection",
            "post_adblock_protection_promo", "eager_error_monitoring", "mini_apps_performance_close_app_empty_event",
            "mini_apps_performance_iframe_errors", "mini_apps_performance_web", "mini_apps_send_my_tracker_activity",
            "post_click_analytics_int_ext_link_click_web", "posting_track_event_count", "unique_adblock_users",
            "audio_my_tracker_web", "mini_apps_send_stat_arguments_bridge_events_sdk", "ajax_request_parse_html_error",
            "js_errors_no_write_uncaught_errors", "tns_track_sections", "tns_track_hosts", "geminus_counter",
            "ads_pixels_track_new_events_web_mvk", "web_navigation_handlers", "measure_module_navigation_stats",
            "group_join_track_event_count", "feed_content_events_open_post_event_web", "feed_posts_duration_stats_fix",
            "collect_unsupported_user_info_stats", "log_fetch_requests", "log_fetch_requests_get",
            "post_adguard_protection_promo", "extended_ajax_logging", "messenger_mediascope_stats_collect",
            "audio_player_stats_web"
        ];
        return vkPartsList.includes(prop);
    }

    function removeAway() {
        const links = document.querySelectorAll("a[href*='away.php']");

        links.forEach(link => {
            const url = new URL(link.href);
            if (url.pathname.endsWith("away.php")) {
                const newHref = url.searchParams.get("to");
                if (newHref) {
                    link.href = newHref;
                }
            }
        });
    }

    function removeElementById(id) {
        const element = document.getElementById(id);
        if (element) {
            console.log(`Removing element with id: ${id}`);
            element.remove();
        }
    }

    function removeBlocks(blockClass) {
        const blocks = document.querySelectorAll(`div.${blockClass}`);
        blocks.forEach(block => {
            console.log(`Removing block with id: ${block.id}`);
            block.remove();
        });
    }

    function clearFunctions(obj) {
        Object.keys(obj).forEach((prop) => {
            if (typeof obj[prop] === 'function') {
                try {
                    Object.defineProperty(obj, prop, {
                        value: function () { }
                    });
                } catch (error) {
                    console.error(`Failed to clear function: ${prop}`, error);
                }
            }
        });
    }

    if (window.AdsLight) {
        clearFunctions(window.AdsLight);
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

        window.__adsSet = function () { };
        window.__adsUpdate = function () { };
    }

    setInterval(() => {
        removeAway();
        removeBlocks('_ads_block_data_w');
        removeElementById('ads_left');
        if (window.AdsLight) {
            clearFunctions(window.AdsLight);
        }
    }, window.navigator?.hardwareConcurrency ? (30000 / navigator.hardwareConcurrency) : 30000);
})();
