# 老张工艺助手 - Docker 部署配置
# 使用 PHP-Apache 基础镜像

FROM php:8.1-apache

# 启用 Apache mod_rewrite
RUN a2enmod rewrite

# 设置工作目录
WORKDIR /var/www/html

# 复制项目文件
COPY . /var/www/html/

# 创建上传目录并设置权限
RUN mkdir -p /var/www/html/api/uploads && \
    chown -R www-data:www-data /var/www/html/api/uploads && \
    chmod -R 777 /var/www/html/api/uploads && \
    chmod 666 /var/www/html/api/config.json 2>/dev/null || true

# 增加 PHP 上传限制，避免音频/大文件上传被服务器拒绝
RUN echo "upload_max_filesize = 20M\npost_max_size = 20M\nmemory_limit = 256M\nmax_file_uploads = 20" > /usr/local/etc/php/conf.d/uploads.ini

# 配置 Apache 允许 .htaccess
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/conf-available/docker-php.conf

# 暴露端口
EXPOSE 80

# 启动 Apache
CMD ["apache2-foreground"]
