<?php
/**
 * Plugin Name: DG Chatyr Widget
 * Description: Чат на сайте datageneral.kz через Chatyr (app.chatyr.kz).
 * Version: 1.0.0
 */
if (!defined('ABSPATH')) exit;
add_action('wp_footer', function () {
    if (is_admin()) return;
    ?>
<script>
(function(d,t){var BASE_URL="https://app.chatyr.kz";var g=d.createElement(t),s=d.getElementsByTagName(t)[0];g.src=BASE_URL+"/packs/js/sdk.js";g.async=true;g.defer=true;s.parentNode.insertBefore(g,s);g.onload=function(){window.chatwootSettings={locale:"ru",position:"right",type:"standard"};window.chatwootSDK.run({websiteToken:"Aj2QgT9brUF1MfAMNYF1aGqP",baseUrl:BASE_URL});};})(document,"script");
</script>
    <?php
}, 99);
