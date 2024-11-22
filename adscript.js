// ==UserScript==
// @name      VK Ads Fixes
// @name:ru      Правки рекламы ВКонтакте
// @name:uk      Правки реклами ВКонтакте
// @namespace    https://vtosters.app/
// @version      2.2
// @description Script for blocking ads in VK (VKontakte), bypassing blocking detection, etc.
// @description:ru Скрипт для блокировки рекламы в VK (ВКонтакте), обхода обнаружения блокировки и т.д.
// @description:uk Скрипт для блокування реклами у VK (ВКонтакті), обходу виявлення блокування тощо.
// @author       gdlbo, Vologhat
// @match        https://vk.com/*
// @match        https://vk.ru/*
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/518509/VK%20Ads%20Fixes.user.js
// @updateURL https://update.greasyfork.org/scripts/518509/VK%20Ads%20Fixes.meta.js
// ==/UserScript==

(() => {
    "use strict"

    class VkPeProperties
    {
        static #KEYS=[
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

        static isValidProperty(key)
        { return key in this.#KEYS }
    }

    //hook vk
    let actualVk=window.vk
    const vkHooks=new Set();
    Object.defineProperty(window,"vk", {
        get:() => actualVk,
        set:(value) => {
            actualVk=value
            if(actualVk)vkHooks.forEach( hook => hook(actualVk))
            return true
        },
        configurable:true
    })

    //hook vk properties
    const createAndPerformVkPropHook=(key,hookfn) => {
        //hook when vk redefines
        vkHooks.add(vk => {
            if(vk&&vk[key])hookfn(vk[key])
            
            //hook when property redefines
            let actualProp=vk[key]
            Object.defineProperty(vk,key, {
                get:() => actualProp,
                set:(value) => {
                    actualProp=value
                    hookfn(actualProp)
                    return true
                },
                configurable:true,
                enumerable:true
            })
        })
    }

    //remove properties from vk.pe hook
    createAndPerformVkPropHook("pe",pe => {
        console.log("patch pe")
        
        Object.keys(pe)
            .filter(key => VkPeProperties.isValidProperty(key))
            .forEach(key => delete window.vk.pe[key])
    })

    //patch vk.AudioAdsConfig hook
    createAndPerformVkPropHook("audioAdsConfig",audioAdsConfig => {
        console.log("patch audioAdsConfig")
        
        Object.defineProperties(audioAdsConfig, {
            enabled: {
                value:false
            },
            day_limit_reached: {
                value:false
            },
            sections: {
                value:[]
            }
        })
    })

    //disable error monitor DSN hook
    createAndPerformVkPropHook("cfg",cfg => {
        console.log("disable error monitoring DSN")
        
        Object.defineProperty(cfg.error_monitoring_config,"dsn", {
            value:"http://127.0.0.1"
        })
    })

    //patch vk.adParams hook
    createAndPerformVkPropHook("adParams",adParams => {
        console.log("patch adParams")
  
        Object.defineProperties(adParams, {
            ads_can_show: {
                value:0
            },
            leftads: {
                value:""
            },
            wsTransport: {
                value:"http://127.0.0.1"
            },
            ads_rotate_interval: {
                vallue:Number.MAX_SAFE_INTEGER
            }
        })
    })

    //trigger vk and properties hooks
    window.vk=window.vk

    setInterval(() => {
        //replace "away.php" url to the redirect url
        document.querySelectorAll("a[href*='away.php']")
            .forEach(a => {
                const url=URL.parse(a.href)
                if(!url.pathname.endsWith("away.php"))return
                //find a search parameter with valid redirect url
                url.searchParams.forEach((value) => {
                    if(URL.canParse(value))
                    {
                        a.href=value
                        return
                    }
                })
            })

        //remove _ads_block_data_w blocks
        document.querySelectorAll("div._ads_block_data_w")
            .forEach(div => {
                console.log(`Remove block with id ${div.id}]`)
                div.remove()
            })

        //remove ads_left block
        const adsLeft=document.getElementById("ads_left")
        if(adsLeft)
        {
            console.log("Remove block with id: ads_left")
            adsLeft.remove()
        }

        //clear all AdsLight functions
        if(window.AdsLight)
            Object.keys(window.AdsLight)
                .filter(key => typeof window.AdsLight[key]==="function")
                .forEach(key => Object.defineProperty(window.AdsLight,key, {
                    value:() => {}
                }))

        //patch window ads properties
        Object.defineProperties(window, {
            noAds: {
                value:true,
                configurable:true
            },
            noAdsAtAll: {
                value:true,
                configurable:true
            },
            no_left_ads: {
                value:true,
                configurable:true
            },
            no_ads: {
                value:true,
                configurable:true
            },
            isNoAdsForce: {
                value:true,
                configurable:true
            },
            hide_ad: {
                value:true,
                configurable:true
            },
            ya_direct: {
                value:false,
                configurable:true
            },
            yaDIrectAdActive: {
                value:false,
                configurable:true
            },
            __adsSet: {
                value:() => {},
                configurable:true
            },
            __adsUpdate: {
                value:() => {},
                configurable:true
            },
            AdmanHTML: {
                value:false,
                configurable:true
            },
            audioAdsConfig: {
                value:false,
                configurable:true
            },
            __adsGetAjaxParams: {
                value:() => {},
                configurable:true
            },
            __adsLoader: {
                value:() => {},
                configurable:true
            },
        })
    },30000/navigator.hardwareConcurrency)
})();
