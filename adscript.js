// ==UserScript==
// @name         VK Ads Fixes
// @namespace    https://vtosters.app/
// @version      0.2
// @description  This script applies several fixes to the adblock filter on VK, aiming to speed up site loading and enhance overall performance.
// @author       gdlbo
// @match        https://vk.com/*
// @match        https://vk.ru/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function modifyVkObject() {
        if (window.vk) {
            // Set the ad rotation interval to the maximum safe integer value to prevent ad load
            Object.defineProperty(window.vk, 'ads_rotate_interval', {
                value: Number.MAX_SAFE_INTEGER,
                writable: false,
            });

            if (window.vk.audioAdsConfig) {
                // Disable audio ads and set day limit as reached
                Object.defineProperties(window.vk.audioAdsConfig, {
                    'enabled': {
                        value: false,
                        writable: false,
                    },
                    'sections': {
                        value: [],
                        writable: false,
                    },
                    'day_limit_reached': {
                        value: false,
                        writable: false,
                    },
                });
            }

            // Disable sending user info stats and navigation stats in SPA
            Object.defineProperties(window.vk.pe, {
                'send_user_info_stats': {
                    value: 0,
                    writable: false,
                },
                'force_send_user_info': {
                    value: 0,
                    writable: false,
                },
                'send_user_info_on_localhost': {
                    value: 0,
                    writable: false,
                },
                'send_navigation_stats_in_spa': {
                    value: 0,
                    writable: false,
                },
                'log_send_user_info_errors': {
                    value: 0,
                    writable: false,
                },
            });

            // Set error monitoring config to localhost to prevent sending error data
            Object.defineProperties(window.vk.cfg.error_monitoring_config, {
                'dsn': {
                    value: 'http://127.0.0.1',
                    writable: false,
                },
            });

            // Disable ads and stats to localhost
            Object.defineProperties(window.vk, {
                'ads_can_show': {
                    value: 0,
                    writable: false,
                },
                'leftads': {
                    value: '',
                    writable: false,
                },
                'wsTransport': {
                    value: 'http://127.0.0.1',
                    writable: false,
                },
            });
        }

        // Check if the AdsLight object exists in the global scope
        if (window.AdsLight) {
            // Force no ads
            window.AdsLight.isNoAdsForce();
        }

        // Override ads-related functions with empty functions
        window.__adsSet = function () { };
        window.__adsUpdate = function () { };

        // Set flags to disable ads
        window.noAds = true;
        window.noAdsAtAll = true;
        window.no_left_ads = true;
        window.no_ads = true;
        window.isNoAdsForce = true;
        window.hide_ad = true;
        window.ya_direct = false;
        window.yaDirectAdActive = false;
    }

    modifyVkObject();

    const interval = window.navigator?.hardwareConcurrency ? 30_000 / navigator.hardwareConcurrency : 30_000;

    setInterval(modifyVkObject, interval);
})();
