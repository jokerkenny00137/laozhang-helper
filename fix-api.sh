#!/bin/bash
sed -i "s/assistantId: '.*'/assistantId: '2055110454115566656'/" /var/www/html/js/chat.js
sed -i "s/appKey: '.*'/appKey: 'oKmFAEybU7IkzqWmNbdTdyv4KMLifhY'/" /var/www/html/js/chat.js
sed -i "s/userId: '.*'/userId: '70831129c3034bc79c80c420d1e61345'/" /var/www/html/js/chat.js
echo "API配置已更新"
