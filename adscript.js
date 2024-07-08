// ==UserScript==
// @name         VK Ads Fixes
// @name:ru      Правки рекламы ВКонтакте
// @name:uk      Правки реклами ВКонтакте
// @namespace    https://vtosters.app/
// @version      1.6
// @description  This script applies several fixes to the adblock filter on VK, aiming to speed up site loading and enhance overall performance.
// @description:ru Этот скрипт вносит несколько исправлений в фильтр adblock в VK, чтобы ускорить загрузку сайта и повысить общую производительность.
// @description:uk Цей скрипт вносить кілька виправлень у фільтр adblock у VK, щоб прискорити завантаження сайту і підвищити загальну продуктивність.
// @author       gdlbo
// @match        https://vk.com/*
// @match        https://vk.ru/*
// @grant        none
// @run-at       document-start
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
        vkParts.keys()
            .forEach((key) => {
                if(isVkPart(key))delete vkParts[key];
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
        Object.defineProperties(errorMonitoringConfig, {
            'dsn': {
                value: 'http://127.0.0.1'
            },
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
        return (
            prop === "send_user_info_stats"
            || prop === "force_send_user_info"
            || prop === "send_user_info_on_localhost"
            || prop === "send_navigation_stats_in_spa"
            || prop === "log_send_user_info_errors"
            || prop === "web_mytracker_collect_post_stats"
            || prop === "web_stats_device_id"
            || prop === "web_stats_reduce_debounce"
            || prop === "web_stats_send_beacon"
            || prop === "web_stats_send_on_events_limit"
            || prop === "web_stats_transport_story_view"
            || prop === "sentry_js_web_request_timeouts_feature"
            || prop === "sentry_js_web_request_timeouts_forwarding"
            || prop === "sentry_js_web_timeouts_forwarding"
            || prop === "sentry_js_web_verbose"
            || prop === "sentry_log_network_errors"
            || prop === "ads_app_form_link_redirect"
            || prop === "ads_autopromotion_web_geo"
            || prop === "ads_easy_promote_goods_new_create_api"
            || prop === "ads_light_methods_protection"
            || prop === "ads_market_autopromotion_bookmarks_stats"
            || prop === "ads_use_vk_community_video_portrait_4_5"
            || prop === "clips_web_my_tracker"
            || prop === "feed_post_track_code_client_web"
            || prop === "games_send_track_visitor_activity"
            || prop === "js_errors_no_write_uncaught_errors"
            || prop === "tgb_adblock_protection"
            || prop === "post_adblock_protection_promo"
            || prop === "eager_error_monitoring"
            || prop === "mini_apps_performance_close_app_empty_event"
            || prop === "mini_apps_performance_iframe_errors"
            || prop === "mini_apps_performance_web"
            || prop === "mini_apps_send_my_tracker_activity"
            || prop === "post_click_analytics_int_ext_link_click_web"
            || prop === "posting_track_event_count"
            || prop === "unique_adblock_users"
            || prop === "audio_my_tracker_web"
            || prop === "mini_apps_send_stat_arguments_bridge_events_sdk"
            || prop === "ajax_request_parse_html_error"
            || prop === "js_errors_no_write_uncaught_errors"
            || prop === "tns_track_sections"
            || prop === "tns_track_hosts"
            || prop === "geminus_counter"
            || prop === "ads_pixels_track_new_events_web_mvk"
            || prop === "web_navigation_handlers"
            || prop === "measure_module_navigation_stats"
            || prop === "group_join_track_event_count"
            || prop === "feed_content_events_open_post_event_web"
            || prop === "feed_posts_duration_stats_fix"
            || prop === "collect_unsupported_user_info_stats"
            || prop === "log_fetch_requests"
            || prop === "log_fetch_requests_get"
            || prop === "post_adguard_protection_promo"
            || prop === "extended_ajax_logging"
            || prop === "messenger_mediascope_stats_collect"
            || prop === "audio_player_stats_web"
        );
    }

    function removeAway() {
        const links = document.getElementsByTagName("a");
        for (let i = 0; i < links.length; i++) {
            const url = new URL(links[i].href);
            if(url.pathname.endsWith("away.php")) {
                links[i].href = url.searchParams.get("to");
            }
        }
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
        Object.getOwnPropertyNames(obj)
            .filter((prop) => typeof obj[prop] === 'function')
            .forEach((prop) => {
                try {
                    Object.defineProperty(obj, prop, {
                        value: function () { }
                    });
                } catch (error) {
                    console.error(`Failed to clear function: ${prop}`, error);
                }
            })
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
            clearFunctions(window.AdsLight);
        }

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
    }, window.navigator?.hardwareConcurrency ? (30_000 / navigator.hardwareConcurrency) : 30_000);
})();