// ==UserScript==
// @name         VK Ads Fixes
// @namespace    https://vtosters.app/
// @version      0.1
// @description  This script applies several fixes to the adblock filter on VK, aiming to speed up site loading and enhance overall performance.
// @author       gdlbo
// @match        https://vk.com/*
// @match        https://vk.ru/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to modify the VK object and disable ads-related properties
    function modifyVkObject() {
        // Check if the VK object exists in the global scope
        if (window.vk) {
            // Set ads rotation interval to the maximum safe integer value
            window.vk.ads_rotate_interval = Number.MAX_SAFE_INTEGER;

            if (window.vk.audioAdsConfig) {
                // Disable audio ads and reset related properties
                window.vk.audioAdsConfig.enabled = false;
                window.vk.audioAdsConfig.sections = [];
                window.vk.audioAdsConfig.day_limit_reached = false;
            }

            // Disable user info stats and other related properties
            window.vk.pe.send_user_info_stats = 0;
            window.vk.pe.force_send_user_info = 0;
            window.vk.pe.send_user_info_on_localhost = 0;
            window.vk.pe.send_navigation_stats_in_spa = 0;
            window.vk.pe.log_send_user_info_errors = 0;

            // Disable left ads
            window.vk.ads_can_show = 0;
            window.vk.leftads = "";

            // Disable stats by setting the transport URL to localhost
            window.vk.wsTransport = "http://127.0.0.1";
        }

        // Check if the AdsLight object exists in the global scope
        if (window.AdsLight) {
            // Force no ads
            window.AdsLight.isNoAdsForce();
        }

        // Override ads-related functions with empty functions
        window.__adsSet = function() {};
        window.__adsUpdate = function() {};

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

    // Apply modifications immediately
    modifyVkObject();

    // Check for changes to the `vk` object every 30 seconds and reapply modifications
    setInterval(() => {
        modifyVkObject();
    }, 30000);
})();