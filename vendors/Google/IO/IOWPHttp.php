<?php

namespace Pnpnd\ND\Google\IO;

use Pnpnd\ND\Google\Client;
use Pnpnd\ND\Google\Http\HttpRequest;

/*
 * Copyright 2014 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress HTTP API based implementation of IO.
 *
 * Routes all HTTP requests through the WordPress HTTP API (wp_remote_request).
 */
class IOWPHttp extends IOAbstract
{
    private $options = [];

    private static $DEFAULT_OPTIONS = [
        'timeout'     => 90,
        'redirection' => 0,
        'sslverify'   => true,
        'httpversion' => '1.1',
    ];

    public function __construct(Client $client)
    {
        parent::__construct($client);
    }

    public function getHandler()
    {
        return null;
    }

    /**
     * Execute an HTTP Request
     *
     * @param HttpRequest $request the http request to be executed
     * @return array containing response headers, body, and http code
     * @throws IOException on IO error
     */
    public function executeRequest(HttpRequest $request)
    {
        $url    = $request->getUrl();
        $method = $request->getRequestMethod();
        $body   = $request->getPostBody();

        $args = array_merge(
            self::$DEFAULT_OPTIONS,
            $this->options
        );

        $args['method']  = $method;
        $args['headers'] = $request->getRequestHeaders() ?: [];
        $args['user-agent'] = $request->getUserAgent();

        if ($body && in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'], true)) {
            $args['body'] = $body;
        }

        if ($request->canGzip()) {
            $args['headers']['Accept-Encoding'] = 'gzip,deflate';
        }

        if (defined('FORCE_CURL_HTTP_VERSION_1_1') && FORCE_CURL_HTTP_VERSION_1_1 === true) {
            $args['httpversion'] = '1.1';
        }

        $this->client->getLogger()->debug(
            'WP HTTP request',
            [
                'url'     => $url,
                'method'  => $method,
                'headers' => $args['headers'],
                'body'    => $body,
            ]
        );

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $error_code    = $response->get_error_code();

            $this->client->getLogger()->error('WP HTTP error: ' . $error_message);

            $map = $this->client->getClassConfig('IOException', 'retry_map');

            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
            throw new IOException(esc_html($error_message), intval($error_code), null, $map);
        }

        $responseCode    = wp_remote_retrieve_response_code($response);
        $responseBody    = wp_remote_retrieve_body($response);
        $rawHeaders      = wp_remote_retrieve_headers($response);

        $responseHeaders = $this->normalizeHeaders($rawHeaders);

        $this->client->getLogger()->debug(
            'WP HTTP response',
            [
                'code'    => $responseCode,
                'headers' => $responseHeaders,
                'body'    => $responseBody,
            ]
        );

        return [$responseBody, $responseHeaders, $responseCode];
    }

    /**
     * Set options that update the transport implementation's behavior.
     */
    public function setOptions($options)
    {
        $this->options = $options + $this->options;
    }

    public function getOptions()
    {
        return $this->options;
    }

    public function setDefaultOptions()
    {
        $this->options = [];

        $timeout = $this->client->getClassConfig('IOAbstract', 'request_timeout_seconds');
        if ($timeout > 0) {
            $this->setTimeout($timeout);
        }
    }

    /**
     * Set the maximum request time in seconds.
     */
    public function setTimeout($timeout)
    {
        $this->options['timeout'] = $timeout;
    }

    /**
     * Get the maximum request time in seconds.
     *
     * @return timeout in seconds
     */
    public function getTimeout()
    {
        return isset($this->options['timeout']) ? $this->options['timeout'] : self::$DEFAULT_OPTIONS['timeout'];
    }

    /**
     * No cURL header processing bug exists with the WP HTTP API.
     *
     * @return boolean
     */
    protected function needsQuirk()
    {
        return false;
    }

    /**
     * Normalize WP HTTP API headers to a plain associative array with lowercase keys.
     *
     * @param array|object $rawHeaders
     * @return array
     */
    private function normalizeHeaders($rawHeaders)
    {
        if (is_array($rawHeaders)) {
            $headers = $rawHeaders;
        } elseif (is_object($rawHeaders) && method_exists($rawHeaders, 'getAll')) {
            $headers = $rawHeaders->getAll();
        } elseif (is_object($rawHeaders) && method_exists($rawHeaders, 'getIterator')) {
            $headers = iterator_to_array($rawHeaders);
        } else {
            return [];
        }

        return array_change_key_case($headers, CASE_LOWER);
    }
}
